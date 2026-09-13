import { Pool } from '@neondatabase/serverless';
import path from 'node:path';
import fs from 'node:fs';

// 1. Manually parse .env.local if present
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          const key = trimmed.slice(0, idx).trim();
          let val = trimmed.slice(idx + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

// Migrations must use the direct, unpooled DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('[MIGRATION ERROR] DATABASE_URL is not defined in environment or .env.local.');
  console.error('Direct unpooled DATABASE_URL is required for schema migrations.');
  process.exit(1);
}

console.log('=====================================================');
console.log('      MRA BASTRALAYA - NEON DATABASE MIGRATION       ');
console.log('=====================================================');
console.log(`Connecting to Neon Postgres: ${databaseUrl.split('@')[1]?.split('?')[0] || 'Neon endpoint'}`);

const pool = new Pool({ connectionString: databaseUrl });

async function runMigration() {
  const client = await pool.connect();
  try {
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`[MIGRATION] Executing ${file}...`);
      await client.query(sql);
      console.log(`[MIGRATION] ${file} executed successfully.`);
    }

    // Verification: Query created tables
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tables = tableRes.rows.map((r) => r.table_name);
    console.log('[VERIFICATION] Public tables present in database:', tables);

    const requiredTables = ['users', 'products', 'cart_items', 'orders', 'admin_otps', 'wishlist_items'];
    const missing = requiredTables.filter((t) => !tables.includes(t));

    if (missing.length > 0) {
      throw new Error(`Missing expected tables after migration: ${missing.join(', ')}`);
    }

    // Verify products count
    const prodRes = await client.query('SELECT COUNT(*) as count FROM products;');
    console.log(`[VERIFICATION] Products in database: ${prodRes.rows[0].count}`);

    console.log('=====================================================');
    console.log('[SUCCESS] All database migrations completed successfully!');
    console.log('=====================================================\n');
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch((err) => {
  console.error('[FATAL MIGRATION ERROR]', err);
  process.exit(1);
});
