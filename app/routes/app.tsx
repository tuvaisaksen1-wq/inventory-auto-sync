import type { LoaderFunctionArgs } from "@react-router/node";
import { Outlet, useLocation } from "react-router";
import { NavMenu } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

const navItems = [
  { label: "Dashboard", href: "/app" },
  { label: "Suppliers", href: "/app/suppliers" },
  { label: "Products", href: "/app/products" },
  { label: "Activity", href: "/app/activity" },
  { label: "Settings", href: "/app/settings" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return null;
}

export default function AppLayout() {
  const location = useLocation();

  const withSearch = (pathname: string) => ({
    pathname,
    search: location.search,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <NavMenu>
        <a href={`${withSearch("/app").pathname}${withSearch("/app").search}`} rel="home">
          Dashboard
        </a>

        {navItems
          .filter((item) => item.href !== "/app")
          .map((item) => (
            <a
              key={item.href}
              href={`${withSearch(item.href).pathname}${withSearch(item.href).search}`}
            >
              {item.label}
            </a>
          ))}
      </NavMenu>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
