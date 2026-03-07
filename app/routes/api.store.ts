codex/fix-build-error-in-shopify.server.ts-hz4bd2
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@react-router/node";
import type { LoaderFunctionArgs } from "@react-router/node";
main
import { authenticate } from "../shopify.server";
import { getPrimaryLocationId } from "../server/shopify-store.server";

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
    const location_id = await getPrimaryLocationId(session.shop, session.accessToken);

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

  return jsonResponse({ error: "Method not allowed" }, 405);
}


export async function action({ request }: { request: Request }) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: CORS_HEADERS,
  });
}
