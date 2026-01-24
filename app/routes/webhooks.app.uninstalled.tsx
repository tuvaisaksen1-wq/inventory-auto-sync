import type { ActionFunctionArgs } from "@react-router/node";
import shopify, { authenticate } from "../shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.webhook(request);

  if (session) {
    await shopify.sessionStorage.deleteSession(session.id);
  }

  return new Response(null, { status: 204 });
}

export default function AppUninstalledWebhook() {
  return null;
}
