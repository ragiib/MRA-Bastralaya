import { query, queryOne, pool } from '../db';
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
  price: number | string;
  sale_price: number | string | null;
  stock_quantity: number;
  status: string;
  description: string;
  images: string;
  fabric: string | null;
  color: string | null;
  blouse_piece_included: boolean | number | null;
  work_technique: string | null;
  occasion: string | null;
  suit_type: string | null;
  size: string | null;
  bed_size: string | null;
  pillow_covers_included: boolean | number | null;
  created_at: string | Date;
  updated_at: string | Date;
}

function formatDate(val: string | Date): string {
  if (val instanceof Date) return val.toISOString();
  return String(val);
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
    salePrice: row.sale_price !== null && row.sale_price !== undefined ? Number(row.sale_price) : null,
    stock: Number(row.stock_quantity),
    status: row.status as ProductStatusType,
    description: row.description,
    images,
    fabric: row.fabric || undefined,
    color: row.color || undefined,
    blousePieceIncluded:
      row.blouse_piece_included === null || row.blouse_piece_included === undefined
        ? undefined
        : Boolean(row.blouse_piece_included),
    workTechnique: row.work_technique || undefined,
    occasion: row.occasion || undefined,
    suitType: (row.suit_type as 'Full Set' | 'Separate Pieces') || undefined,
    size: row.size || undefined,
    bedSize: row.bed_size || undefined,
    pillowCoversIncluded:
      row.pillow_covers_included === null || row.pillow_covers_included === undefined
        ? undefined
        : Boolean(row.pillow_covers_included),
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
  };
}

export const ProductRepository = {
  /**
   * Retrieves all products with optional filters for department, status, category, and search query.
   */
  async getAll(filters?: ProductFilters): Promise<ProductItem[]> {
    let queryText = 'SELECT * FROM products WHERE 1=1';
    const params: unknown[] = [];
    let idx = 1;

    if (filters?.department && filters.department !== 'All') {
      queryText += ` AND department = $${idx++}`;
      params.push(filters.department);
    }

    if (filters?.status && filters.status !== 'All') {
      queryText += ` AND status = $${idx++}`;
      params.push(filters.status);
    }

    if (filters?.categorySlug) {
      queryText += ` AND category_slug = $${idx++}`;
      params.push(filters.categorySlug);
    }

    if (filters?.search && filters.search.trim()) {
      const q = `%${filters.search.trim().toLowerCase()}%`;
      queryText += ` AND (
        LOWER(name) LIKE $${idx} OR
        LOWER(category) LIKE $${idx + 1} OR
        LOWER(COALESCE(fabric, '')) LIKE $${idx + 2} OR
        LOWER(COALESCE(color, '')) LIKE $${idx + 3}
      )`;
      params.push(q, q, q, q);
      idx += 4;
    }

    queryText += ' ORDER BY created_at DESC';

    const rows = await query<ProductRow>(queryText, params);
    return rows.map(mapRowToProduct);
  },

  /**
   * Retrieves products for customer storefront display.
   * Strictly excludes 'Draft' products.
   * Includes 'Active' and 'Sold Out' products.
   */
  async getCustomerProducts(filters?: {
    department?: DepartmentType;
    categorySlug?: string;
    search?: string;
  }): Promise<ProductItem[]> {
    let queryText = "SELECT * FROM products WHERE status != 'Draft'";
    const params: unknown[] = [];
    let idx = 1;

    if (filters?.department) {
      queryText += ` AND department = $${idx++}`;
      params.push(filters.department);
    }

    if (filters?.categorySlug && filters.categorySlug !== 'all') {
      queryText += ` AND category_slug = $${idx++}`;
      params.push(filters.categorySlug);
    }

    if (filters?.search && filters.search.trim()) {
      const q = `%${filters.search.trim().toLowerCase()}%`;
      queryText += ` AND (
        LOWER(name) LIKE $${idx} OR
        LOWER(category) LIKE $${idx + 1} OR
        LOWER(COALESCE(fabric, '')) LIKE $${idx + 2} OR
        LOWER(COALESCE(color, '')) LIKE $${idx + 3}
      )`;
      params.push(q, q, q, q);
      idx += 4;
    }

    queryText += ' ORDER BY created_at DESC';

    const rows = await query<ProductRow>(queryText, params);
    return rows.map(mapRowToProduct);
  },

  /**
   * Retrieves a single product by ID.
   */
  async getById(id: string): Promise<ProductItem | null> {
    const row = await queryOne<ProductRow>('SELECT * FROM products WHERE id = $1 LIMIT 1', [id]);
    return row ? mapRowToProduct(row) : null;
  },

  /**
   * Retrieves a single product for customer storefront display by ID.
   * Strictly excludes 'Draft' products.
   */
  async getCustomerProductById(id: string): Promise<ProductItem | null> {
    const row = await queryOne<ProductRow>(
      "SELECT * FROM products WHERE id = $1 AND status != 'Draft' LIMIT 1",
      [id]
    );
    return row ? mapRowToProduct(row) : null;
  },

  /**
   * Creates a new product record in the PostgreSQL database.
   */
  async create(data: CreateProductInput): Promise<ProductItem> {
    const id = `prod-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date();
    const imagesJson = JSON.stringify(data.images || []);

    await query(
      `INSERT INTO products (
        id, name, department, category, category_slug, price, sale_price,
        stock_quantity, status, description, images, fabric, color,
        blouse_piece_included, work_technique, occasion, suit_type, size,
        bed_size, pillow_covers_included, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18,
        $19, $20, $21, $22
      )`,
      [
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
        data.blousePieceIncluded !== undefined ? Boolean(data.blousePieceIncluded) : null,
        data.workTechnique?.trim() || null,
        data.occasion || null,
        data.suitType || null,
        data.size || null,
        data.bedSize || null,
        data.pillowCoversIncluded !== undefined ? Boolean(data.pillowCoversIncluded) : null,
        now,
        now,
      ]
    );

    const created = await this.getById(id);
    if (!created) {
      throw new Error('Failed to retrieve newly created product.');
    }
    return created;
  },

  /**
   * Updates an existing product in the PostgreSQL database.
   */
  async update(id: string, data: UpdateProductInput): Promise<ProductItem | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const merged = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const imagesJson = JSON.stringify(merged.images || []);

    await query(
      `UPDATE products SET
        name = $1,
        department = $2,
        category = $3,
        category_slug = $4,
        price = $5,
        sale_price = $6,
        stock_quantity = $7,
        status = $8,
        description = $9,
        images = $10,
        fabric = $11,
        color = $12,
        blouse_piece_included = $13,
        work_technique = $14,
        occasion = $15,
        suit_type = $16,
        size = $17,
        bed_size = $18,
        pillow_covers_included = $19,
        updated_at = $20
      WHERE id = $21`,
      [
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
        merged.blousePieceIncluded !== undefined ? Boolean(merged.blousePieceIncluded) : null,
        merged.workTechnique?.trim() || null,
        merged.occasion || null,
        merged.suitType || null,
        merged.size || null,
        merged.bedSize || null,
        merged.pillowCoversIncluded !== undefined ? Boolean(merged.pillowCoversIncluded) : null,
        new Date(),
        id,
      ]
    );

    return this.getById(id);
  },

  /**
   * Deletes a product from the PostgreSQL database.
   */
  async delete(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },

  /**
   * Summary metrics for the Admin Dashboard.
   */
  async countMetrics(): Promise<{
    total: number;
    sarees: number;
    suits: number;
    bedSheets: number;
    outOfStock: number;
  }> {
    const totalRow = await queryOne<{ c: string | number }>('SELECT COUNT(*) as c FROM products');
    const sareesRow = await queryOne<{ c: string | number }>(
      "SELECT COUNT(*) as c FROM products WHERE department = 'Sarees'"
    );
    const suitsRow = await queryOne<{ c: string | number }>(
      "SELECT COUNT(*) as c FROM products WHERE department = 'Ladies Suits'"
    );
    const bedSheetsRow = await queryOne<{ c: string | number }>(
      "SELECT COUNT(*) as c FROM products WHERE department = 'Bed Sheets'"
    );
    const oosRow = await queryOne<{ c: string | number }>(
      "SELECT COUNT(*) as c FROM products WHERE stock_quantity <= 0 OR status = 'Sold Out'"
    );

    return {
      total: Number(totalRow?.c || 0),
      sarees: Number(sareesRow?.c || 0),
      suits: Number(suitsRow?.c || 0),
      bedSheets: Number(bedSheetsRow?.c || 0),
      outOfStock: Number(oosRow?.c || 0),
    };
  },
};
