import type { LoaderFunctionArgs } from "@react-router/node";
import { authenticate } from "../shopify.server";
import { getPrimaryLocationId } from "../server/shopify-store.server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { session } = await authenticate.admin(request);
    const location_id = await getPrimaryLocationId(session.shop, session.accessToken);

    return new Response(
      JSON.stringify({
        shop: session.shop,
        location_id,
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("api.store failed", error);

    return new Response(JSON.stringify({ error: "Could not load store details" }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
