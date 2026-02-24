import type { LoaderFunctionArgs } from "@react-router/node";
import { getLatestSyncRun, getSyncRunById, parseSummary, normalizeJson } from "../server/sync.server";

const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { ...init, headers });
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const runId = url.searchParams.get("run_id");
  const supplierId = url.searchParams.get("supplier_id");

  if (!runId && !supplierId) {
    return json({ ok: false, message: "Missing run_id or supplier_id" }, { status: 400 });
  }

  let latest;
  try {
    latest = runId
      ? await getSyncRunById(runId)
      : await getLatestSyncRun(supplierId as string);
  } catch (error) {
    return json({ ok: false, message: "Database error", error: String(error) }, { status: 500 });
  }

  if (!latest) {
    return json({ ok: true, status: null, summary: null });
  }

  const parsedSummary = normalizeJson(latest.summary);
  const parsedError =
    typeof latest.error_summary === "string"
      ? parseSummary(latest.error_summary)
      : normalizeJson(latest.error_summary);

  const summary = parsedSummary ?? parsedError ?? null;

  return json({
    ok: true,
    status: latest.status ?? (summary ? "success" : "queued"),
    run_id: latest.run_id,
    supplier_id: latest.supplier_id,
    trigger: latest.trigger,
    started_at: latest.started_at,
    finished_at: latest.finished_at,
    updated_count: latest.updated_count ?? 0,
    skipped_count: latest.skipped_count ?? 0,
    not_found_count: latest.not_found_count ?? 0,
    error_count: latest.error_count ?? 0,
    summary,
    next_run_at: latest.next_run_at,
    next_check: (summary as any)?.next_check ?? latest.next_run_at ?? null,
  });
}

