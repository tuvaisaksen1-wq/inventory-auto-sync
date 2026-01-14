import { CheckCircle2, AlertTriangle, Link2, Package, RefreshCw, Settings, XCircle, Info } from "lucide-react";
import { cn } from "../../utils";

export type ActivitySeverity = "info" | "success" | "warning" | "error";
export type ActivityType =
  | "sync_success"
  | "sync_error"
  | "supplier_connected"
  | "supplier_disconnected"
  | "product_updated"
  | "stock_change"
  | "manual_sync"
  | "settings_changed";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  severity?: ActivitySeverity;
  created_date?: string;
  supplier_name?: string;
  old_value?: string;
  new_value?: string;
  resolved?: boolean;
}

const typeConfig: Record<
  ActivityType,
  { icon: typeof CheckCircle2; gradient: string; bgLight: string }
> = {
  sync_success: { icon: CheckCircle2, gradient: "from-emerald-500 to-teal-600", bgLight: "bg-emerald-50" },
  sync_error: { icon: AlertTriangle, gradient: "from-rose-500 to-red-600", bgLight: "bg-rose-50" },
  supplier_connected: { icon: Link2, gradient: "from-indigo-500 to-violet-600", bgLight: "bg-indigo-50" },
  supplier_disconnected: { icon: XCircle, gradient: "from-slate-500 to-slate-600", bgLight: "bg-slate-50" },
  product_updated: { icon: Package, gradient: "from-violet-500 to-purple-600", bgLight: "bg-violet-50" },
  stock_change: { icon: Package, gradient: "from-cyan-500 to-blue-600", bgLight: "bg-cyan-50" },
  manual_sync: { icon: RefreshCw, gradient: "from-amber-500 to-orange-500", bgLight: "bg-amber-50" },
  settings_changed: { icon: Settings, gradient: "from-slate-500 to-slate-600", bgLight: "bg-slate-50" },
};

const severityColors: Record<ActivitySeverity, string> = {
  info: "border-l-slate-300",
  success: "border-l-emerald-400",
  warning: "border-l-amber-400",
  error: "border-l-rose-400",
};

function timeAgo(value?: string) {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityItem({ activity }: { activity: Activity }) {
  const config = typeConfig[activity.type] ?? {
    icon: Info,
    gradient: "from-slate-500 to-slate-600",
    bgLight: "bg-slate-50",
  };
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border-l-4 bg-white hover:bg-slate-50/50 transition-colors",
        severityColors[activity.severity || "info"] || severityColors.info,
      )}
    >
      <div
        className={cn(
          "h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
          config.gradient,
        )}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-slate-800">{activity.title}</p>
            {activity.description && <p className="text-sm text-slate-500 mt-0.5">{activity.description}</p>}
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(activity.created_date)}</span>
        </div>

        {(activity.old_value || activity.new_value) && (
          <div className="flex items-center gap-2 mt-2 text-sm">
            {activity.old_value && (
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-mono text-xs">
                {activity.old_value}
              </span>
            )}
            {activity.old_value && activity.new_value && <span className="text-slate-400">→</span>}
            {activity.new_value && (
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono text-xs">
                {activity.new_value}
              </span>
            )}
          </div>
        )}

        {activity.supplier_name && (
          <div className="mt-2">
            <span className="text-xs text-slate-400">Supplier: </span>
            <span className="text-xs font-medium text-slate-600">{activity.supplier_name}</span>
          </div>
        )}

        {activity.severity === "error" && !activity.resolved && (
          <div className="mt-3">
            <button className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1">
              Fix now →
            </button>
          </div>
        )}
        {activity.resolved && <div className="mt-2 text-xs text-emerald-600 font-medium">✓ Resolved</div>}
      </div>
    </div>
  );
}
