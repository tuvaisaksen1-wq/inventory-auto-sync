import type { RouteConfig } from "@react-router/dev/routes";

export default [
  // Landing (/)
  { index: true, file: "routes/_index.tsx" },

  // App area (/app + children)
  {
    path: "app",
    file: "routes/app.tsx",
    children: [
      { index: true, file: "routes/app._index.tsx" },
      { path: "suppliers", file: "routes/app.suppliers.tsx" },
      { path: "suppliers/new", file: "routes/app.suppliers.new.tsx" },
      { path: "products", file: "routes/app.products.tsx" },
      { path: "settings", file: "routes/app.settings.tsx" },
    ],
  },
] satisfies RouteConfig;
