import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "@react-router/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const host = url.searchParams.get("host");

  if (!shop) {
    const loginUrl = new URL("/auth/login", url.origin);
    if (host) {
      loginUrl.searchParams.set("host", host);
    }
    return redirect(`${loginUrl.pathname}${loginUrl.search}`);
  }

  const appUrl = new URL("/app", url.origin);
  appUrl.searchParams.set("shop", shop);
  if (host) {
    appUrl.searchParams.set("host", host);
  }

  return redirect(`${appUrl.pathname}${appUrl.search}`);
}

export default function Index() {
  return null;
}
