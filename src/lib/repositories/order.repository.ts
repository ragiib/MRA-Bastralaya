import { query, queryOne, pool } from '../db';
import { Order, OrderItem, CreateOrderInput } from '@/types/order';
import crypto from 'node:crypto';

interface OrderDbRow {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: string; // JSON string
  total: number | string;
  status: string;
  source: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

function formatDate(val: string | Date): string {
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

function mapRowToOrder(row: OrderDbRow): Order {
  let items: OrderItem[] = [];
  try {
    items = JSON.parse(row.items);
    if (!Array.isArray(items)) items = [];
  } catch {
    items = [];
  }

  const normalizedStatus =
    row.status === 'Pending - Awaiting WhatsApp Confirmation' ? 'Pending' : row.status;

  return {
    id: row.id,
    userId: row.user_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    items,
    total: Number(row.total),
    status: normalizedStatus,
    source: row.source || 'whatsapp',
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
  };
}

export const OrderRepository = {
  /**
   * Creates a new order attempt record in the PostgreSQL database.
   */
  async createOrder(data: CreateOrderInput): Promise<Order> {
    const id = `ord-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
    const status = data.status || 'Pending';
    const source = data.source || 'whatsapp';
    const itemsJson = JSON.stringify(data.items);
    const userId = data.userId || null;

    await query(
      `INSERT INTO orders (
        id, user_id, customer_name, customer_phone, customer_address,
        items, total, status, source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        userId,
        data.customerName.trim(),
        data.customerPhone.trim(),
        data.customerAddress.trim(),
        itemsJson,
        Number(data.total),
        status,
        source,
      ]
    );

    const created = await this.findById(id);
    if (!created) {
      throw new Error('Failed to retrieve created order record.');
    }
    return created;
  },

  /**
   * Updates an order's status and updated_at timestamp.
   */
  async updateStatus(id: string, status: string): Promise<Order | null> {
    const result = await pool.query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [status, id]
    );

    if ((result.rowCount ?? 0) === 0) {
      return null;
    }
    return this.findById(id);
  },

  /**
   * Retrieves an order by its unique primary key ID.
   */
  async findById(id: string): Promise<Order | null> {
    const row = await queryOne<OrderDbRow>(
      'SELECT * FROM orders WHERE id = $1 LIMIT 1',
      [id]
    );
    return row ? mapRowToOrder(row) : null;
  },

  /**
   * Lists recent orders for administrative inspection, optionally filtered by status.
   */
  async listOrders(limit = 100, status?: string): Promise<Order[]> {
    if (status && status !== 'All') {
      const rows = await query<OrderDbRow>(
        `SELECT * FROM orders 
         WHERE status = $1 
         ORDER BY created_at DESC 
         LIMIT $2`,
        [status, limit]
      );
      return rows.map(mapRowToOrder);
    }

    const rows = await query<OrderDbRow>(
      `SELECT * FROM orders 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );
    return rows.map(mapRowToOrder);
  },

  /**
   * Lists orders placed by a specific customer account.
   */
  async listOrdersByUser(userId: string, limit = 50): Promise<Order[]> {
    const rows = await query<OrderDbRow>(
      `SELECT * FROM orders 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return rows.map(mapRowToOrder);
  },

  /**
   * Counts the total number of orders recorded.
   */
  async countOrders(): Promise<number> {
    try {
      const row = await queryOne<{ count: string | number }>('SELECT COUNT(*) as count FROM orders');
      return Number(row?.count || 0);
    } catch {
      return 0;
    }
  },

  /**
   * Returns count breakdown of orders by status.
   */
  async countMetrics(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {
      All: 0,
      Pending: 0,
      Confirmed: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    try {
      const rows = await query<{ status: string; count: string | number }>(
        `SELECT status, COUNT(*) as count 
         FROM orders 
         GROUP BY status`
      );
      for (const row of rows) {
        const s =
          row.status === 'Pending - Awaiting WhatsApp Confirmation' ? 'Pending' : row.status;
        const cnt = Number(row.count);
        counts.All = (counts.All || 0) + cnt;
        counts[s] = (counts[s] || 0) + cnt;
      }
      return counts;
    } catch {
      return counts;
    }
  },

  /**
   * Permanently hard deletes an order from the database.
   */
  async deleteOrder(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },

  /**
   * Permanently hard deletes orders matching a specific status (e.g. Cancelled).
   */
  async deleteOrdersByStatus(status: string): Promise<number> {
    const result = await pool.query('DELETE FROM orders WHERE status = $1', [status]);
    return result.rowCount ?? 0;
  },
};
