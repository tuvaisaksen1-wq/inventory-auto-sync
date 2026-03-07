import type { RouteConfig } from "@react-router/dev/routes";

export default [
  { path: "/", file: "routes/_index.tsx" },
  { path: "/health", file: "routes/health.tsx" },
  { path: "/build.txt", file: "routes/build.txt.tsx" },
  { path: "/start-sync", file: "routes/start-sync.tsx" },
  { path: "/sync-status", file: "routes/sync-status.tsx" },
  { path: "/products/:supplier_id", file: "routes/products.$supplier_id.tsx" },
codex/fix-oauth-and-installation-flow-in-shopify-app-015a5e
  // Shopify OAuth/auth UI routes.

codex/fix-oauth-and-installation-flow-in-shopify-app-rm1c91
  // Shopify OAuth/auth UI routes.
  { path: "/auth", file: "routes/auth.tsx" },
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-wljg7q
  // Shopify OAuth/auth UI routes.
  { path: "/auth", file: "routes/auth.tsx" },
=======
codex/fix-oauth-and-installation-flow-in-shopify-app-34dsd9
  // Shopify OAuth/auth UI routes.

codex/fix-oauth-and-installation-flow-in-shopify-app-e35z65
  // Shopify OAuth/auth UI routes.

codex/fix-oauth-and-installation-flow-in-shopify-app-8lqqs8
  // Shopify OAuth/auth UI routes.
  
codex/fix-oauth-and-installation-flow-in-shopify-app-hexsgy
  // Shopify OAuth/auth UI routes.
  main
  { path: "/auth", file: "routes/auth.tsx" },
  { path: "/auth/callback", file: "routes/auth.callback.tsx" },
main
main
  { path: "/auth/login", file: "routes/auth.login.tsx" },
  { path: "/auth/callback", file: "routes/auth.callback.tsx" },
  { path: "/auth/session-token", file: "routes/auth.session-token.tsx" },
  { path: "/auth/exit-iframe", file: "routes/auth.exit-iframe.tsx" },

  { path: "/webhooks/app/uninstalled", file: "routes/webhooks.app.uninstalled.tsx" },
  { path: "/webhooks/app/scopes_update", file: "routes/webhooks.app.scopes_update.tsx" },
  { path: "/api/auth/callback", file: "routes/api.auth.callback.tsx" },
  { path: "/api/store", file: "routes/api.store.ts" },
  { path: "/api/sync", file: "routes/api.sync.ts" },
  {
    path: "/app",
    file: "routes/app.tsx",
    children: [
      { index: true, file: "routes/app._index.tsx" },
      { path: "activity", file: "routes/app.activity.tsx" },
      { path: "products", file: "routes/app.products.tsx" },
      { path: "settings", file: "routes/app.settings.tsx" },
      { path: "suppliers", file: "routes/app.suppliers.tsx" },
      { path: "suppliers/new", file: "routes/app.suppliers.new.tsx" },
    ],
  },

  { path: "/dashboard", file: "routes/dashboard.tsx" },
  { path: "/suppliers", file: "routes/suppliers.tsx" },
  { path: "/products", file: "routes/products.tsx" },
  { path: "/activity", file: "routes/activity.tsx" },
  { path: "/settings", file: "routes/settings.tsx" },
  { path: "/add-supplier", file: "routes/add-supplier.tsx" },
] satisfies RouteConfig;
