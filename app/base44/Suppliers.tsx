import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { CheckCircle2, AlertTriangle, Link2, Search, Box, MoreHorizontal, ExternalLink } from "lucide-react";
import { SupplierDetailsModal } from "./components/SupplierDetailsModal";
import { SupplierEditModal } from "./components/SupplierEditModal";

type SupplierStatus = "active" | "attention_required" | "syncing" | "disconnected";
type ConnectionType = "google_sheet" | "api" | "csv_excel" | "shopify" | "woocommerce" | "url";

interface Supplier {
  id: string;
  name: string;
  store_name?: string;
  status: SupplierStatus;
  last_sync?: string | null;
  products_count?: number;
  connection_type?: ConnectionType;
  icon_color?: string;
}

const fallbackSuppliers: Supplier[] = [];

const statusConfig: Record<
  SupplierStatus,
  { label: string; color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  active: { label: "Active", color: "text-emerald-700", bg: "bg-emerald-50", icon: CheckCircle2 },
  attention_required: { label: "Needs attention", color: "text-amber-700", bg: "bg-amber-50", icon: AlertTriangle },
  syncing: { label: "Syncing", color: "text-blue-700", bg: "bg-blue-50", icon: Link2 },
  disconnected: { label: "Disconnected", color: "text-rose-700", bg: "bg-rose-50", icon: AlertTriangle },
};

const connectionTypeLabels: Record<ConnectionType, string> = {
  google_sheet: "Google Sheet",
  api: "API Connection",
  csv_excel: "CSV/Excel",
  shopify: "Shopify",
  woocommerce: "WooCommerce",
  url: "URL",
};

function formatTimeAgo(value?: string | null) {
  if (!value) return "Never";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

export default function Suppliers({ initialSuppliers = fallbackSuppliers }: { initialSuppliers?: Supplier[] }) {
  const location = useLocation();
  const withSearch = (pathname: string) => ({
    pathname,
    search: location.search,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.store_name || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchType = typeFilter === "all" || s.connection_type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [suppliers, search, statusFilter, typeFilter]);

  const hasIssues = filtered.some((s) => s.status !== "active");
  const lastSync = filtered.reduce<string | null>((latest, s) => {
    if (!s.last_sync) return latest;
    if (!latest || new Date(s.last_sync) > new Date(latest)) return s.last_sync;
    return latest;
  }, null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
          <p className="text-slate-500">{filtered.length} suppliers connected</p>
        </div>
        <Link
          to={withSearch("/app/suppliers/new")}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-white font-semibold shadow-md"
        >
          + Add Supplier
        </Link>
      </div>

      {/* Status banner */}
      <div className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${hasIssues ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
          {hasIssues ? <AlertTriangle className="h-5 w-5 text-amber-500" /> : <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{hasIssues ? "Some suppliers need attention" : "All synced"}</p>
          <p className="text-sm text-slate-500">Last sync: {formatTimeAgo(lastSync)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-3 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="attention_required">Needs attention</option>
          <option value="disconnected">Disconnected</option>
          <option value="syncing">Syncing</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
        >
          <option value="all">All types</option>
          <option value="api">API</option>
          <option value="google_sheet">Google Sheet</option>
          <option value="csv_excel">CSV/Excel</option>
          <option value="shopify">Shopify</option>
          <option value="woocommerce">WooCommerce</option>
          <option value="url">URL</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-visible">
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_0.2fr] px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-100">
          <div>Name</div>
          <div>Products synced</div>
          <div>Last sync</div>
          <div>Status</div>
          <div />
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 text-slate-400 mb-2">
                <Box className="h-6 w-6" />
              </div>
              <p>No suppliers found</p>
            </div>
          ) : (
            filtered.map((s) => (
              <SupplierRow
                key={s.id}
                supplier={s}
                onViewDetails={() => setSelectedSupplier(s)}
                onEdit={() => setEditSupplier(s)}
                onDisconnect={async () => {
                  const ok = confirm(`Are you sure you want to disconnect ${s.name}?`);
                  if (!ok) return;
                  setDisconnectError(null);
                  try {
                    const res = await fetch(`/api/suppliers/${encodeURIComponent(s.id)}`, {
                      method: "DELETE",
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      setDisconnectError(data?.message || "Failed to disconnect supplier.");
                      return;
                    }
                    setSuppliers((prev) =>
                      prev.map((item) =>
                        item.id === s.id ? { ...item, status: "disconnected" } : item
                      )
                    );
                    setSelectedSupplier((prev) => (prev?.id === s.id ? null : prev));
                    setEditSupplier((prev) => (prev?.id === s.id ? null : prev));
                  } catch (error) {
                    setDisconnectError(`Failed to reach backend: ${String(error)}`);
                  }
                }}
              />
            ))
          )}
        </div>
        {disconnectError ? <p className="px-4 pb-4 text-sm text-rose-600">{disconnectError}</p> : null}
      </div>

      <SupplierDetailsModal supplier={selectedSupplier} open={!!selectedSupplier} onClose={() => setSelectedSupplier(null)} />
      <SupplierEditModal supplier={editSupplier} open={!!editSupplier} onClose={() => setEditSupplier(null)} />
    </div>
  );
}

function SupplierRow({
  supplier,
  onViewDetails,
  onEdit,
  onDisconnect,
}: {
  supplier: Supplier;
  onViewDetails: () => void;
  onEdit: () => void;
  onDisconnect: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const status = statusConfig[supplier.status];
  const StatusIcon = status.icon;

  const iconColors = ["bg-indigo-500", "bg-violet-500", "bg-cyan-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
  const color = supplier.icon_color || iconColors[(supplier.name.charCodeAt(0) || 0) % iconColors.length];

  return (
    <div className="relative grid md:grid-cols-[2fr_1fr_1fr_1fr_0.2fr] px-4 py-4 items-center gap-3 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all duration-150">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm ${color}`}>
          {supplier.name.substring(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 truncate">{supplier.name}</p>
          <p className="text-sm text-slate-500 truncate">Connected to: {supplier.store_name || "Your Store"}</p>
        </div>
      </div>

      <div className="hidden md:block text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-slate-400" />
          <span className="font-medium">{supplier.products_count || 0}</span>
          <span className="text-xs text-slate-400">products synced</span>
        </div>
      </div>

      <div className="hidden md:block text-sm text-slate-500">{formatTimeAgo(supplier.last_sync)}</div>

      <div className="hidden md:block">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${status.bg} ${status.color} ${status.border}`}>
          <StatusIcon className="h-4 w-4" />
          {status.label}
        </span>
      </div>

      <div className="flex justify-end relative">
        <button
          className="p-2 rounded-lg hover:bg-slate-100 bg-slate-50"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
        >
          <MoreHorizontal className="h-4 w-4 text-slate-500" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-11 z-50 w-48 rounded-2xl border border-slate-200 bg-white shadow-2xl py-2">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onViewDetails();
              }}
            >
              <ExternalLink className="h-4 w-4 text-slate-500" />
              View Details
            </button>
            <button
              className="w-full text-left px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onEdit();
              }}
            >
              Edit
            </button>
            <button
              className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onDisconnect();
              }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
