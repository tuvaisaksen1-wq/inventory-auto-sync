codex/fix-oauth-and-installation-flow-in-shopify-app-dl5ye1
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-rm1c91
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-wljg7q
main
main
import type { LoaderFunctionArgs } from "@react-router/node";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return null;
}

export default function Auth() {
  return null;
}
codex/fix-oauth-and-installation-flow-in-shopify-app-dl5ye1
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-rm1c91
=======
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  return authenticate.admin(request);
};
main

main
