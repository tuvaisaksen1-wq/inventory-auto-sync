import type { ActionFunctionArgs, LoaderFunctionArgs } from "@react-router/node";

import { authenticate } from "../shopify.server";
import { getPrimaryLocationId } from "../server/shopify-store.server";
import {
  getStoredShopifyStore,
  persistShopifyStore,
} from "../server/shopify-token.server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const { session } = await authenticate.admin(request);

    const storedStore = await getStoredShopifyStore(session.shop);
    const accessToken = storedStore?.accessToken ?? session.accessToken;

    if (!storedStore?.accessToken && session.accessToken) {
      await persistShopifyStore(session.shop, session.accessToken);
    }

    const location_id = await getPrimaryLocationId(session.shop, accessToken);

    return jsonResponse({
      shop: session.shop,
      location_id,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("api.store failed", error);
    return jsonResponse({ error: "Could not load store details" }, 500);
  }
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
}
