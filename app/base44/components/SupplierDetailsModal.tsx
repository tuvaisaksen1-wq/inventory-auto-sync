import React, { useState } from "react";
import { BadgeCheck, AlertTriangle, RefreshCw, Package, Link2, Clock, Pencil } from "lucide-react";
import { SupplierEditModal } from "./SupplierEditModal";

const statusConfig: any = {
  active: { icon: BadgeCheck, label: "Active", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  attention_required: { icon: AlertTriangle, label: "Needs Attention", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  syncing: { icon: RefreshCw, label: "Syncing", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  disconnected: { icon: AlertTriangle, label: "Disconnected", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
};

const connectionTypeLabels: any = {
  google_sheet: "Google Sheet",
  api: "API Connection",
  csv_excel: "CSV / Excel",
  url: "URL Link",
  shopify: "Shopify",
  woocommerce: "WooCommerce",
};

export function SupplierDetailsModal({
  supplier,
  open,
  onClose,
}: {
  supplier: any | null;
  open: boolean;
  onClose: () => void;
}) {
  const [showEdit, setShowEdit] = useState(false);
  if (!open || !supplier) return null;
  const status = statusConfig[supplier.status] || statusConfig.active;
  const StatusIcon = status.icon;
  const timeAgo = supplier.last_sync ? formatTimeAgo(supplier.last_sync) : "Never synced";

  return (
    <>
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
        <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Supplier Relationship</h3>
              <p className="text-sm text-slate-500">Comparing your store with supplier connection</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-indigo-200">
                <Package className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-indigo-900">Your Store</h3>
              </div>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="font-semibold text-slate-800 mb-1">{supplier.store_name || "Your Store"}</p>
                  <p className="text-xs text-slate-500">Shopify / WooCommerce</p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <p className="text-xs text-indigo-600 mb-1">Products Connected</p>
                  <p className="text-3xl font-bold text-indigo-900">{supplier.products_count || 0}</p>
                </div>
                <div className="space-y-2">
                  <Row label="Matching Key Used">
                    <span className="font-mono text-xs border border-slate-200 rounded px-2 py-0.5">
                      {supplier.matching_key_type?.toUpperCase() || "SKU"}
                    </span>
                  </Row>
                  <Row label="Sync Status">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${status.bg} ${status.color} border ${status.border}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </Row>
                  <Row label="Last Updated">{timeAgo}</Row>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-violet-200">
                <Link2 className="h-5 w-5 text-violet-600" />
                <h3 className="font-bold text-violet-900">Supplier Side</h3>
              </div>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm ${supplier.icon_color || "bg-violet-500"}`}>
                      {supplier.name?.substring(0, 2).toUpperCase() || "SU"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{supplier.name}</p>
                      <p className="text-xs text-slate-500">{connectionTypeLabels[supplier.connection_type]}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
                  <p className="text-xs text-violet-600 mb-1">Sync Frequency</p>
                  <p className="text-lg font-bold text-violet-900 capitalize">{supplier.sync_frequency || "Daily"}</p>
                </div>
                <div className="space-y-2">
                  <Row label="Connection Type">
                    <span className="text-sm font-medium">{connectionTypeLabels[supplier.connection_type]}</span>
                  </Row>
                  {supplier.api_url && (
                    <Row label="API URL">
                      <span className="text-xs font-mono text-slate-700 truncate max-w-[180px]">{supplier.api_url}</span>
                    </Row>
                  )}
                  {supplier.sheet_url && (
                    <Row label="Google Sheet">
                      <a href={supplier.sheet_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        Open <Link2 className="h-3 w-3" />
                      </a>
                    </Row>
                  )}
                  <Row label="Last Sync">{timeAgo}</Row>
                </div>
                {supplier.description && (
                  <div className="p-3 rounded-lg bg-slate-50">
                    <p className="text-xs text-slate-600 mb-1">Note</p>
                    <p className="text-sm text-slate-700">{supplier.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t mt-6">
            <button onClick={onClose} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close</button>
            <button
              onClick={() => setShowEdit(true)}
              className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 text-sm font-semibold hover:from-indigo-700 hover:to-violet-700"
            >
              <Pencil className="h-4 w-4 inline mr-2" />
              Edit
            </button>
          </div>
        </div>
      </div>

      <SupplierEditModal
        supplier={supplier}
        open={showEdit}
        onClose={() => {
          setShowEdit(false);
          onClose();
        }}
      />
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-800">{children}</span>
    </div>
  );
}

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
