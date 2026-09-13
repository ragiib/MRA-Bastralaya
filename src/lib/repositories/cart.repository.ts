import { query, queryOne } from '../db';
import { CartItem, CartItemProduct, GuestCartItemInput } from '@/types/cart';
import { DepartmentType, ProductStatusType } from '@/data/adminProductOptions';
import crypto from 'node:crypto';

interface CartItemRow {
  cart_item_id: string;
  product_id: string;
  quantity: number;
  price_at_add: number | string;
  cart_created_at: string | Date;
  cart_updated_at: string | Date;
  prod_id: string;
  prod_name: string;
  department: string;
  category: string;
  category_slug: string;
  price: number | string;
  sale_price: number | string | null;
  stock_quantity: number;
  status: string;
  images: string;
  fabric: string | null;
  color: string | null;
}

interface ProductDbRow {
  id: string;
  name: string;
  department: string;
  category: string;
  category_slug: string;
  price: number | string;
  sale_price: number | string | null;
  stock_quantity: number;
  status: string;
  images: string;
  fabric: string | null;
  color: string | null;
}

function formatDate(val: string | Date): string {
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

function mapRowToCartItem(row: CartItemRow): CartItem {
  let images: string[] = [];
  try {
    images = JSON.parse(row.images);
    if (!Array.isArray(images)) images = [];
  } catch {
    images = row.images ? [row.images] : [];
  }

  const product: CartItemProduct = {
    id: row.prod_id,
    name: row.prod_name,
    department: row.department as DepartmentType,
    category: row.category,
    categorySlug: row.category_slug,
    price: Number(row.price),
    salePrice: row.sale_price !== null && row.sale_price !== undefined ? Number(row.sale_price) : null,
    stock: Number(row.stock_quantity),
    status: row.status as ProductStatusType,
    images,
    fabric: row.fabric || undefined,
    color: row.color || undefined,
  };

  return {
    id: row.cart_item_id,
    productId: row.product_id,
    quantity: Number(row.quantity),
    priceAtAdd: Number(row.price_at_add),
    product,
    createdAt: formatDate(row.cart_created_at),
    updatedAt: formatDate(row.cart_updated_at),
  };
}

export const CartRepository = {
  /**
   * Retrieves all cart items for a customer from the PostgreSQL database.
   */
  async getItems(userId: string): Promise<CartItem[]> {
    const rows = await query<CartItemRow>(
      `SELECT 
        c.id as cart_item_id,
        c.product_id,
        c.quantity,
        c.price_at_add,
        c.created_at as cart_created_at,
        c.updated_at as cart_updated_at,
        p.id as prod_id,
        p.name as prod_name,
        p.department,
        p.category,
        p.category_slug,
        p.price,
        p.sale_price,
        p.stock_quantity,
        p.status,
        p.images,
        p.fabric,
        p.color
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at ASC`,
      [userId]
    );

    return rows.map(mapRowToCartItem);
  },

  /**
   * Adds an item to the customer's server-side cart.
   * Enforces that draft or sold-out items cannot be added, and caps quantity at available stock.
   */
  async addItem(
    userId: string,
    productId: string,
    quantity: number,
    priceAtAdd?: number
  ): Promise<CartItem[]> {
    const prod = await queryOne<ProductDbRow>(
      "SELECT * FROM products WHERE id = $1 AND status != 'Draft' LIMIT 1",
      [productId]
    );

    if (!prod) {
      throw new Error('Product not found or currently unavailable.');
    }

    if (prod.status === 'Sold Out' || Number(prod.stock_quantity) <= 0) {
      throw new Error('This item is currently Sold Out and cannot be added to your cart.');
    }

    const availableStock = Number(prod.stock_quantity);
    const unitPrice =
      typeof priceAtAdd === 'number' && priceAtAdd > 0
        ? priceAtAdd
        : prod.sale_price !== null && Number(prod.sale_price) < Number(prod.price)
        ? Number(prod.sale_price)
        : Number(prod.price);

    const existing = await queryOne<{ id: string; quantity: number }>(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2 LIMIT 1',
      [userId, productId]
    );

    if (existing) {
      const newQty = Math.min(Number(existing.quantity) + Math.max(1, quantity), availableStock);
      await query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newQty, existing.id]
      );
    } else {
      const addQty = Math.min(Math.max(1, quantity), availableStock);
      const id = `ci-${crypto.randomUUID()}`;
      await query(
        `INSERT INTO cart_items (id, user_id, product_id, quantity, price_at_add)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, userId, productId, addQty, unitPrice]
      );
    }

    return this.getItems(userId);
  },

  /**
   * Updates the quantity of an item in the customer's cart.
   * Removes the item if quantity <= 0.
   */
  async updateQuantity(userId: string, productId: string, quantity: number): Promise<CartItem[]> {
    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }

    const prod = await queryOne<{ stock_quantity: number }>(
      'SELECT stock_quantity FROM products WHERE id = $1 LIMIT 1',
      [productId]
    );

    const availableStock = prod ? Number(prod.stock_quantity) : quantity;
    const finalQty = Math.min(quantity, Math.max(1, availableStock));

    await query(
      `UPDATE cart_items 
       SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $2 AND product_id = $3`,
      [finalQty, userId, productId]
    );

    return this.getItems(userId);
  },

  /**
   * Removes an item from the customer's cart.
   */
  async removeItem(userId: string, productId: string): Promise<CartItem[]> {
    await query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    return this.getItems(userId);
  },

  /**
   * Clears all items from the customer's cart.
   */
  async clearCart(userId: string): Promise<void> {
    await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
  },

  /**
   * Merges guest cart items into the authenticated customer's cart.
   */
  async mergeGuestCart(userId: string, guestItems: GuestCartItemInput[]): Promise<CartItem[]> {
    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      return this.getItems(userId);
    }

    for (const item of guestItems) {
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
        continue;
      }

      const prod = await queryOne<ProductDbRow>(
        "SELECT * FROM products WHERE id = $1 AND status != 'Draft' LIMIT 1",
        [item.productId]
      );

      if (!prod || prod.status === 'Sold Out' || Number(prod.stock_quantity) <= 0) {
        continue;
      }

      const availableStock = Number(prod.stock_quantity);
      const unitPrice =
        typeof item.priceAtAdd === 'number' && item.priceAtAdd > 0
          ? item.priceAtAdd
          : prod.sale_price !== null && Number(prod.sale_price) < Number(prod.price)
          ? Number(prod.sale_price)
          : Number(prod.price);

      const existing = await queryOne<{ id: string; quantity: number }>(
        'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2 LIMIT 1',
        [userId, item.productId]
      );

      if (existing) {
        const mergedQty = Math.min(
          Number(existing.quantity) + Number(item.quantity),
          availableStock
        );
        await query(
          'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [mergedQty, existing.id]
        );
      } else {
        const validQty = Math.min(Number(item.quantity), availableStock);
        const id = `ci-${crypto.randomUUID()}`;
        await query(
          `INSERT INTO cart_items (id, user_id, product_id, quantity, price_at_add)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, userId, item.productId, validQty, unitPrice]
        );
      }
    }

    return this.getItems(userId);
  },
};
