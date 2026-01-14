import { MoreHorizontal, CheckCircle2, AlertTriangle, RefreshCw, Package, ExternalLink } from "lucide-react";
import { cn } from "../../utils";

export type SupplierStatus = "active" | "attention_required" | "syncing" | "disconnected";

export interface Supplier {
  id: string;
  name: string;
  store_name?: string;
  status: SupplierStatus;
  last_sync?: string | null;
  products_count?: number;
  icon_color?: string;
}

interface SupplierListItemProps {
  supplier: Supplier;
  onClick?: (supplier: Supplier) => void;
}

const statusConfig: Record<
  SupplierStatus,
  { icon: typeof CheckCircle2; label: string; color: string; bg: string; border: string }
> = {
  active: {
    icon: CheckCircle2,
    label: "Active",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  attention_required: {
    icon: AlertTriangle,
    label: "Needs Attention",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  syncing: {
    icon: RefreshCw,
    label: "Syncing",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  disconnected: {
    icon: AlertTriangle,
    label: "Disconnected",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
};

const iconColors = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
];

function timeAgo(value?: string | null) {
  if (!value) return "Never";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SupplierListItem({ supplier, onClick }: SupplierListItemProps) {
  const status = statusConfig[supplier.status];
  const StatusIcon = status.icon;
  const colorIndex = supplier.name ? supplier.name.charCodeAt(0) % iconColors.length : 0;

  return (
    <button
      className="group w-full text-left flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50/80 transition-all duration-200 border border-transparent hover:border-slate-200/50"
      onClick={() => onClick?.(supplier)}
    >
      <div
        className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-md",
          supplier.icon_color || iconColors[colorIndex],
        )}
      >
        {supplier.name?.substring(0, 2).toUpperCase() || "SU"}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 truncate">{supplier.name}</p>
        <p className="text-sm text-slate-500 truncate">Connected to: {supplier.store_name || "Your Store"}</p>
      </div>

      <div className="hidden md:flex items-center gap-2 w-40">
        <Package className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-700">{supplier.products_count || 0}</span>
        <span className="text-xs text-slate-400">products</span>
      </div>

      <div className="hidden sm:block w-24 text-sm text-slate-500">{timeAgo(supplier.last_sync)}</div>

      <div
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border",
          status.bg,
          status.border,
          status.color,
        )}
      >
        <StatusIcon className={cn("h-4 w-4", supplier.status === "syncing" && "animate-spin")} />
        <span className="hidden sm:inline">{status.label}</span>
      </div>

      <div className="p-2 rounded-lg hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all">
        <MoreHorizontal className="h-4 w-4 text-slate-400" />
        <span className="sr-only">Actions</span>
      </div>
      <ExternalLink className="hidden" />
    </button>
  );
}
