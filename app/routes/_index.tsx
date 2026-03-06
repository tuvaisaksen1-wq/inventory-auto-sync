import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "@react-router/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return redirect("/auth/login");
  }

  return redirect(`/app?shop=${shop}`);
}

export default function Index() {
  return null;
}
