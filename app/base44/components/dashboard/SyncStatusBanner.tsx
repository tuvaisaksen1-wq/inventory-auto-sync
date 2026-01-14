import { CheckCircle2, AlertCircle, RefreshCw, Clock } from "lucide-react";
import { cn } from "../../utils";

interface SyncStatusBannerProps {
  lastSync?: string | null;
  hasIssues?: boolean;
  syncing?: boolean;
}

export function SyncStatusBanner({ lastSync, hasIssues, syncing }: SyncStatusBannerProps) {
  const config = (() => {
    if (syncing) {
      return {
        icon: RefreshCw,
        text: "Syncing...",
        gradient: "from-blue-500 to-cyan-500",
        bgGradient: "from-blue-50 to-cyan-50",
        iconClass: "animate-spin",
      };
    }
    if (hasIssues) {
      return {
        icon: AlertCircle,
        text: "Some suppliers need attention",
        gradient: "from-amber-500 to-orange-500",
        bgGradient: "from-amber-50 to-orange-50",
        iconClass: "",
      };
    }
    return {
      icon: CheckCircle2,
      text: "All synced",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      iconClass: "",
    };
  })();

  const StatusIcon = config.icon;

  const formatTimeAgo = (value?: string | null) => {
    if (!value) return "Never synced";
    const diff = Date.now() - new Date(value).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-4 bg-gradient-to-r border border-white/50 shadow-sm",
        config.bgGradient,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md",
              config.gradient,
            )}
          >
            <StatusIcon className={cn("h-5 w-5 text-white", config.iconClass)} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">{config.text}</p>
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <Clock className="h-3.5 w-3.5" />
              <span>Last sync: {formatTimeAgo(lastSync ?? undefined)}</span>
            </div>
          </div>
        </div>
        {hasIssues && (
          <a
            href="/app/activity"
            className="text-sm font-medium text-amber-700 bg-white/80 border border-amber-200 rounded-lg px-3 py-1.5 hover:bg-white transition-colors"
          >
            Fix now
          </a>
        )}
      </div>
    </div>
  );
}
