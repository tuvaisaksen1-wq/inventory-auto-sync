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
  useLocation,
} from "react-router";
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

export function loader() {
  return json({
    apiKey: process.env.SHOPIFY_API_KEY ?? null,
    host: process.env.SHOPIFY_HOST ?? null,
  });
}

export default function App() {
  const data = useLoaderData() as { apiKey: string | null; host: string | null };
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const embeddedFromQuery =
    searchParams.get("embedded") === "1" || searchParams.get("embedded") === "true";
  const hostParam = searchParams.get("host");
  const resolvedHost = hostParam ?? data.host ?? null;
  const embedded = embeddedFromQuery || Boolean(resolvedHost);
  const apiKey = data.apiKey ?? undefined;

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const hostFromUrl = searchParams.get("host");
    if (hostFromUrl) {
      window.sessionStorage.setItem("shopify_host", hostFromUrl);
      return;
    }
    if (data.host) {
      const url = new URL(window.location.href);
      url.searchParams.set("host", data.host);
      url.searchParams.set("embedded", "1");
      window.history.replaceState({}, "", url.toString());
      return;
    }
  }, [location.search]);

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="min-h-full bg-slate-50">
        {embedded && apiKey && resolvedHost ? (
          <script
            src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
            data-api-key={apiKey}
            data-host={resolvedHost}
            data-force-redirect="true"
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
