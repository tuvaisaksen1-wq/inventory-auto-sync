import type { LucideIcon } from "lucide-react";
import { cn } from "../../utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  gradient?: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = "from-indigo-500 to-violet-600",
  trend,
  trendUp = true,
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/70 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-2 text-sm font-medium",
                  trendUp ? "text-emerald-600" : "text-rose-600",
                )}
              >
                <span>{trendUp ? "↑" : "↓"} {trend}</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
              gradient,
            )}
          >
            {Icon && <Icon className="h-6 w-6 text-white" />}
          </div>
        </div>
      </div>
      <div className={cn("absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r", gradient)} />
    </div>
  );
}
