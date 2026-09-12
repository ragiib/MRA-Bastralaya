import { db } from '../db';
import { Order, OrderItem, CreateOrderInput } from '@/types/order';
import crypto from 'node:crypto';

interface OrderDbRow {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: string; // JSON string
  total: number;
  status: string;
  source: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToOrder(row: OrderDbRow): Order {
  let items: OrderItem[] = [];
  try {
    items = JSON.parse(row.items);
    if (!Array.isArray(items)) items = [];
  } catch {
    items = [];
  }

  return {
    id: row.id,
    userId: row.user_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    items,
    total: Number(row.total),
    status: row.status,
    source: row.source || 'whatsapp',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const OrderRepository = {
  /**
   * Creates a new order attempt record in the database.
   */
  createOrder(data: CreateOrderInput): Order {
    const id = `ord-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
    const status = data.status || 'Pending - Awaiting WhatsApp Confirmation';
    const source = data.source || 'whatsapp';
    const itemsJson = JSON.stringify(data.items);
    const userId = data.userId || null;

    const stmt = db.prepare(`
      INSERT INTO orders (
        id, user_id, customer_name, customer_phone, customer_address,
        items, total, status, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userId,
      data.customerName.trim(),
      data.customerPhone.trim(),
      data.customerAddress.trim(),
      itemsJson,
      Number(data.total),
      status,
      source
    );

    const created = this.findById(id);
    if (!created) {
      throw new Error('Failed to retrieve created order record.');
    }
    return created;
  },

  /**
   * Retrieves an order by its unique primary key ID.
   */
  findById(id: string): Order | null {
    const stmt = db.prepare('SELECT * FROM orders WHERE id = ? LIMIT 1');
    const row = stmt.get(id) as OrderDbRow | undefined;
    return row ? mapRowToOrder(row) : null;
  },

  /**
   * Lists recent orders for administrative inspection.
   */
  listOrders(limit = 50): Order[] {
    const stmt = db.prepare(`
      SELECT * FROM orders 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    const rows = stmt.all(limit) as OrderDbRow[];
    return rows.map(mapRowToOrder);
  },

  /**
   * Lists orders placed by a specific customer account.
   */
  listOrdersByUser(userId: string, limit = 50): Order[] {
    const stmt = db.prepare(`
      SELECT * FROM orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    const rows = stmt.all(userId, limit) as OrderDbRow[];
    return rows.map(mapRowToOrder);
  },

  /**
   * Counts the total number of orders recorded.
   */
  countOrders(): number {
    try {
      const stmt = db.prepare('SELECT COUNT(*) as count FROM orders');
      const row = stmt.get() as { count: number | bigint } | undefined;
      return Number(row?.count || 0);
    } catch {
      return 0;
    }
  },
};
