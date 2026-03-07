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

  const url = new URL(request.url);
  const shopParam = url.searchParams.get("shop");

  // ✅ Sjekk Authorization header (fra Base44 / ekstern klient)
  const authHeader = request.headers.get("Authorization") ?? "";
  const internalSecret = process.env.INTERNAL_API_SECRET ?? "";
  const isInternalCall = internalSecret && authHeader === `Bearer ${internalSecret}`;

  // Hvis det er intern kall med ?shop= → bruk stored token direkte (ingen Shopify sesjon nødvendig)
  if (isInternalCall && shopParam) {
    try {
      const storedStore = await getStoredShopifyStore(shopParam);
      if (!storedStore?.accessToken) {
        return jsonResponse({ error: "Shop not found or not authenticated" }, 404);
      }

      const location_id = await getPrimaryLocationId(shopParam, storedStore.accessToken);

      return jsonResponse({
        shop: shopParam,
        location_id,
      });
    } catch (error) {
      console.error("api.store (internal) failed", error);
      return jsonResponse({ error: "Could not load store details" }, 500);
    }
  }

  // Standard Shopify embedded-sesjon
  try {
    const { session } = await authenticate.admin(request);
    const storedStore = await getStoredShopifyStore(session.shop);
    const accessToken = storedStore?.accessToken ?? session.accessToken;

    if (!storedStore?.accessToken && session.accessToken) {
      await persistShopifyStore(session.shop, session.accessToken);
    }

    const location_id = await getPrimaryLocationId(session.shop, accessToken);
    return jsonResponse({ shop: session.shop, location_id });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("api.store failed", error);
    return jsonResponse({ error: "Could not load store details" }, 500);
  }
}
