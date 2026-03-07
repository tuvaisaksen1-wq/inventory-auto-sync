import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { prisma } from "./server/prisma.server";
import { persistOfflineAdminSession } from "./server/shopify-token.server";

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
@@ -45,72 +46,41 @@ function normalizeUrl(rawValue: string) {
}

function resolveAppUrl() {
  const candidates = [
    process.env.SHOPIFY_APP_URL ?? "",
    process.env.APP_URL ?? "",
    process.env.HOST ?? "",
  ];

  for (const candidate of candidates) {
    const normalizedUrl = normalizeUrl(candidate);
    if (normalizedUrl && !APP_URL_PLACEHOLDERS.has(normalizedUrl)) {
      return normalizedUrl;
    }
  }

  return CANONICAL_APP_URL;
}

const appUrl = resolveAppUrl();

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY ?? "",
  apiSecretKey: process.env.SHOPIFY_API_SECRET ?? "",
  scopes,
  appUrl: process.env.SHOPIFY_APP_URL ?? process.env.APP_URL ?? "",
  appUrl,
  apiVersion: ApiVersion.January26,
  distribution: AppDistribution.AppStore,

  // bruk kun standard session lagring
  sessionStorage: new PrismaSessionStorage(prisma),
  hooks: {
    afterAuth: async ({ session }) => {
      await persistOfflineAdminSession(session);
    },
  },
});

export default shopify;
export const authenticate = shopify.authenticate;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
shopify.app.toml
shopify.app.toml
+2
-1

@@ -2,27 +2,28 @@ client_id = "7964c46ff5b017b0fb5541d11946f0ef"
name = "inventory-auto-sync-v2"
application_url = "https://inventory-auto-sync-production.up.railway.app"
embedded = true

[build]
automatically_update_urls_on_dev = true

[webhooks]
api_version = "2026-01"

[[webhooks.subscriptions]]
topics = ["app/scopes_update"]
uri = "/webhooks/app/scopes_update"

[[webhooks.subscriptions]]
topics = ["app/uninstalled"]
uri = "/webhooks/app/uninstalled"

[access_scopes]
scopes = "read_locations,read_products,read_inventory,write_inventory,write_products"
optional_scopes = []
use_legacy_install_flow = false

[auth]
redirect_urls = [
  "https://inventory-auto-sync-production.up.railway.app/auth/callback"
  "https://inventory-auto-sync-production.up.railway.app/auth/callback",
  "https://inventory-auto-sync-production.up.railway.app/api/auth/callback"
]
