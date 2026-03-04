import { data } from "react-router";
import { prisma } from "~/server/prisma.server";

export async function loader() {
  const session = await prisma.session.findFirst({
    where: { isOnline: false },
  });

  if (!session) {
    return data({ error: "No Shopify session found" }, { 
      status: 404,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }

  return data({
    shop: session.shop,
    access_token: session.accessToken,
    location_id: null
  }, {
    headers: { "Access-Control-Allow-Origin": "*" }
  });
}

export function options() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}
