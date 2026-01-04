import { Outlet, Link, useLocation } from "react-router";
import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";

export default function AppLayout() {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", href: "/app" },
    { label: "Suppliers", href: "/app/suppliers" },
    { label: "Products", href: "/app/products" },
    { label: "Activity", href: "/app/activity" },
    { label: "Settings", href: "/app/settings" },
  ];

  return (
    <AppProvider i18n={enTranslations}>
      <div className="flex min-h-screen bg-slate-50">
        <aside className="fixed inset-y-0 left-0 w-64 bg-[#0f172a] text-white z-40 hidden lg:block">
          <div className="flex flex-col h-full p-6">
            <div className="mb-10 px-2 text-xl font-bold tracking-tight">
              STOCK<span className="text-blue-400">SYNC</span>
            </div>
            <nav className="flex-1 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    location.pathname === item.href 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                      : "text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <main className="flex-1 lg:pl-64 text-slate-900">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </AppProvider>
  );
}