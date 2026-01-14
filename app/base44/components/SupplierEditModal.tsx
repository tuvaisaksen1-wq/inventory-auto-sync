import React, { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

interface Props {
  supplier: any | null;
  open: boolean;
  onClose: () => void;
}

export function SupplierEditModal({ supplier, open, onClose }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sync_frequency: "daily",
    status: "active",
    notification_critical: true,
    notification_all_errors: false,
    notification_out_of_stock: false,
    notification_disabled: false,
    notification_email: "",
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        description: supplier.description || "",
        sync_frequency: supplier.sync_frequency || "daily",
        status: supplier.status || "active",
        notification_critical: supplier.notification_critical ?? true,
        notification_all_errors: supplier.notification_all_errors ?? false,
        notification_out_of_stock: supplier.notification_out_of_stock ?? false,
        notification_disabled: supplier.notification_disabled ?? false,
        notification_email: supplier.notification_email || "",
      });
    }
  }, [supplier]);

  if (!open || !supplier) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Edit Supplier</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setTimeout(() => onClose(), 300); // placeholder save
          }}
        >
          <Field label="Supplier Name">
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </Field>
          <Field label="Description (optional)">
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm min-h-[80px]"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            />
          </Field>
          <Field label="Sync Frequency">
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formData.sync_frequency}
              onChange={(e) => setFormData((p) => ({ ...p, sync_frequency: e.target.value }))}
            >
              <option value="realtime">Real-time</option>
              <option value="hourly">Every hour</option>
              <option value="daily">Daily</option>
              <option value="manual">Manual</option>
            </select>
          </Field>
          <Field label="Connection Status">
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formData.status}
              onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="active">Active</option>
              <option value="disconnected">Paused</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">Pause sync without deleting the connection</p>
          </Field>

          <div className="pt-2 border-t border-slate-200 space-y-3">
            <p className="text-sm font-semibold text-slate-800">Notification Preferences</p>
            {[
              { key: "notification_critical", label: "Only critical errors (recommended)" },
              { key: "notification_all_errors", label: "All inventory sync errors" },
              { key: "notification_out_of_stock", label: "When products go out of stock" },
              { key: "notification_disabled", label: "No push notifications" },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 text-sm">
                <span>{item.label}</span>
                <input
                  type="checkbox"
                  checked={(formData as any)[item.key]}
                  onChange={(e) => setFormData((p) => ({ ...p, [item.key]: e.target.checked }))}
                />
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 text-sm font-semibold shadow inline-flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}
