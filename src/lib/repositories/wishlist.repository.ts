import { query, queryOne } from '../db';
import { ProductRepository } from './product.repository';
import { ProductItem } from '@/types/product';
import crypto from 'node:crypto';

interface WishlistRow {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string | Date;
}

export const WishlistRepository = {
  /**
   * Retrieves array of product IDs wishlisted by a specific user.
   */
  async getWishlistProductIds(userId: string): Promise<string[]> {
    const rows = await query<WishlistRow>(
      'SELECT product_id FROM wishlist_items WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return rows.map((r) => r.product_id);
  },

  /**
   * Retrieves full ProductItem objects for all wishlisted items of a user.
   * Excludes 'Draft' products.
   */
  async getWishlistProducts(userId: string): Promise<ProductItem[]> {
    const ids = await this.getWishlistProductIds(userId);
    if (ids.length === 0) return [];

    const products: ProductItem[] = [];
    for (const id of ids) {
      const product = await ProductRepository.getCustomerProductById(id);
      if (product) {
        products.push(product);
      }
    }
    return products;
  },

  /**
   * Checks if a user has wishlisted a product.
   */
  async isWishlisted(userId: string, productId: string): Promise<boolean> {
    const row = await queryOne<{ count: string | number }>(
      'SELECT COUNT(*) as count FROM wishlist_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    return Number(row?.count || 0) > 0;
  },

  /**
   * Adds an item to the user's wishlist.
   */
  async addItem(userId: string, productId: string): Promise<void> {
    const id = `wish-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await query(
      `INSERT INTO wishlist_items (id, user_id, product_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [id, userId, productId]
    );
  },

  /**
   * Removes an item from the user's wishlist.
   */
  async removeItem(userId: string, productId: string): Promise<void> {
    await query(
      'DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
  },

  /**
   * Toggles a wishlist item. Returns true if added, false if removed.
   */
  async toggleItem(userId: string, productId: string): Promise<{ added: boolean }> {
    const exists = await this.isWishlisted(userId, productId);
    if (exists) {
      await this.removeItem(userId, productId);
      return { added: false };
    } else {
      await this.addItem(userId, productId);
      return { added: true };
    }
  },
};
