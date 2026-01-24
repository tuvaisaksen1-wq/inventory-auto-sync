import type { ActionFunctionArgs } from "@react-router/node";
import { authenticate } from "../shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.webhook(request);
  return new Response(null, { status: 204 });
}

export default function ScopesUpdateWebhook() {
  return null;
}
