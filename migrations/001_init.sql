-- =============================================================================
-- MRA BASTRALAYA - POSTGRESQL INITIAL DATABASE SCHEMA MIGRATION
-- Migration: 001_init.sql
-- =============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK(role IN ('CUSTOMER', 'ADMIN')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL CHECK(department IN ('Sarees', 'Ladies Suits', 'Bed Sheets')),
  category TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  sale_price NUMERIC(10, 2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Draft', 'Sold Out')),
  description TEXT NOT NULL,
  images TEXT NOT NULL, -- JSON array of image URLs/paths stored as string
  fabric TEXT,
  color TEXT,
  blouse_piece_included BOOLEAN DEFAULT true,
  work_technique TEXT,
  occasion TEXT,
  suit_type TEXT,
  size TEXT,
  bed_size TEXT,
  pillow_covers_included BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_dept ON products(department);
CREATE INDEX IF NOT EXISTS idx_products_cat_slug ON products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- 3. CART_ITEMS TABLE
CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_add NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_cart_items_user_product UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  items TEXT NOT NULL, -- JSON array of line items stored as string
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  source TEXT DEFAULT 'whatsapp',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 5. ADMIN_OTPS TABLE
CREATE TABLE IF NOT EXISTS admin_otps (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at BIGINT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_otps_admin ON admin_otps(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_otps_created ON admin_otps(created_at DESC);

-- 6. BASELINE STORE PRODUCTS SEED
INSERT INTO products (
  id, name, department, category, category_slug, price, sale_price,
  stock_quantity, status, description, images, fabric, color,
  blouse_piece_included, work_technique, occasion, suit_type, size,
  bed_size, pillow_covers_included, created_at, updated_at
) VALUES
  (
    'prod-001',
    'Royal Crimson Handloom Tant Cotton Saree',
    'Sarees',
    'Tant Cotton',
    'tant-cotton',
    3499.00,
    2999.00,
    14,
    'Active',
    'Crisp Bengal handloom tant cotton saree with woven temple border and delicate floral jaal motifs.',
    '["/images/sarees/02_tant_cotton.jpg"]',
    'Handloom Tant Cotton',
    'Royal Crimson & Gold',
    true,
    'Woven Jacquard Temple Border',
    'Puja & Festival',
    NULL,
    NULL,
    NULL,
    NULL,
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    'prod-002',
    'Midnight Blue Pure Jamdani Cotton Saree',
    'Sarees',
    'Pure Jamdani Cotton',
    'pure-jamdani-cotton',
    8999.00,
    NULL,
    5,
    'Active',
    'Airy handwoven Jamdani cotton with geometric floral buttis across the body and heavy pallu.',
    '["/images/sarees/03_pure_jamdani_cotton.jpg"]',
    'Pure Jamdani Cotton',
    'Midnight Blue & Silver',
    false,
    'Traditional Handloom Jamdani Weave',
    'Traditional Weave',
    NULL,
    NULL,
    NULL,
    NULL,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    'prod-003',
    'Artisan Indigo Handcrafted Cotton Batik Suit Set',
    'Ladies Suits',
    'Cotton Batik',
    'cotton-batik',
    2150.00,
    1850.00,
    22,
    'Active',
    'Authentic wax-resist dyed pure cotton suit set with coordinating cotton dupatta and bottom material.',
    '["/images/ladies-suits/cotton_batik.jpg"]',
    'Pure Cotton Batik',
    'Indigo Blue & White',
    NULL,
    NULL,
    NULL,
    'Full Set',
    'Free Size (Unstitched)',
    NULL,
    NULL,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'prod-004',
    'Vibrant Punjabi Phulkari Embroidered Cotton Suit',
    'Ladies Suits',
    'Phulkari Cotton — All Types',
    'phulkari-cotton-all-types',
    3899.00,
    NULL,
    0,
    'Sold Out',
    'Heavy silk floss geometric needlework on fine cotton fabric with grand Phulkari dupatta.',
    '["/images/ladies-suits/phulkari_cotton.jpg"]',
    'Pure Cotton & Silk Floss',
    'Mustard Yellow & Red',
    NULL,
    NULL,
    NULL,
    'Full Set',
    'Free Size (Unstitched)',
    NULL,
    NULL,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    'prod-005',
    'Phulkari Handwork Pure Cotton King Bed Sheet Set',
    'Bed Sheets',
    'Phulkari Handwork Bed Sheet',
    'phulkari-handwork-bed-sheet',
    2899.00,
    2499.00,
    8,
    'Active',
    'Heritage Punjabi Phulkari floral hand-embroidered king-size pure cotton bed sheet with two pillow covers.',
    '["/images/bed-sheets/phulkari_bedsheet_cat.jpg"]',
    '100% Pure Cotton with Silk Floss Embroidery',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'King (108 x 108 in)',
    true,
    NOW(),
    NOW()
  ),
  (
    'prod-006',
    'Emerald Baluchari Swarnachari Silk Saree (Sample Draft)',
    'Sarees',
    'Baluchari Silk',
    'baluchari-silk',
    16500.00,
    NULL,
    2,
    'Draft',
    'Narrative woven silk saree from Bengal portraying mythological motifs in pure gold and silver zari thread.',
    '["/images/sarees/10_baluchari_silk.jpg"]',
    'Pure Baluchari Swarnachari Silk',
    'Emerald Green & Gold',
    true,
    'Mythological Minakari Weave',
    'Bridal & Wedding',
    NULL,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;
