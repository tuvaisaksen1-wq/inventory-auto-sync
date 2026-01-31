import { query } from "./db.server";

type SupplierProfileRow = {
  customer_id: string | null;
  supplier_id: string;
  name: string | null;
  status: string | null;
  connection_type: string | null;
  matching_key: string | null;
  connection: unknown | null;
  shop: unknown | null;
  frequency: string | null;
  notifications: unknown | null;
  sync_frequency: string | null;
  next_run_at: string | null;
};

export type SupplierProfile = {
  customer_id: string | null;
  supplier_id: string;
  name: string | null;
  status: string | null;
  connection_type: string | null;
  matching_key: string | null;
  connection: Record<string, unknown> | null;
  shop: Record<string, unknown> | null;
  frequency: string | null;
  notifications: Record<string, unknown> | null;
  sync_frequency: string | null;
  next_run_at: string | null;
};

type SyncRunSummary = Record<string, unknown>;

type SyncRunRow = {
  run_id: string;
  supplier_id: string;
  trigger: string | null;
  status: string | null;
  started_at: string | null;
  finished_at: string | null;
  updated_count: number | null;
  skipped_count: number | null;
  not_found_count: number | null;
  error_count: number | null;
  error_summary: unknown | null;
  summary: SyncRunSummary | null;
  next_run_at: string | null;
};

function normalizeJson(value: unknown) {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  if (typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return null;
}

export function parseSummary(value: string) {
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    if (typeof parsed === "object" && parsed !== null) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export async function getSupplierProfile(supplierId: string) {
  const result = await query<SupplierProfileRow>(
    `SELECT customer_id, supplier_id, name, status, connection_type, matching_key,
            connection, shop, frequency, notifications, sync_frequency, next_run_at
     FROM supplier_profiles
     WHERE supplier_id = $1
     LIMIT 1`,
    [supplierId]
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    customer_id: row.customer_id,
    supplier_id: row.supplier_id,
    name: row.name,
    status: row.status,
    connection_type: row.connection_type,
    matching_key: row.matching_key,
    connection: normalizeJson(row.connection),
    shop: normalizeJson(row.shop),
    frequency: row.frequency,
            notifications: normalizeJson(row.notifications),
            sync_frequency: row.sync_frequency,
            next_run_at: row.next_run_at,
  } satisfies SupplierProfile;
}

export async function updateSupplierNextRun(supplierId: string, nextRunAt: Date) {
  const result = await query(
    `UPDATE supplier_profiles
     SET next_run_at = $2
     WHERE supplier_id = $1`,
    [supplierId, nextRunAt.toISOString()]
  );
  return result.rowCount ?? 0;
}

export async function getLatestSyncRun(supplierId: string) {
  const result = await query(
    `SELECT sr.run_id, sr.supplier_id, sr.trigger, sr.status, sr.started_at, sr.finished_at,
            sr.updated_count, sr.skipped_count, sr.not_found_count, sr.error_count, sr.error_summary,
            sr.summary, sp.next_run_at
     FROM sync_runs sr
     LEFT JOIN supplier_profiles sp ON sp.supplier_id = sr.supplier_id
     WHERE sr.supplier_id = $1
     ORDER BY sr.started_at DESC NULLS LAST, sr.run_id DESC
     LIMIT 1`,
    [supplierId]
  );

  const row = result.rows[0];
  if (!row) return null;
  return {
    ...row,
    summary: typeof row.summary === "object" && row.summary !== null ? row.summary : null,
    next_run_at: row.next_run_at,
  };
}

export async function getSyncRunById(runId: string) {
  const result = await query(
    `SELECT sr.run_id, sr.supplier_id, sr.trigger, sr.status, sr.started_at, sr.finished_at,
            sr.updated_count, sr.skipped_count, sr.not_found_count, sr.error_count, sr.error_summary,
            sr.summary, sp.next_run_at
     FROM sync_runs sr
     LEFT JOIN supplier_profiles sp ON sp.supplier_id = sr.supplier_id
     WHERE sr.run_id = $1
     LIMIT 1`,
    [runId]
  );

  const row = result.rows[0];
  if (!row) return null;
  return {
    ...row,
    summary: typeof row.summary === "object" && row.summary !== null ? row.summary : null,
    next_run_at: row.next_run_at,
  };
}

export async function createSyncRun(params: {
  supplierId: string;
  tenantId: string | null;
  trigger?: string;
  status?: string;
}) {
  const { supplierId, tenantId, trigger = "manual", status = "queued" } = params;
  const result = await query(
    `INSERT INTO sync_runs (
       tenant_id,
       supplier_id,
       trigger,
       status,
       started_at
     ) VALUES ($1, $2, $3, $4, now())
     RETURNING run_id`,
    [tenantId, supplierId, trigger, status]
  );

  return result.rows[0]?.run_id ?? null;
}

export async function setSyncRunStatus(
  runId: string,
  status: string,
  errorSummary?: string
) {
  const shouldFinish =
    status === "failed" || status === "partial_failed" || status === "success";

  const result = await query(
    `UPDATE sync_runs
     SET status = $2,
         error_summary = COALESCE($3, error_summary),
         finished_at = CASE WHEN $4 THEN now() ELSE finished_at END
     WHERE run_id = $1`,
    [runId, status, errorSummary ?? null, shouldFinish]
  );

  return result.rowCount ?? 0;
}

export async function setSyncRunSummary(runId: string, summary: Record<string, unknown>) {
  const result = await query(
    `UPDATE sync_runs
     SET summary = $2
     WHERE run_id = $1`,
    [runId, JSON.stringify(summary)]
  );

  return result.rowCount ?? 0;
}

export function computeNextRunAt(frequency: string | null) {
  const now = new Date();
  const map: Record<string, number> = {
    hourly: 60,
    "6h": 6 * 60,
    "12h": 12 * 60,
    daily: 24 * 60,
  };
  const minutes = map[frequency ?? "6h"] ?? 6 * 60;
  return new Date(now.getTime() + minutes * 60 * 1000);
}

export async function getLatestProducts(supplierId: string, limit = 500) {
  const result = await query(
    `SELECT matching_key, qty, updated_at
     FROM latest_stock
     WHERE supplier_id = $1
     ORDER BY updated_at DESC NULLS LAST
     LIMIT $2`,
    [supplierId, limit]
  );

  return result.rows.map((row) => ({
    matching_key: row.matching_key,
    qty: row.qty,
    updated_at: row.updated_at,
    status: Number(row.qty) > 0 ? "in_stock" : "out_of_stock",
  }));
}

type SupplierListRow = {
  supplier_id: string;
  name: string | null;
  status: string | null;
  connection_type: string | null;
  shop: unknown | null;
  last_sync: string | null;
  products_count: string | number | null;
};

export async function getSuppliers() {
  const result = await query<SupplierListRow>(
    `SELECT
       sp.supplier_id,
       sp.name,
       sp.status,
       sp.connection_type,
       sp.shop,
       MAX(sr.started_at) AS last_sync,
       COUNT(ls.matching_key) AS products_count
     FROM supplier_profiles sp
     LEFT JOIN sync_runs sr ON sr.supplier_id = sp.supplier_id
     LEFT JOIN latest_stock ls ON ls.supplier_id = sp.supplier_id
     GROUP BY sp.supplier_id, sp.name, sp.status, sp.connection_type, sp.shop
     ORDER BY sp.name ASC NULLS LAST`
  );

  return result.rows.map((row) => {
    const shop = normalizeJson(row.shop);
    const storeName = shop && typeof shop === "object" ? (shop as Record<string, unknown>).domain : null;

    const statusValue = String(row.status ?? "active");
    const normalizedStatus =
      statusValue === "active" ||
      statusValue === "attention_required" ||
      statusValue === "syncing" ||
      statusValue === "disconnected"
        ? statusValue
        : "active";

    return {
      id: row.supplier_id,
      supplier_id: row.supplier_id,
      name: row.name ?? row.supplier_id,
      status: normalizedStatus,
      connection_type: row.connection_type ?? null,
      store_name: typeof storeName === "string" ? storeName : null,
      last_sync: row.last_sync,
      products_count: Number(row.products_count ?? 0),
    };
  });
}

type RecentProductRow = {
  supplier_id: string;
  supplier_name: string | null;
  matching_key: string;
  qty: number;
  updated_at: string | null;
};

export async function getRecentProducts(limit = 6) {
  const result = await query<RecentProductRow>(
    `SELECT
       ls.supplier_id,
       sp.name AS supplier_name,
       ls.matching_key,
       ls.qty,
       ls.updated_at
     FROM latest_stock ls
     LEFT JOIN supplier_profiles sp ON sp.supplier_id = ls.supplier_id
     ORDER BY ls.updated_at DESC NULLS LAST
     LIMIT $1`,
    [limit]
  );

  return result.rows.map((row) => ({
    id: `${row.supplier_id}:${row.matching_key}`,
    name: row.matching_key,
    supplier_name: row.supplier_name ?? row.supplier_id,
    sku: row.matching_key,
    stock: Number(row.qty ?? 0),
    last_sync: row.updated_at,
    status: Number(row.qty ?? 0) > 0 ? "synced" : "pending",
  }));
}

type RecentRunRow = {
  run_id: string;
  supplier_id: string;
  supplier_name: string | null;
  status: string | null;
  started_at: string | null;
  finished_at: string | null;
  updated_count: number | null;
  error_count: number | null;
  error_summary: unknown | null;
};

export async function getRecentActivity(limit = 6) {
  const result = await query<RecentRunRow>(
    `SELECT
       sr.run_id,
       sr.supplier_id,
       sp.name AS supplier_name,
       sr.status,
       sr.started_at,
       sr.finished_at,
       sr.updated_count,
       sr.error_count,
       sr.error_summary
     FROM sync_runs sr
     LEFT JOIN supplier_profiles sp ON sp.supplier_id = sr.supplier_id
     ORDER BY sr.started_at DESC NULLS LAST
     LIMIT $1`,
    [limit]
  );

  return result.rows.map((row) => {
    const status = row.status ?? "unknown";
    const supplierName = row.supplier_name ?? row.supplier_id;
    const errorCount = Number(row.error_count ?? 0);
    const updated = Number(row.updated_count ?? 0);
    const errorSummary =
      typeof row.error_summary === "string" ? row.error_summary : null;

    if (status === "success") {
      return {
        id: row.run_id,
        title: "Sync completed",
        description: `${updated} products updated`,
        supplier_name: supplierName,
        type: "success",
        date: row.finished_at ?? row.started_at,
      };
    }

    if (status === "running") {
      return {
        id: row.run_id,
        title: "Sync running",
        description: "Inventory sync is still in progress",
        supplier_name: supplierName,
        type: "warning",
        date: row.started_at,
      };
    }

    if (status === "partial_failed" || status === "failed" || errorCount > 0) {
      return {
        id: row.run_id,
        title: "Sync failed",
        description: errorSummary || `Errors: ${errorCount}`,
        supplier_name: supplierName,
        type: "error",
        date: row.finished_at ?? row.started_at,
      };
    }

    return {
      id: row.run_id,
      title: `Sync ${status}`,
      description: `${updated} products updated`,
      supplier_name: supplierName,
      type: "warning",
      date: row.finished_at ?? row.started_at,
    };
  });
}

export async function disconnectSupplier(supplierId: string) {
  const result = await query(
    "UPDATE supplier_profiles SET status = 'disconnected' WHERE supplier_id = $1",
    [supplierId]
  );
  return result.rowCount ?? 0;
}
