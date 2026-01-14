import { Pool } from "pg";

const connectionString =
  process.env.SYNC_DATABASE_URL ?? process.env.DATABASE_URL ?? "";

if (!connectionString) {
  throw new Error("Missing SYNC_DATABASE_URL or DATABASE_URL");
}

const connectionUrl = new URL(connectionString);
const sslmode = connectionUrl.searchParams.get("sslmode");
const requiresSsl = sslmode === "require" || connectionString.includes("sslmode=require");

if (sslmode) {
  connectionUrl.searchParams.delete("sslmode");
}

const normalizedConnectionString = connectionUrl.toString();

const pool = new Pool({
  connectionString: normalizedConnectionString,
  // DigitalOcean managed Postgres uses a cert chain that often fails local verification.
  ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
});

export function query<T = unknown>(text: string, params?: unknown[]) {
  return pool.query<T>(text, params);
}
