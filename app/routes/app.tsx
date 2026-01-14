import { Outlet, Link, useLocation } from "react-router";

const navItems = [
  { label: "Dashboard", href: "/app" },
  { label: "Suppliers", href: "/app/suppliers" },
  { label: "Products", href: "/app/products" },
  { label: "Activity", href: "/app/activity" },
  { label: "Settings", href: "/app/settings" },
];

export default function AppLayout() {
  const location = useLocation();
  const withSearch = (pathname: string) => ({
    pathname,
    search: location.search,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200/70">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
          <div className="text-lg font-bold text-slate-900">
            STOCK<span className="text-blue-500">SYNC</span>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={withSearch(item.href)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex-1" />
          <Link
            to={withSearch("/app/suppliers/new")}
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-3 py-2 text-sm font-semibold shadow"
          >
            + Add Supplier
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
