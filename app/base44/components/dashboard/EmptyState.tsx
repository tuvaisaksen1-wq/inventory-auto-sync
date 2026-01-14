import type { LucideIcon } from "lucide-react";
import { cn } from "../../utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm",
        className,
      )}
    >
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
        {Icon && <Icon className="h-9 w-9 text-slate-400" />}
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-6">{description}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-indigo-500/20 hover:from-indigo-700 hover:to-violet-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );

  if (actionHref) {
    return (
      <a href={actionHref} className="block">
        {content}
      </a>
    );
  }

  return content;
}
