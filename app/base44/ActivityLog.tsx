import React, { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Package, RefreshCw, Calendar, Search, ArrowRight } from "lucide-react";

type ActivitySeverity = "info" | "success" | "warning" | "error";
type ActivityType = "sync_success" | "sync_error" | "stock_change" | "manual_sync";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  supplier_name?: string;
  severity: ActivitySeverity;
  created_date: string;
  old_value?: string;
  new_value?: string;
}

const mockActivities: Activity[] = [
  {
    id: "a1",
    type: "sync_error",
    severity: "error",
    title: "Synkronisering feilet",
    description: "Fashion Hub PL",
    supplier_name: "Fashion Hub PL",
    created_date: new Date().toISOString(),
  },
  {
    id: "a2",
    type: "sync_success",
    severity: "success",
    title: "Synkronisering fullført",
    description: "156 produkter synkronisert fra Electromarket AS",
    supplier_name: "Electromarket AS",
    created_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a3",
    type: "stock_change",
    severity: "info",
    title: "Lagerendring oppdaget",
    description: "Wireless Bluetooth Headphones - lagerbeholdning oppdatert",
    supplier_name: "Electromarket AS",
    old_value: "50",
    new_value: "45",
    created_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a4",
    type: "sync_error",
    severity: "error",
    title: "Synkronisering feilet",
    description: "Kunne ikke koble til Fashion Hub PL - CSV-fil mangler",
    supplier_name: "Fashion Hub PL",
    created_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const severityBorder: Record<ActivitySeverity, string> = {
  info: "border-l-slate-300",
  success: "border-l-emerald-400",
  warning: "border-l-amber-400",
  error: "border-l-rose-400",
};

const iconConfig: Record<ActivityType, { icon: React.ElementType; color: string; bg: string }> = {
  sync_success: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  sync_error: { icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
  stock_change: { icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
  manual_sync: { icon: RefreshCw, color: "text-amber-600", bg: "bg-amber-50" },
};

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function ActivityLog() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return mockActivities.filter(
      (a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.description || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.supplier_name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const needsAttention = filtered.filter((a) => a.severity === "error");

  const grouped = filtered.reduce<Record<string, Activity[]>>((acc, a) => {
    const key = formatDateLabel(a.created_date);
    acc[key] = acc[key] || [];
    acc[key].push(a);
    return acc;
  }, {});

  const groupEntries = Object.entries(grouped);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activity Log</h1>
          <p className="text-slate-500">Track what&apos;s happening in your app</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Attention box */}
      {needsAttention.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800">{needsAttention.length} issue require attention</p>
            <p className="text-sm text-slate-500">{needsAttention[0].title}</p>
          </div>
          <button className="text-sm font-semibold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1">
            Fix Now <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-3 flex items-center gap-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          placeholder="Search activity log..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border-0 focus:ring-0 text-sm text-slate-700"
        />
      </div>

      {/* List */}
      <div className="space-y-4">
        {groupEntries.map(([date, items]) => (
          <div key={date} className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{date}</span>
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">{formatTimeAgo(items[0].created_date)}</span>
            </div>
            <div className="space-y-3">
              {items.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const icon = iconConfig[activity.type] || iconConfig.sync_success;
  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border bg-white ${severityBorder[activity.severity]}`}>
      <div className={`h-10 w-10 rounded-xl ${icon.bg} flex items-center justify-center`}>
        <icon.icon className={`h-5 w-5 ${icon.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800">{activity.title}</p>
        {activity.description && <p className="text-sm text-slate-600">{activity.description}</p>}
        {activity.supplier_name && (
          <p className="text-xs text-slate-500 mt-1">
            Supplier: <span className="font-medium text-slate-700">{activity.supplier_name}</span>
          </p>
        )}
        {(activity.old_value || activity.new_value) && (
          <div className="flex items-center gap-2 mt-2 text-sm">
            {activity.old_value && <Badge text={activity.old_value} colorClass="bg-rose-100 text-rose-700 border border-rose-200" />}
            {activity.old_value && activity.new_value && <span className="text-slate-400">→</span>}
            {activity.new_value && <Badge text={activity.new_value} colorClass="bg-emerald-100 text-emerald-700 border border-emerald-200" />}
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ text, colorClass }: { text: string; colorClass: string }) {
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colorClass}`}>{text}</span>;
}
