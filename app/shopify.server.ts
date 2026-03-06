import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { prisma } from "./server/prisma.server";

const envScopes = (process.env.SCOPES ?? "")
  .split(",")
  .map((scope) => scope.trim())
  .filter(Boolean);

const requiredScopes = [
  "read_locations",
  "read_products",
  "read_inventory",
  "write_inventory",
];

const scopes = Array.from(new Set([...envScopes, ...requiredScopes]));

const CANONICAL_APP_URL = "https://inventory-auto-sync-production.up.railway.app";

const APP_URL_PLACEHOLDERS = new Set([
  "https://din-railway-app.up.railway.app",
  "https://your-app-url.railway.app",
]);

function normalizeUrl(rawValue: string) {
  const trimmedValue = rawValue.trim();
  if (!trimmedValue) return null;

  const valueWithScheme = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    const url = new URL(valueWithScheme);
    if (!url.hostname) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function resolveAppUrl() {
  const urlFromShopifyVar = normalizeUrl(process.env.SHOPIFY_APP_URL ?? "");
  if (urlFromShopifyVar && !APP_URL_PLACEHOLDERS.has(urlFromShopifyVar)) {
    return urlFromShopifyVar;
  }

  const urlFromAppVar = normalizeUrl(process.env.APP_URL ?? "");
  if (urlFromAppVar && !APP_URL_PLACEHOLDERS.has(urlFromAppVar)) {
    return urlFromAppVar;
  }

  const urlFromHost = normalizeUrl(process.env.HOST ?? "");
  if (urlFromHost && !APP_URL_PLACEHOLDERS.has(urlFromHost)) {
    return urlFromHost;
  }

  return CANONICAL_APP_URL;
}

const appUrl = resolveAppUrl();

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY ?? "",
  apiSecretKey: process.env.SHOPIFY_API_SECRET ?? "",
  scopes,
  appUrl,
  apiVersion: ApiVersion.January26,
  distribution: AppDistribution.AppStore,

  // bruk kun standard session lagring
  sessionStorage: new PrismaSessionStorage(prisma),
});

export default shopify;
export const authenticate = shopify.authenticate;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
