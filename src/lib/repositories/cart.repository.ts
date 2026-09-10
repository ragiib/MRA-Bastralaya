import { db } from '../db';
import { CartItem, CartItemProduct, GuestCartItemInput } from '@/types/cart';
import { DepartmentType, ProductStatusType } from '@/data/adminProductOptions';
import crypto from 'node:crypto';

interface CartItemRow {
  cart_item_id: string;
  product_id: string;
  quantity: number;
  price_at_add: number;
  cart_created_at: string;
  cart_updated_at: string;
  prod_id: string;
  prod_name: string;
  department: string;
  category: string;
  category_slug: string;
  price: number;
  sale_price: number | null;
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
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  status: string;
  images: string;
  fabric: string | null;
  color: string | null;
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
    salePrice: row.sale_price !== null ? Number(row.sale_price) : null,
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
    createdAt: row.cart_created_at,
    updatedAt: row.cart_updated_at,
  };
}

export const CartRepository = {
  /**
   * Retrieves all cart items for a customer from the database.
   */
  getItems(userId: string): CartItem[] {
    const stmt = db.prepare(`
      SELECT 
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
      WHERE c.user_id = ?
      ORDER BY c.created_at ASC
    `);

    const rows = stmt.all(userId) as CartItemRow[];
    return rows.map(mapRowToCartItem);
  },

  /**
   * Adds an item to the customer's server-side cart.
   * Enforces that draft or sold-out items cannot be added, and caps quantity at available stock.
   */
  addItem(
    userId: string,
    productId: string,
    quantity: number,
    priceAtAdd?: number
  ): CartItem[] {
    const prodStmt = db.prepare(
      "SELECT * FROM products WHERE id = ? AND status != 'Draft' LIMIT 1"
    );
    const prod = prodStmt.get(productId) as ProductDbRow | undefined;

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

    const existingStmt = db.prepare(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? LIMIT 1'
    );
    const existing = existingStmt.get(userId, productId) as
      | { id: string; quantity: number }
      | undefined;

    if (existing) {
      const newQty = Math.min(Number(existing.quantity) + Math.max(1, quantity), availableStock);
      db.prepare(
        'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(newQty, existing.id);
    } else {
      const addQty = Math.min(Math.max(1, quantity), availableStock);
      const id = `ci-${crypto.randomUUID()}`;
      db.prepare(`
        INSERT INTO cart_items (id, user_id, product_id, quantity, price_at_add)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, userId, productId, addQty, unitPrice);
    }

    return this.getItems(userId);
  },

  /**
   * Updates the quantity of an item in the customer's cart.
   * Removes the item if quantity <= 0.
   */
  updateQuantity(userId: string, productId: string, quantity: number): CartItem[] {
    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }

    const prod = db
      .prepare('SELECT stock_quantity FROM products WHERE id = ? LIMIT 1')
      .get(productId) as { stock_quantity: number } | undefined;

    const availableStock = prod ? Number(prod.stock_quantity) : quantity;
    const finalQty = Math.min(quantity, Math.max(1, availableStock));

    db.prepare(`
      UPDATE cart_items 
      SET quantity = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = ? AND product_id = ?
    `).run(finalQty, userId, productId);

    return this.getItems(userId);
  },

  /**
   * Removes an item from the customer's cart.
   */
  removeItem(userId: string, productId: string): CartItem[] {
    db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(
      userId,
      productId
    );
    return this.getItems(userId);
  },

  /**
   * Clears all items from the customer's cart.
   */
  clearCart(userId: string): void {
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
  },

  /**
   * Merges guest cart items into the authenticated customer's cart.
   */
  mergeGuestCart(userId: string, guestItems: GuestCartItemInput[]): CartItem[] {
    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      return this.getItems(userId);
    }

    for (const item of guestItems) {
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
        continue;
      }

      const prod = db
        .prepare("SELECT * FROM products WHERE id = ? AND status != 'Draft' LIMIT 1")
        .get(item.productId) as ProductDbRow | undefined;

      if (!prod || prod.status === 'Sold Out' || Number(prod.stock_quantity) <= 0) {
        continue; // Skip items that are sold out or drafts
      }

      const availableStock = Number(prod.stock_quantity);
      const unitPrice =
        typeof item.priceAtAdd === 'number' && item.priceAtAdd > 0
          ? item.priceAtAdd
          : prod.sale_price !== null && Number(prod.sale_price) < Number(prod.price)
          ? Number(prod.sale_price)
          : Number(prod.price);

      const existing = db
        .prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? LIMIT 1')
        .get(userId, item.productId) as { id: string; quantity: number } | undefined;

      if (existing) {
        const mergedQty = Math.min(
          Number(existing.quantity) + Number(item.quantity),
          availableStock
        );
        db.prepare(
          'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).run(mergedQty, existing.id);
      } else {
        const validQty = Math.min(Number(item.quantity), availableStock);
        const id = `ci-${crypto.randomUUID()}`;
        db.prepare(`
          INSERT INTO cart_items (id, user_id, product_id, quantity, price_at_add)
          VALUES (?, ?, ?, ?, ?)
        `).run(id, userId, item.productId, validQty, unitPrice);
      }
    }

    return this.getItems(userId);
  },
};
