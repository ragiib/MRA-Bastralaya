import { Pool, QueryResultRow } from '@neondatabase/serverless';

// Singleton instance across hot reloads in Next.js development
declare global {
  // eslint-disable-next-line no-var
  var __mra_pg_pool__: Pool | undefined;
}

function initPool(): Pool {
  if (globalThis.__mra_pg_pool__) {
    return globalThis.__mra_pg_pool__;
  }

  // Runtime queries use the pooled connection string (PgBouncer) for serverless scalability
  const connectionString = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      '[DATABASE CONFIG ERROR] DATABASE_URL_POOLED (or DATABASE_URL) is not defined in environment.'
    );
  }

  const pool = new Pool({ connectionString });
  globalThis.__mra_pg_pool__ = pool;
  return pool;
}

export const pool = initPool();

/**
 * Execute a parameterized query against Neon Postgres and return array of rows.
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params: any[] = []
): Promise<T[]> {
  const res = await pool.query<T>(text, params);
  return res.rows;
}

/**
 * Execute a parameterized query and return the first row, or null if none found.
 */
export async function queryOne<T extends QueryResultRow = any>(
  text: string,
  params: any[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

export default pool;
