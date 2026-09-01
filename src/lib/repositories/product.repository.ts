import { db } from '../db';
import {
  ProductItem,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
} from '@/types/product';
import { DepartmentType, ProductStatusType } from '@/data/adminProductOptions';
import crypto from 'node:crypto';

interface ProductRow {
  id: string;
  name: string;
  department: string;
  category: string;
  category_slug: string;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  status: string;
  description: string;
  images: string;
  fabric: string | null;
  color: string | null;
  blouse_piece_included: number | null;
  work_technique: string | null;
  occasion: string | null;
  suit_type: string | null;
  size: string | null;
  bed_size: string | null;
  pillow_covers_included: number | null;
  created_at: string;
  updated_at: string;
}

function mapRowToProduct(row: ProductRow): ProductItem {
  let images: string[] = [];
  try {
    images = JSON.parse(row.images);
    if (!Array.isArray(images)) images = [];
  } catch {
    images = row.images ? [row.images] : [];
  }

  return {
    id: row.id,
    name: row.name,
    department: row.department as DepartmentType,
    category: row.category,
    categorySlug: row.category_slug,
    price: Number(row.price),
    salePrice: row.sale_price !== null ? Number(row.sale_price) : null,
    stock: Number(row.stock_quantity),
    status: row.status as ProductStatusType,
    description: row.description,
    images,
    fabric: row.fabric || undefined,
    color: row.color || undefined,
    blousePieceIncluded:
      row.blouse_piece_included === null ? undefined : Boolean(row.blouse_piece_included),
    workTechnique: row.work_technique || undefined,
    occasion: row.occasion || undefined,
    suitType: (row.suit_type as 'Full Set' | 'Separate Pieces') || undefined,
    size: row.size || undefined,
    bedSize: row.bed_size || undefined,
    pillowCoversIncluded:
      row.pillow_covers_included === null ? undefined : Boolean(row.pillow_covers_included),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const ProductRepository = {
  /**
   * Retrieves all products with optional filters for department, status, category, and search query.
   */
  getAll(filters?: ProductFilters): ProductItem[] {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: unknown[] = [];

    if (filters?.department && filters.department !== 'All') {
      query += ' AND department = ?';
      params.push(filters.department);
    }

    if (filters?.status && filters.status !== 'All') {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters?.categorySlug) {
      query += ' AND category_slug = ?';
      params.push(filters.categorySlug);
    }

    if (filters?.search && filters.search.trim()) {
      const q = `%${filters.search.trim().toLowerCase()}%`;
      query += ` AND (
        LOWER(name) LIKE ? OR
        LOWER(category) LIKE ? OR
        LOWER(COALESCE(fabric, '')) LIKE ? OR
        LOWER(COALESCE(color, '')) LIKE ?
      )`;
      params.push(q, q, q, q);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as ProductRow[];
    return rows.map(mapRowToProduct);
  },

  /**
   * Retrieves a single product by ID.
   */
  getById(id: string): ProductItem | null {
    const stmt = db.prepare('SELECT * FROM products WHERE id = ? LIMIT 1');
    const row = stmt.get(id) as ProductRow | undefined;
    return row ? mapRowToProduct(row) : null;
  },

  /**
   * Creates a new product record in the SQLite database.
   */
  create(data: CreateProductInput): ProductItem {
    const id = `prod-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();
    const imagesJson = JSON.stringify(data.images || []);

    const stmt = db.prepare(`
      INSERT INTO products (
        id, name, department, category, category_slug, price, sale_price,
        stock_quantity, status, description, images, fabric, color,
        blouse_piece_included, work_technique, occasion, suit_type, size,
        bed_size, pillow_covers_included, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `);

    stmt.run(
      id,
      data.name.trim(),
      data.department,
      data.category.trim(),
      data.categorySlug.trim(),
      data.price,
      data.salePrice ?? null,
      data.stock ?? 0,
      data.status || 'Active',
      data.description.trim(),
      imagesJson,
      data.fabric?.trim() || null,
      data.color?.trim() || null,
      data.blousePieceIncluded !== undefined ? (data.blousePieceIncluded ? 1 : 0) : null,
      data.workTechnique?.trim() || null,
      data.occasion || null,
      data.suitType || null,
      data.size || null,
      data.bedSize || null,
      data.pillowCoversIncluded !== undefined ? (data.pillowCoversIncluded ? 1 : 0) : null,
      now,
      now
    );

    return this.getById(id)!;
  },

  /**
   * Updates an existing product in the SQLite database.
   */
  update(id: string, data: UpdateProductInput): ProductItem | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const merged = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const imagesJson = JSON.stringify(merged.images || []);

    const stmt = db.prepare(`
      UPDATE products SET
        name = ?,
        department = ?,
        category = ?,
        category_slug = ?,
        price = ?,
        sale_price = ?,
        stock_quantity = ?,
        status = ?,
        description = ?,
        images = ?,
        fabric = ?,
        color = ?,
        blouse_piece_included = ?,
        work_technique = ?,
        occasion = ?,
        suit_type = ?,
        size = ?,
        bed_size = ?,
        pillow_covers_included = ?,
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      merged.name.trim(),
      merged.department,
      merged.category.trim(),
      merged.categorySlug.trim(),
      merged.price,
      merged.salePrice ?? null,
      merged.stock ?? 0,
      merged.status,
      merged.description.trim(),
      imagesJson,
      merged.fabric?.trim() || null,
      merged.color?.trim() || null,
      merged.blousePieceIncluded !== undefined ? (merged.blousePieceIncluded ? 1 : 0) : null,
      merged.workTechnique?.trim() || null,
      merged.occasion || null,
      merged.suitType || null,
      merged.size || null,
      merged.bedSize || null,
      merged.pillowCoversIncluded !== undefined ? (merged.pillowCoversIncluded ? 1 : 0) : null,
      merged.updatedAt,
      id
    );

    return this.getById(id);
  },

  /**
   * Deletes a product from the SQLite database.
   */
  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    const result = stmt.run(id);
    return Number(result.changes) > 0;
  },

  /**
   * Summary metrics for the Admin Dashboard.
   */
  countMetrics(): {
    total: number;
    sarees: number;
    suits: number;
    bedSheets: number;
    outOfStock: number;
  } {
    const totalStmt = db.prepare('SELECT COUNT(*) as c FROM products');
    const sareesStmt = db.prepare("SELECT COUNT(*) as c FROM products WHERE department = 'Sarees'");
    const suitsStmt = db.prepare("SELECT COUNT(*) as c FROM products WHERE department = 'Ladies Suits'");
    const bedSheetsStmt = db.prepare("SELECT COUNT(*) as c FROM products WHERE department = 'Bed Sheets'");
    const oosStmt = db.prepare('SELECT COUNT(*) as c FROM products WHERE stock_quantity <= 0 OR status = "Sold Out"');

    return {
      total: Number((totalStmt.get() as { c: number | bigint })?.c || 0),
      sarees: Number((sareesStmt.get() as { c: number | bigint })?.c || 0),
      suits: Number((suitsStmt.get() as { c: number | bigint })?.c || 0),
      bedSheets: Number((bedSheetsStmt.get() as { c: number | bigint })?.c || 0),
      outOfStock: Number((oosStmt.get() as { c: number | bigint })?.c || 0),
    };
  },
};
