import type { LoaderFunctionArgs } from "@react-router/node";
import { getLatestSyncRun, getSyncRunById } from "../server/sync.server";

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
    return json(
      { ok: false, message: "Missing run_id or supplier_id" },
      { status: 400 }
    );
  }

  let latest;
  try {
    latest = runId ? await getSyncRunById(runId) : await getLatestSyncRun(supplierId as string);
  } catch (error) {
    return json(
      { ok: false, message: "Database error", error: String(error) },
      { status: 500 }
    );
  }

  if (!latest) {
    return json({ ok: true, status: null });
  }

  return json({ ok: true, status: latest });
}
