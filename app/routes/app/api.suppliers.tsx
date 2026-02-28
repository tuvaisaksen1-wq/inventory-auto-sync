import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  if (!token || token !== process.env.INTERNAL_API_SECRET) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  return json({
    suppliers: [],
    message: "Suppliers endpoint works",
  });
}
