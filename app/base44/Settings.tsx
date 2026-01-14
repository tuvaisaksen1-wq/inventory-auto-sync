import React, { useState } from "react";
import { User, Bell, Check } from "lucide-react";

interface NotificationPref {
  id: string;
  title: string;
  description: string;
}

const notificationPrefs: NotificationPref[] = [
  { id: "critical_only", title: "Only critical errors (recommended)", description: "Get notified only for critical issues" },
  { id: "all_errors", title: "All inventory sync errors", description: "Get notified for all sync failures" },
  { id: "out_of_stock", title: "When products go out of stock", description: "Notify when inventory reaches zero" },
  { id: "none", title: "No push notifications", description: "Disable all external notifications" },
];

export default function Settings() {
  const [name, setName] = useState("B S");
  const [email] = useState("vintagetreasuresas@gmail.com");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(["critical_only"]);

  const toggleNotification = (id: string) => {
    if (id === "none") {
      setSelectedNotifications(["none"]);
      return;
    }
    const next = selectedNotifications.includes(id)
      ? selectedNotifications.filter((x) => x !== id)
      : [...selectedNotifications.filter((x) => x !== "none"), id];
    setSelectedNotifications(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your account and preferences</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Account</p>
            <p className="text-sm text-slate-500">Your profile information</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-14 w-14 rounded-2xl bg-indigo-500 text-white text-xl font-bold flex items-center justify-center">B</div>
          <div>
            <p className="font-semibold text-slate-800">{name}</p>
            <p className="text-sm text-slate-500">{email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <Input label="Full Name" value={name} onChange={setName} />
          <Input label="Email" value={email} disabled helper="Email cannot be changed" />
        </div>
        <div className="pt-4">
          <button className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
            Save Changes
          </button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Notifications</p>
            <p className="text-sm text-slate-500">Choose what you want to be notified about</p>
          </div>
        </div>
        <div className="space-y-2">
          {notificationPrefs.map((pref) => (
            <label
              key={pref.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <div>
                <p className="font-medium text-slate-800 text-sm">{pref.title}</p>
                <p className="text-xs text-slate-500">{pref.description}</p>
              </div>
              <Toggle
                checked={selectedNotifications.includes(pref.id)}
                onChange={() => toggleNotification(pref.id)}
              />
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <p className="font-semibold text-slate-800 mb-3">Your Plan</p>
        <p className="text-sm text-slate-500 mb-3">Currently on the Free plan</p>
        <ul className="space-y-2 text-sm text-slate-700 mb-4">
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> 1 supplier</li>
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> 50 products</li>
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Daily sync</li>
        </ul>
        <button className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Upgrade to Pro
        </button>
      </Card>

      <Card>
        <p className="font-semibold text-slate-800 mb-3">Help &amp; Support</p>
        <div className="space-y-2">
          <SupportRow icon="🗂️" title="Documentation" />
          <SupportRow icon="✉️" title="Contact Support" />
        </div>
      </Card>

      <div>
        <button className="w-full rounded-lg border border-rose-200 text-rose-600 px-4 py-2 text-sm font-semibold hover:bg-rose-50">
          Log Out
        </button>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">{children}</div>;
}

function Input({
  label,
  value,
  onChange,
  disabled,
  helper,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  helper?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`w-full rounded-lg border px-3 py-2 text-sm ${
          disabled ? "bg-slate-50 text-slate-400 border-slate-200" : "border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
        }`}
      />
      {helper && <p className="text-xs text-slate-400">{helper}</p>}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-10 h-6 rounded-full border flex items-center transition-colors ${
        checked ? "bg-indigo-500 border-indigo-500 justify-end" : "bg-slate-200 border-slate-300 justify-start"
      }`}
      aria-pressed={checked}
      type="button"
    >
      <span className="h-5 w-5 bg-white rounded-full shadow" />
    </button>
  );
}

function SupportRow({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-lg">{icon}</div>
        <span className="font-medium text-slate-800">{title}</span>
      </div>
    </div>
  );
}
