import type { RouteConfig } from "@react-router/dev/routes";

export default [
  { path: "/", file: "routes/_index.tsx" },
  { path: "/health", file: "routes/health.tsx" },
  { path: "/build.txt", file: "routes/build.txt.tsx" },
  { path: "/start-sync", file: "routes/start-sync.tsx" },
  { path: "/sync-status", file: "routes/sync-status.tsx" },
  { path: "/products/:supplier_id", file: "routes/products.$supplier_id.tsx" },
  { path: "/auth/login", file: "routes/auth.login.tsx" },
  { path: "/auth/session-token", file: "routes/auth.session-token.tsx" },
  { path: "/auth/exit-iframe", file: "routes/auth.exit-iframe.tsx" },
  { path: "/webhooks/app/uninstalled", file: "routes/webhooks.app.uninstalled.tsx" },
  { path: "/webhooks/app/scopes_update", file: "routes/webhooks.app.scopes_update.tsx" },
  { path: "/api/supplier-setup", file: "routes/api.supplier-setup.tsx" },
  { path: "/api/suppliers/:supplier_id", file: "routes/api.suppliers.$supplier_id.tsx" },
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
  // Legacy direct routes (optional)
  { path: "/dashboard", file: "routes/dashboard.tsx" },
  { path: "/suppliers", file: "routes/suppliers.tsx" },
  { path: "/products", file: "routes/products.tsx" },
  { path: "/activity", file: "routes/activity.tsx" },
  { path: "/settings", file: "routes/settings.tsx" },
  { path: "/add-supplier", file: "routes/add-supplier.tsx" },
] satisfies RouteConfig;
