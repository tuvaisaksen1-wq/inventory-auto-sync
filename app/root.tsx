import { AppProvider as PolarisProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-react-router/react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type LinksFunction,
  useLoaderData,
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
  const responseHeaders = new Headers(init.headers);
  responseHeaders.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { ...init, headers: responseHeaders });
};

export function loader() {
  return json({
    apiKey: process.env.SHOPIFY_API_KEY ?? null,
  });
}

export default function App() {
  const data = useLoaderData() as { apiKey: string | null };
  const apiKey = data.apiKey;

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="min-h-full bg-slate-50">
        {apiKey ? (
          <ShopifyAppProvider embedded apiKey={apiKey}>
            <PolarisProvider i18n={enTranslations}>
              <Outlet />
            </PolarisProvider>
          </ShopifyAppProvider>
        ) : (
          <ShopifyAppProvider embedded={false}>
            <PolarisProvider i18n={enTranslations}>
              <Outlet />
            </PolarisProvider>
          </ShopifyAppProvider>
        )}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
