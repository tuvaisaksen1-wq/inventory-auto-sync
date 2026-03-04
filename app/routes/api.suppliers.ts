import { data } from "react-router";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  if (!token || token !== process.env.INTERNAL_API_SECRET) {
    return data({ error: "Unauthorized" }, { status: 401 });
  }

  return data({
    suppliers: [],
    message: "Suppliers endpoint works",
  });
}
