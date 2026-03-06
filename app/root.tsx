import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
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
  const host = data.host ?? undefined;

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="min-h-full bg-slate-50">
        {apiKey && host ? (
          <script
            src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
            data-api-key={apiKey}
            data-host={host}
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
