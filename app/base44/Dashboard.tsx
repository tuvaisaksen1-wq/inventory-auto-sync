import React from "react";
import { Link, useLocation } from "react-router";
import { CheckCircle2, Link2, Package, Zap, BadgeCheck, AlertTriangle, ArrowRight } from "lucide-react";

type SupplierStatus = "active" | "attention_required" | "syncing" | "disconnected";
type ProductStatus = "synced" | "pending" | "error";

interface Supplier {
  id: string;
  name: string;
  store_name?: string | null;
  status: SupplierStatus;
  last_sync?: string | null;
  products_count?: number;
  icon_color?: string;
}

interface Product {
  id: string;
  name: string;
  supplier_name: string;
  sku: string;
  stock: number;
  last_sync?: string | null;
  status: ProductStatus;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  supplier_name: string;
  type: "success" | "warning" | "error";
  date?: string | null;
  old_value?: string;
  new_value?: string;
}

export default function Dashboard({
  suppliers = [],
  products = [],
  activity = [],
}: {
  suppliers?: Supplier[];
  products?: Product[];
  activity?: Activity[];
}) {
  const location = useLocation();
  const withSearch = (pathname: string) => ({
    pathname,
    search: location.search,
  });
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.status === "active").length;
  const totalProducts = products.length;
  const syncedProducts = products.filter((p) => p.status === "synced").length;
  const stockoutsPrevented = 0;

  const lastSync = suppliers.reduce<string | null>((latest, s) => {
    if (!s.last_sync) return latest;
    if (!latest || new Date(s.last_sync) > new Date(latest)) return s.last_sync;
    return latest;
  }, null);

  const hasIssues = suppliers.some((s) => s.status !== "active");
  const healthLabel = hasIssues ? "Needs attention" : "All good";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Inventory sync overview</p>
        </div>
        <Link
          to={withSearch("/app/suppliers/new")}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold shadow-md hover:bg-indigo-700"
        >
          <span className="text-base leading-none">＋</span>
          Add Supplier
        </Link>
      </div>

      <StatusBanner lastSync={lastSync} hasIssues={hasIssues} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Suppliers" value={activeSuppliers} subtitle={`${totalSuppliers} total connected`} icon={<Link2 className="h-5 w-5 text-white" />} />
        <StatCard title="Products Synced" value={syncedProducts} subtitle={`${totalProducts} total products`} icon={<Package className="h-5 w-5 text-white" />} />
        <StatCard title="Stockouts Prevented" value={stockoutsPrevented} subtitle="Total since start" icon={<CheckCircle2 className="h-5 w-5 text-white" />} />
        <StatCard
          title="Sync Health"
          value={healthLabel}
          subtitle={hasIssues ? "Some suppliers need attention" : "No issues detected"}
          icon={<Zap className="h-5 w-5 text-white" />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card header="Connected Suppliers" actionLabel="View All" actionHref="/app/suppliers">
            <div className="divide-y divide-slate-100">
              {suppliers.length === 0 ? (
                <EmptyState label="No suppliers yet" />
              ) : (
                suppliers.map((s) => <SupplierRow key={s.id} supplier={s} />)
              )}
            </div>
          </Card>

          <Card header="Connected Products" actionLabel="View All" actionHref="/app/products">
            <div className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <EmptyState label="No products synced yet" />
              ) : (
                products.map((p) => <ProductRow key={p.id} product={p} />)
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card header="Recent Activity" actionLabel="View All" actionHref="/app/activity">
            <div className="space-y-4">
              {activity.length === 0 ? (
                <EmptyState label="No activity yet" />
              ) : (
                activity.map((a) => <ActivityRow key={a.id} activity={a} />)
              )}
            </div>
          </Card>

          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5 text-center">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Guide to how the app works</h3>
            <p className="text-sm text-slate-600 mb-4">Step-by-step guide on how everything works and where to find what</p>
            <button className="rounded-lg border border-indigo-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-indigo-50">Open Guide</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBanner({ lastSync, hasIssues }: { lastSync: string | null; hasIssues: boolean }) {
  return (
    <div
      className={`rounded-2xl p-4 flex items-center gap-3 ${
        hasIssues ? "bg-amber-50 border border-amber-200" : "bg-emerald-50 border border-emerald-200"
      }`}
    >
      <div
        className={`h-10 w-10 rounded-xl flex items-center justify-center shadow ${
          hasIssues ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
        }`}
      >
        {hasIssues ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
      </div>
      <div>
        <p className="font-semibold text-slate-800">{hasIssues ? "Some suppliers need attention" : "All synced"}</p>
        <p className="text-sm text-slate-600">Last sync: {formatTimeAgo(lastSync)}</p>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/70 shadow-sm">
      <div className="p-4 flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className="h-11 w-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow text-white">
          {icon}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600" />
    </div>
  );
}

function Card({
  header,
  actionLabel,
  actionHref,
  children,
}: {
  header: string;
  actionLabel?: string;
  actionHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-800">{header}</h3>
        </div>
        {actionLabel && actionHref && (
          <Link to={actionHref} className="text-sm font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1">
            {actionLabel} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function SupplierRow({ supplier }: { supplier: Supplier }) {
  const iconColors = ["bg-indigo-500", "bg-violet-500", "bg-cyan-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
  const color = supplier.icon_color || iconColors[(supplier.name.charCodeAt(0) || 0) % iconColors.length];
  const statusConfig: Record<
    SupplierStatus,
    { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }
  > = {
    active: { label: "Active", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
    attention_required: { label: "Needs attention", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle },
    syncing: { label: "Syncing", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: Link2 },
    disconnected: { label: "Disconnected", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", icon: AlertTriangle },
  };
  const status = statusConfig[supplier.status];
  const StatusIcon = status.icon;
  return (
    <div className="flex items-center gap-4 py-3">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm ${color}`}>
        {supplier.name.substring(0, 1).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 truncate">{supplier.name}</p>
        <p className="text-sm text-slate-500 truncate">Connected to: {supplier.store_name || "Your Store"}</p>
      </div>
      <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
        <Package className="h-4 w-4 text-slate-400" />
        <span className="font-medium">{supplier.products_count}</span>
        <span className="text-xs text-slate-400">products synced</span>
      </div>
      <div className="text-sm text-slate-500">{formatTimeAgo(supplier.last_sync)}</div>
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${status.bg} ${status.color} ${status.border}`}>
        <StatusIcon className="h-4 w-4" /> {status.label}
      </span>
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  const statusMap: Record<ProductStatus, { label: string; color: string; bg: string; border: string }> = {
    synced: { label: "Synced", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
    pending: { label: "Pending", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
    error: { label: "Error", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" },
  };
  const status = statusMap[product.status];

  return (
    <div className="grid md:grid-cols-[2fr_1fr_0.8fr_0.6fr_0.8fr] items-center gap-3 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-medium">IMG</div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 truncate">{product.name}</p>
          <p className="text-sm text-slate-500 truncate">Connected to: {product.supplier_name}</p>
        </div>
      </div>
      <div className="text-sm font-mono px-2 py-1 bg-slate-100 rounded-lg border border-slate-200 inline-flex w-max">{product.sku}</div>
      <div className="text-sm font-semibold text-slate-800">{product.stock}</div>
      <div className="text-sm text-slate-500">{formatTimeAgo(product.last_sync)}</div>
      <div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${status.bg} ${status.color} ${status.border}`}>
          <BadgeCheck className="h-4 w-4" /> {status.label}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="p-6 text-center text-slate-500">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 text-slate-400 mb-2">
        <Package className="h-6 w-6" />
      </div>
      <p>{label}</p>
    </div>
  );
}

function ActivityRow({ activity }: { activity: Activity }) {
  const colorByType =
    activity.type === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : activity.type === "warning"
      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
      : "bg-rose-50 text-rose-700 border-rose-200";
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${colorByType}`}>
      <div className="w-1 rounded-full bg-current opacity-60" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800">{activity.title}</p>
        <p className="text-sm text-slate-600">{activity.description}</p>
        <p className="text-xs text-slate-500 mt-1">
          Supplier: <span className="font-medium text-slate-700">{activity.supplier_name}</span>
        </p>
        {(activity.old_value || activity.new_value) && (
          <div className="flex items-center gap-2 mt-2 text-sm">
            {activity.old_value && <Badge text={activity.old_value} className="bg-rose-100 text-rose-700 border border-rose-200" />}
            {activity.old_value && activity.new_value && <span className="text-slate-400">→</span>}
            {activity.new_value && <Badge text={activity.new_value} className="bg-emerald-100 text-emerald-700 border border-emerald-200" />}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(activity.date)}</p>
        {activity.type === "error" && (
          <button className="text-xs font-semibold text-rose-600 mt-1 hover:text-rose-700">Fix Now →</button>
        )}
      </div>
    </div>
  );
}

function Badge({ text, className }: { text: string; className?: string }) {
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${className}`}>{text}</span>;
}

function formatTimeAgo(value?: string | null) {
  if (!value) return "Never";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  if (months >= 1) return `${months} month${months === 1 ? "" : "s"} ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
