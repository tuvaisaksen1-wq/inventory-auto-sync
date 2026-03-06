import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import * as React from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type LinksFunction,
  useLoaderData,
} from "react-router";
import type { LoaderFunctionArgs } from "@react-router/node";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import tailwindStyles from "./tailwind.css?url";
import { addDocumentResponseHeaders } from "./shopify.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: polarisStyles },
  { rel: "stylesheet", href: tailwindStyles },
];

export function headers(headersArgs: Parameters<typeof addDocumentResponseHeaders>[0]) {
  return addDocumentResponseHeaders(headersArgs);
}

const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { ...init, headers });
};

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  return json({
    apiKey: process.env.SHOPIFY_API_KEY ?? null,
    host: url.searchParams.get("host"),
  });
}

export default function App() {
  const data = useLoaderData() as { apiKey: string | null; host: string | null };
  const apiKey = data.apiKey ?? undefined;
  const [resolvedHost, setResolvedHost] = React.useState<string | undefined>(data.host ?? undefined);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    if (data.host) {
      window.sessionStorage.setItem("shopify_host", data.host);
      setResolvedHost(data.host);
      return;
    }

    const fallbackHost = window.sessionStorage.getItem("shopify_host") ?? undefined;
    if (fallbackHost) {
      setResolvedHost(fallbackHost);
    }
  }, [data.host]);

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="min-h-full bg-slate-50">
        {apiKey && resolvedHost ? (
          <script
            src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
            data-api-key={apiKey}
            data-host={resolvedHost}
          />
        ) : null}
        <AppProvider i18n={enTranslations}>
          <Outlet />
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}