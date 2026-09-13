import { Pool, QueryResultRow, neonConfig } from '@neondatabase/serverless';

// Enable poolQueryViaFetch: sends queries over high-performance, stateless HTTP fetch
// instead of WebSockets. This eliminates WebSocket stream closures ("Cannot write to a closed stream",
// "Cannot close a closed stream") in Node.js serverless and long-lived runtimes.
neonConfig.poolQueryViaFetch = true;

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

  const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  // Catch any idle client errors so they do not bubble up as unhandled EventEmitter errors
  pool.on('error', (err: Error) => {
    console.error('[DATABASE POOL ERROR]', err.message || err);
  });

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
