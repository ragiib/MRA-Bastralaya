import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

// Singleton instance across hot reloads in Next.js
declare global {
  // eslint-disable-next-line no-var
  var __mra_db__: DatabaseSync | undefined;
}

function initDatabase(): DatabaseSync {
  if (globalThis.__mra_db__) {
    return globalThis.__mra_db__;
  }

  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'mra_bastralaya.db');
  const db = new DatabaseSync(dbPath);

  // Enable busy timeout for multi-worker build concurrency
  db.exec('PRAGMA busy_timeout = 5000;');
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // Schema creation
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK(role IN ('CUSTOMER', 'ADMIN')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      department TEXT NOT NULL CHECK(department IN ('Sarees', 'Ladies Suits', 'Bed Sheets')),
      category TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      price REAL NOT NULL,
      sale_price REAL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Draft', 'Sold Out')),
      description TEXT NOT NULL,
      images TEXT NOT NULL, -- JSON array of image URLs/paths

      -- Department-specific specifications (nullable, typed columns)
      fabric TEXT,
      color TEXT,
      blouse_piece_included INTEGER DEFAULT 1, -- 0 = false, 1 = true
      work_technique TEXT,
      occasion TEXT,
      suit_type TEXT,
      size TEXT,
      bed_size TEXT,
      pillow_covers_included INTEGER DEFAULT 1, -- 0 = false, 1 = true

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_products_dept ON products(department);
    CREATE INDEX IF NOT EXISTS idx_products_cat_slug ON products(category_slug);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
  `);

  // Seed initial products if table is empty
  try {
    const prodCheck = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number | bigint };
    const prodCount = Number(prodCheck?.count || 0);

    if (prodCount === 0) {
      const insertProd = db.prepare(`
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

      const initialSeed = [
        {
          id: 'prod-001',
          name: 'Royal Crimson Handloom Tant Cotton Saree',
          department: 'Sarees',
          category: 'Tant Cotton',
          categorySlug: 'tant-cotton',
          price: 3499,
          salePrice: 2999,
          stock: 14,
          status: 'Active',
          description: 'Crisp Bengal handloom tant cotton saree with woven temple border and delicate floral jaal motifs.',
          images: JSON.stringify(['/images/sarees/02_tant_cotton.jpg']),
          fabric: 'Handloom Tant Cotton',
          color: 'Royal Crimson & Gold',
          blousePieceIncluded: 1,
          workTechnique: 'Woven Jacquard Temple Border',
          occasion: 'Puja & Festival',
          suitType: null,
          size: null,
          bedSize: null,
          pillowCoversIncluded: null,
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        },
        {
          id: 'prod-002',
          name: 'Midnight Blue Pure Jamdani Cotton Saree',
          department: 'Sarees',
          category: 'Pure Jamdani Cotton',
          categorySlug: 'pure-jamdani-cotton',
          price: 8999,
          salePrice: null,
          stock: 5,
          status: 'Active',
          description: 'Airy handwoven Jamdani cotton with geometric floral buttis across the body and heavy pallu.',
          images: JSON.stringify(['/images/sarees/03_pure_jamdani_cotton.jpg']),
          fabric: 'Pure Jamdani Cotton',
          color: 'Midnight Blue & Silver',
          blousePieceIncluded: 0,
          workTechnique: 'Traditional Handloom Jamdani Weave',
          occasion: 'Traditional Weave',
          suitType: null,
          size: null,
          bedSize: null,
          pillowCoversIncluded: null,
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: 'prod-003',
          name: 'Artisan Indigo Handcrafted Cotton Batik Suit Set',
          department: 'Ladies Suits',
          category: 'Cotton Batik',
          categorySlug: 'cotton-batik',
          price: 2150,
          salePrice: 1850,
          stock: 22,
          status: 'Active',
          description: 'Authentic wax-resist dyed pure cotton suit set with coordinating cotton dupatta and bottom material.',
          images: JSON.stringify(['/images/ladies-suits/cotton_batik.jpg']),
          fabric: 'Pure Cotton Batik',
          color: 'Indigo Blue & White',
          blousePieceIncluded: null,
          workTechnique: null,
          occasion: null,
          suitType: 'Full Set',
          size: 'Free Size (Unstitched)',
          bedSize: null,
          pillowCoversIncluded: null,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: 'prod-004',
          name: 'Vibrant Punjabi Phulkari Embroidered Cotton Suit',
          department: 'Ladies Suits',
          category: 'Phulkari Cotton — All Types',
          categorySlug: 'phulkari-cotton-all-types',
          price: 3899,
          salePrice: null,
          stock: 0,
          status: 'Sold Out',
          description: 'Heavy silk floss geometric needlework on fine cotton fabric with grand Phulkari dupatta.',
          images: JSON.stringify(['/images/ladies-suits/phulkari_cotton.jpg']),
          fabric: 'Pure Cotton & Silk Floss',
          color: 'Mustard Yellow & Red',
          blousePieceIncluded: null,
          workTechnique: null,
          occasion: null,
          suitType: 'Full Set',
          size: 'Free Size (Unstitched)',
          bedSize: null,
          pillowCoversIncluded: null,
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
        {
          id: 'prod-005',
          name: 'Phulkari Handwork Pure Cotton King Bed Sheet Set',
          department: 'Bed Sheets',
          category: 'Phulkari Handwork Bed Sheet',
          categorySlug: 'phulkari-handwork-bed-sheet',
          price: 2899,
          salePrice: 2499,
          stock: 8,
          status: 'Active',
          description: 'Heritage Punjabi Phulkari floral hand-embroidered king-size pure cotton bed sheet with two pillow covers.',
          images: JSON.stringify(['/images/bed-sheets/phulkari_bedsheet_cat.jpg']),
          fabric: '100% Pure Cotton with Silk Floss Embroidery',
          color: null,
          blousePieceIncluded: null,
          workTechnique: null,
          occasion: null,
          suitType: null,
          size: null,
          bedSize: 'King (108 x 108 in)',
          pillowCoversIncluded: 1,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'prod-006',
          name: 'Emerald Baluchari Swarnachari Silk Saree (Sample Draft)',
          department: 'Sarees',
          category: 'Baluchari Silk',
          categorySlug: 'baluchari-silk',
          price: 16500,
          salePrice: null,
          stock: 2,
          status: 'Draft',
          description: 'Narrative woven silk saree from Bengal portraying mythological motifs in pure gold and silver zari thread.',
          images: JSON.stringify(['/images/sarees/10_baluchari_silk.jpg']),
          fabric: 'Pure Baluchari Swarnachari Silk',
          color: 'Emerald Green & Gold',
          blousePieceIncluded: 1,
          workTechnique: 'Mythological Minakari Weave',
          occasion: 'Bridal & Wedding',
          suitType: null,
          size: null,
          bedSize: null,
          pillowCoversIncluded: null,
          createdAt: new Date().toISOString(),
        },
      ];

      for (const p of initialSeed) {
        insertProd.run(
          p.id, p.name, p.department, p.category, p.categorySlug, p.price, p.salePrice,
          p.stock, p.status, p.description, p.images, p.fabric, p.color,
          p.blousePieceIncluded, p.workTechnique, p.occasion, p.suitType, p.size,
          p.bedSize, p.pillowCoversIncluded, p.createdAt, p.createdAt
        );
      }
      console.log(`[PRODUCT DB] Seeded ${initialSeed.length} initial products successfully.`);
    }
  } catch (error) {
    console.error('[PRODUCT DB] Error seeding initial products:', error);
  }

  // Auto-provision initial administrator if none exists
  try {
    const adminCheck = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'").get() as { count: number | bigint };
    const adminCount = Number(adminCheck?.count || 0);

    if (adminCount === 0) {
      const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
      const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;
      const initialAdminName = process.env.INITIAL_ADMIN_NAME || 'MRA Store Administrator';

      if (initialAdminEmail && initialAdminPassword) {
        const adminId = crypto.randomUUID();
        const passwordHash = bcrypt.hashSync(initialAdminPassword, 10);

        const insertAdmin = db.prepare(`
          INSERT INTO users (id, name, email, password_hash, role)
          VALUES (?, ?, ?, ?, 'ADMIN')
        `);
        insertAdmin.run(adminId, initialAdminName, initialAdminEmail, passwordHash);
        console.log(`[AUTH SYSTEM] Initial administrator provisioned securely: ${initialAdminEmail}`);
      }
    }
  } catch (error) {
    console.error('[AUTH SYSTEM] Error checking/provisioning initial admin:', error);
  }

  globalThis.__mra_db__ = db;
  return db;
}

export const db = initDatabase();
export default db;
