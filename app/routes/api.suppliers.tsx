import { data } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { requireInternalToken } from "../../src/middleware/internalAuth";

export async function loader({ request }: LoaderFunctionArgs) {
  requireInternalToken(request);

  return data({
    suppliers: [],
    message: "Suppliers endpoint works",
  });
}

