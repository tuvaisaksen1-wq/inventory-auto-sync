import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import { TextField, Checkbox, RadioButton, Select } from "@shopify/polaris";
import {
  ArrowLeft,
  ChevronRight,
  FileUp,
  Link as LinkIcon,
  Code,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Key,
  Hash,
  Tag,
  Settings2,
} from "lucide-react";

type ConnectionType = "api" | "csv" | "excel" | "google_sheet" | "url";

const connectionTypes: Array<{
  id: ConnectionType;
  name: string;
  description: string;
  icon: React.ElementType;
  emoji: string;
}> = [
  { id: "api", name: "API Direct Connection", description: "Real-time, log in with supplier", icon: Code, emoji: "🔌" },
  { id: "csv", name: "CSV File", description: "Upload CSV file from supplier", icon: FileUp, emoji: "📄" },
  { id: "excel", name: "Excel File", description: "Upload Excel file from supplier", icon: FileUp, emoji: "📊" },
  { id: "google_sheet", name: "Google Sheet", description: "Live connection, not automatic unless updated", icon: FileSpreadsheet, emoji: "📋" },
  { id: "url", name: "URL Link", description: "Paste product or category URL we check", icon: LinkIcon, emoji: "🔗" },
];

const matchingKeyTypes = [
  { id: "sku", label: "SKU (Standard)", description: "Recommended for most", emoji: "🔑", icon: Key },
  { id: "product_id", label: "Product ID", description: "If SKU not available", emoji: "#️⃣", icon: Hash },
  { id: "barcode", label: "Barcode/EAN", description: "For physical goods", emoji: "🏷️", icon: Tag },
  { id: "custom", label: "Custom Field", description: "Special cases", emoji: "🔗", icon: Settings2 },
];

type Step = 1 | 2 | 3 | 4 | 5 | 7;

export default function AddSupplier() {
  const location = useLocation();
  const withSearch = (pathname: string) => ({
    pathname,
    search: location.search,
  });
  const [step, setStep] = useState<Step>(1);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; products_found: number; matched: number } | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    {
      status: string;
      products_found: number;
      matched: number;
      updated: number;
      skipped: number;
      not_found: number;
      error_count: number;
      message: string;
      next_check: string;
    } | null
  >(null);

const applySummary = (
  summary: Record<string, unknown> | null,
  current: typeof syncStatus
) => {
    if (!summary) return current;

    const toNumber = (value: unknown) => Number(value ?? 0);
    const productsFound =
      toNumber(summary.products_found ?? summary.products ?? 0) ||
      toNumber(summary.matched_count ?? summary.matched ?? 0);
    const matched =
      toNumber(summary.matched ?? summary.matched_count ?? summary.updated_count ?? 0);
    const updated = toNumber(summary.updated_count ?? 0);
    const skipped = toNumber(summary.skipped_count ?? 0);
    const notFound = toNumber(summary.not_found_count ?? 0);
    const errorCount = toNumber(summary.error_count ?? 0);
    const message = typeof summary.message === "string" ? summary.message : current?.message ?? "";
    const formatDate = (value: unknown) => {
      if (typeof value === "string") {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
          return date.toLocaleString();
        }
        return value;
      }
      return null;
    };
    const nextCheck =
      formatDate(summary.next_check) ??
      formatDate(summary.next_run_at) ??
      current?.next_check ??
      "Tomorrow at 09:00";

    return {
      status: current?.status ?? "queued",
      products_found: productsFound,
      matched,
      updated,
      skipped,
      not_found: notFound,
      error_count: errorCount,
      message,
      next_check: nextCheck,
    };
  };
  const [syncRun, setSyncRun] = useState<{
    run_id?: string;
    status: string;
    updated_count?: number | null;
    skipped_count?: number | null;
    not_found_count?: number | null;
    error_count?: number | null;
    finished_at?: string | null;
  } | null>(null);
  const [activeSupplierId, setActiveSupplierId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    matching_key_type: "sku",
    connection_type: "" as ConnectionType | "",
    api_url: "",
    api_key: "",
    api_endpoint: "",
    sheet_url: "",
    sheet_name: "",
    sheet_matching_tab: "",
    sheet_tab: "",
    file_url: "",
    scrape_url: "",
    scrape_permission: false,
    sync_frequency: "6h",
    notification_types: ["critical_only"] as string[],
    status: "active",
  });

  const steps = [
    { id: 1, label: "Basic Info" },
    { id: 2, label: "Connection Type" },
    { id: 3, label: "Setup" },
    { id: 4, label: "Notifications" },
    { id: 5, label: "Summary" },
  ];

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setSubmitError(null);
    try {
      const supplierId = formData.name ? toSupplierId(formData.name) : "supplier";
      const shopDomain = getShopDomainFromLocation();
      const shopHost = getShopHostFromLocation();
      const res = await fetch("/api/supplier-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test_only: true,
          supplier_id: supplierId,
          name: formData.name || "Supplier",
          description: formData.description,
          matching_key_type: formData.matching_key_type,
          connection_type: formData.connection_type,
          api_url: formData.api_url,
          api_key: formData.api_key,
          api_endpoint: formData.api_endpoint,
          sheet_url: formData.sheet_url,
          sheet_name: formData.sheet_name,
          sheet_matching_tab: formData.sheet_matching_tab,
          sheet_tab: formData.sheet_tab,
          file_url: formData.file_url,
          scrape_url: formData.scrape_url,
          scrape_permission: formData.scrape_permission,
          sync_frequency: formData.sync_frequency,
          notification_types: formData.notification_types,
          status: formData.status,
          shop_domain: shopDomain,
          shop_host: shopHost,
        }),
      });
      const data = await readJsonOrText(res);
      if (!res.ok) {
        setSubmitError(getErrorMessage(data) || "Test connection failed.");
        setTestResult({ success: false, products_found: 0, matched: 0 });
        return;
      }

      setTestResult({
        success: true,
        products_found: Number((data as any)?.products_found ?? 0),
        matched: Number((data as any)?.matched ?? (data as any)?.products_found ?? 0),
      });
    } catch (error) {
      setSubmitError(`Failed to reach backend: ${String(error)}`);
      setTestResult({ success: false, products_found: 0, matched: 0 });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const toSupplierId = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return slug || "supplier";
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setSubmitError("Please add a supplier name before starting sync.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const supplierId = toSupplierId(formData.name);
      const shopDomain = getShopDomainFromLocation();
      const shopHost = getShopHostFromLocation();
      const setupRes = await fetch("/api/supplier-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_id: supplierId,
          name: formData.name,
          description: formData.description,
          matching_key_type: formData.matching_key_type,
          connection_type: formData.connection_type,
          api_url: formData.api_url,
          api_key: formData.api_key,
          api_endpoint: formData.api_endpoint,
          sheet_url: formData.sheet_url,
          sheet_name: formData.sheet_name,
          sheet_matching_tab: formData.sheet_matching_tab,
          sheet_tab: formData.sheet_tab,
          file_url: formData.file_url,
          scrape_url: formData.scrape_url,
          scrape_permission: formData.scrape_permission,
          sync_frequency: formData.sync_frequency,
          notification_types: formData.notification_types,
          status: formData.status,
          shop_domain: shopDomain,
          shop_host: shopHost,
        }),
      });
      const setupData = await readJsonOrText(setupRes);

      if (!setupRes.ok) {
        setSubmitError(getErrorMessage(setupData) || "Failed to save supplier profile.");
        return;
      }

      const startRes = await fetch("/start-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplier_id: supplierId }),
      });
      const data = await readJsonOrText(startRes);

      if (!startRes.ok) {
        setSubmitError(getErrorMessage(data) || "Failed to start sync.");
        return;
      }

      setActiveSupplierId(supplierId);
      const runId = data && typeof data === "object" && "run_id" in data ? String(data.run_id ?? "") : "";
      const nextStatus =
        data && typeof data === "object" && "status" in data ? String(data.status ?? "queued") : "queued";
      setSyncRun({ run_id: runId || undefined, status: nextStatus });
      const summarySource =
        data && typeof data === "object" ? (data as Record<string, unknown>) : null;
      const getNumber = (...keys: string[]) =>
        Number(
          keys
            .map((key) => summarySource?.[key])
            .find((value) => typeof value !== "undefined" && value !== null) ?? 0
        );

      const initialNextCheck =
        summarySource?.next_check ??
        (typeof summarySource?.next_run_at === "string" ? summarySource.next_run_at : null);

      setSyncStatus({
        status: nextStatus,
        products_found:
          getNumber("products_found", "products", "matched_count", "matched") ||
          testResult?.products_found ||
          0,
        matched: getNumber("matched", "matched_count", "updated_count") || testResult?.matched || 0,
        updated: getNumber("updated_count") || 0,
        skipped: getNumber("skipped_count") || 0,
        not_found: getNumber("not_found_count") || 0,
        error_count: getNumber("error_count") || 0,
        message:
          typeof summarySource?.message === "string"
            ? summarySource.message
            : testResult?.success
            ? "Products matched"
            : "Sync started",
        next_check:
          typeof initialNextCheck === "string"
            ? initialNextCheck
            : "Tomorrow at 09:00",
      });
      setStep(7);
    } catch (error) {
      setSubmitError(`Failed to reach backend: ${String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!activeSupplierId && !syncRun?.run_id) return;
    if (syncRun?.status === "success" || syncRun?.status === "failed" || syncRun?.status === "partial_failed") {
      return;
    }

    let isActive = true;
    const poll = async () => {
      try {
        const query = syncRun?.run_id
          ? `run_id=${encodeURIComponent(syncRun.run_id)}`
          : `supplier_id=${encodeURIComponent(activeSupplierId as string)}`;
        const res = await fetch(`/sync-status?${query}`);
        const data = await res.json();
    if (!isActive) return;
    if (data?.status) {
      setSyncRun({
        run_id: data?.run_id ?? syncRun?.run_id,
        status: String(data.status),
      });
      setSyncStatus((prev) => applySummary((data as any).summary ?? null, prev));
    }
      } catch {
        // Ignore transient errors during polling.
      }
    };

    const intervalId = window.setInterval(poll, 4000);
    poll();

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [activeSupplierId, syncRun?.run_id, syncRun?.status]);

  const isMatchSelected = (id: string) => formData.matching_key_type === id;

  const renderStepIndicator = () => (
    <div className="flex items-center gap-3 flex-wrap mb-8">
      {steps.map((s, idx) => (
        <React.Fragment key={s.id}>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              step >= s.id ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"
            }`}
          >
            <span
              className={`h-7 w-7 rounded-full text-xs flex items-center justify-center font-semibold ${
                step >= s.id ? "bg-indigo-600 text-white" : "bg-slate-300 text-white"
              }`}
            >
              {s.id}
            </span>
            {s.label}
          </div>
          {idx < steps.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300" />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <a href="/app" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </a>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Supplier</h1>
          <p className="text-slate-500">Connect to your supplier&apos;s inventory</p>
        </div>
      </div>

      {step <= 5 && renderStepIndicator()}

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-6">
          <SectionCard className="space-y-5">
            <div className="space-y-2">
              <TextField
                label="Supplier Name *"
                placeholder="e.g., ElectroImport AS"
                value={formData.name}
                onChange={(value) => handleInputChange("name", value)}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <TextField
                label="Description (optional)"
                placeholder="Additional notes about this supplier..."
                value={formData.description}
                onChange={(value) => handleInputChange("description", value)}
                autoComplete="off"
                multiline
              />
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div>
                <label className="text-base font-semibold text-slate-800">
                  Which field in your store (Shopify) should we use for matching?
                </label>
                <p className="text-sm text-slate-500">This will be compared with supplier&apos;s product ID/SKU column</p>
              </div>
              <div className="space-y-3">
                {matchingKeyTypes.map((type) => (
                  <label
                    key={type.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isMatchSelected(type.id) ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <RadioButton
                      name="matching_key"
                      value={type.id}
                      checked={isMatchSelected(type.id)}
                      onChange={() => handleInputChange("matching_key_type", type.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{type.emoji}</span>
                        <span className="font-semibold text-slate-800">{type.label}</span>
                      </div>
                      <p className="text-sm text-slate-600">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </SectionCard>

          <div className="flex gap-3">
            <Link
              to={withSearch("/app")}
              className="flex-1 text-center rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              onClick={() => setStep(2)}
              disabled={!formData.name}
              className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-3 text-sm font-semibold shadow-lg disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-6">
          <SectionCard>
            <div className="space-y-4">
              <p className="font-semibold text-slate-800">Select connection type for inventory sync:</p>
              <div className="grid gap-4">
                {connectionTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      handleInputChange("connection_type", type.id);
                      setStep(3);
                    }}
                    className={`flex items-center gap-4 p-5 rounded-xl border-2 bg-white transition-all text-left ${
                      formData.connection_type === type.id ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-200"
                    }`}
                  >
                    <div className="text-3xl">{type.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{type.name}</h3>
                      <p className="text-sm text-slate-600">{type.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 text-center rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-6">
          <SectionCard className="space-y-5">
            {formData.connection_type === "api" && (
              <>
                <h3 className="text-lg font-semibold text-slate-800">🔌 API Setup</h3>
                <p className="text-sm text-slate-600">We fetch inventory data directly from the supplier&apos;s API.</p>
                <div className="space-y-4">
                  <Input label="API Base URL" placeholder="https://api.supplier.com" value={formData.api_url} onChange={(v) => handleInputChange("api_url", v)} />
                  <Input label="API Key or Token" placeholder="Your API key" type="password" value={formData.api_key} onChange={(v) => handleInputChange("api_key", v)} />
                  <Input label="Endpoint for products (optional)" placeholder="e.g., /products.json" value={formData.api_endpoint} onChange={(v) => handleInputChange("api_endpoint", v)} />
                  <button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !formData.api_url}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {isTestingConnection ? <LoaderRow label="Testing..." /> : "⚙️ Test Connection"}
                  </button>
                  {testResult && <TestResult success={testResult.success} products={testResult.products_found} matched={testResult.matched} />}
                </div>
              </>
            )}

            {formData.connection_type === "google_sheet" && (
              <>
                <h3 className="text-lg font-semibold text-slate-800">📊 Google Sheet Connection (Live)</h3>
                <p className="text-sm text-slate-600">
                  Connect to a spreadsheet from your Google account. We fetch inventory data directly from Google Sheets and keep your store updated.
                </p>
                <div className="space-y-4">
                  <Input label="🔗 Paste Google Sheet link:" placeholder="https://docs.google.com/spreadsheets/..." value={formData.sheet_url} onChange={(v) => handleInputChange("sheet_url", v)} />
                  <Input label="Sheet name/tab (e.g., Sheet1, Inventory, Products)" placeholder="e.g., Sheet1" value={formData.sheet_name} onChange={(v) => handleInputChange("sheet_name", v)} helper="The name of the tab/worksheet to use" />
                  <div className="pt-3 border-t border-slate-100 space-y-4">
                    <Input label="Which column contains the supplier's product ID/SKU?" placeholder="e.g., sku" value={formData.sheet_matching_tab} onChange={(v) => handleInputChange("sheet_matching_tab", v)} helper="The column with supplier's product identifier" />
                    <Input label="Which column contains the stock count?" placeholder="e.g., stock" value={formData.sheet_tab} onChange={(v) => handleInputChange("sheet_tab", v)} helper="The column showing available inventory" />
                  </div>
                  <button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !formData.sheet_url}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {isTestingConnection ? <LoaderRow label="Testing..." /> : "⚙️ Test Connection"}
                  </button>
                  {testResult && <TestResult success={testResult.success} products={testResult.products_found} matched={testResult.matched} />}
                </div>
              </>
            )}

            {formData.connection_type === "csv" && (
              <>
                <h3 className="text-lg font-semibold text-slate-800">📄 CSV File Upload</h3>
                <p className="text-sm text-slate-600">
                  Upload a CSV file for inventory sync. The file must contain at least one column for matching_key and one for Inventory Count.
                </p>
                <div className="space-y-4">
                  <Input
                    label="Upload CSV File"
                    type="file"
                    onChange={(v) => {
                      const file = (v as File | null) || null;
                      if (file) setUploadedFile(file.name);
                    }}
                  />
                  {uploadedFile && <p className="text-sm text-emerald-600">✅ Uploaded: {uploadedFile}</p>}
                  <button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !uploadedFile}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {isTestingConnection ? <LoaderRow label="Analyzing..." /> : "⚙️ Analyze File"}
                  </button>
                  {testResult && <TestResult success={testResult.success} products={testResult.products_found} matched={testResult.matched} />}
                  <div className="rounded-xl bg-amber-50 text-amber-800 text-sm px-4 py-3 border border-amber-200">
                    📅 Update: This connection updates only when you upload a new file.
                  </div>
                </div>
              </>
            )}

            {formData.connection_type === "excel" && (
              <>
                <h3 className="text-lg font-semibold text-slate-800">📊 Excel File Upload</h3>
                <p className="text-sm text-slate-600">
                  Upload an Excel file for inventory sync. The file must contain at least one column for matching_key and one for Inventory Count.
                </p>
                <div className="space-y-4">
                  <Input
                    label="Upload Excel File"
                    type="file"
                    onChange={(v) => {
                      const file = (v as File | null) || null;
                      if (file) setUploadedFile(file.name);
                    }}
                  />
                  {uploadedFile && <p className="text-sm text-emerald-600">✅ Uploaded: {uploadedFile}</p>}
                  <button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !uploadedFile}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {isTestingConnection ? <LoaderRow label="Analyzing..." /> : "⚙️ Analyze File"}
                  </button>
                  {testResult && <TestResult success={testResult.success} products={testResult.products_found} matched={testResult.matched} />}
                  <div className="rounded-xl bg-amber-50 text-amber-800 text-sm px-4 py-3 border border-amber-200">
                    📅 Update: This connection updates only when you upload a new file.
                  </div>
                </div>
              </>
            )}

            {formData.connection_type === "url" && (
              <>
                <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3">
                  ⚠️ Before continuing: We recommend asking your supplier for permission to fetch inventory data.
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    label="✅ I confirm I have permission or take responsibility myself"
                    checked={formData.scrape_permission}
                    onChange={(checked) => handleInputChange("scrape_permission", checked)}
                  />
                </div>
                <div className="space-y-4">
                  <Input label="Paste URL to category or product:" placeholder="https://brandstreettokyo.com/collections/newest-products" value={formData.scrape_url} onChange={(v) => handleInputChange("scrape_url", v)} />
                  <button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !formData.scrape_url || !formData.scrape_permission}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {isTestingConnection ? <LoaderRow label="Analyzing..." /> : "⚙️ Analyze URL"}
                  </button>
                  {testResult && (
                    <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm">
                      ✅ Found {testResult.products_found} products that match your store
                    </div>
                  )}
                <div>
                  <Select
                    label="How often should we check for changes?"
                    options={[
                      { label: "Every hour", value: "hourly" },
                      { label: "Every 6 hours", value: "6h" },
                      { label: "Every 12 hours", value: "12h" },
                      { label: "Daily", value: "daily" },
                    ]}
                    value={formData.sync_frequency}
                    onChange={(value) => handleInputChange("sync_frequency", value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    For more frequent updates, consider API or uploading a file instead. More frequent than every 6 hours may cause the website to block us.
                  </p>
                </div>
                </div>
              </>
            )}
          </SectionCard>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 text-center rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-3 text-sm font-semibold shadow-lg"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="space-y-6">
          <SectionCard className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Do you want email notifications outside the app?</h3>
            <div className="space-y-3">
              {[
                { id: "critical_only", label: "Only critical errors (recommended)" },
                { id: "all_sync_errors", label: "All inventory sync errors" },
                { id: "out_of_stock", label: "When products go out of stock" },
                { id: "none", label: "No, no push notifications" },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50"
                >
                  <Checkbox
                    label={item.label}
                    checked={formData.notification_types.includes(item.id)}
                    onChange={(checked) => {
                      let next = formData.notification_types.filter((x) => x !== "none");
                      if (checked) {
                        next = item.id === "none" ? ["none"] : Array.from(new Set([...next, item.id]));
                      } else {
                        next = next.filter((x) => x !== item.id);
                      }
                      handleInputChange("notification_types", next);
                    }}
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex-1 text-center rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={() => setStep(5)}
              className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-3 text-sm font-semibold shadow-lg"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 5 */}
      {step === 5 && (
        <div className="space-y-6">
          <SectionCard>
            <h3 className="text-xl font-semibold text-slate-800 mb-6">🧾 Summary</h3>
            <div className="space-y-3 text-sm">
              <SummaryRow label="Supplier" value={formData.name || "-"} />
              <SummaryRow
                label="Matching Key"
                value={matchingKeyTypes.find((t) => t.id === formData.matching_key_type)?.label || formData.matching_key_type}
              />
              <SummaryRow
                label="Connection Type"
                value={connectionTypes.find((c) => c.id === formData.connection_type)?.name || formData.connection_type || "-"}
              />
              <SummaryRow label="Update Frequency" value={formData.sync_frequency} />
              <SummaryRow
                label="Notifications"
                value={formData.notification_types.includes("none") ? "Disabled" : formData.notification_types.join(", ")}
              />
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 text-sm font-semibold shadow-lg"
              >
                {isSubmitting ? "Starting sync..." : "✅ Save, Activate, and Start Sync"}
              </button>
              {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}
              <button
                onClick={() => setStep(7)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                💤 Save as Draft
              </button>
            </div>
          </SectionCard>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(4)}
              className="flex-1 text-center rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Completion */}
      {step === 7 && syncStatus && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-emerald-900 mb-1">Setup completed for: {formData.name || "Supplier"}</h3>
            <p className="text-emerald-800">🚚 Automatic inventory sync has started!</p>
            <p className="text-sm text-emerald-700">(May take up to 15 minutes, depending on number of products)</p>
            <p className="text-sm text-emerald-700 mt-2">
              We use <strong>{matchingKeyTypes.find((t) => t.id === formData.matching_key_type)?.label}</strong> to match your products.
            </p>
          </div>

          <SectionCard className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-800">🔄 Status for first run:</h3>
            <SummaryRow
              label="Status"
              value={
                syncRun?.status === "running" ? (
                  <span className="text-indigo-600 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Running...
                  </span>
                ) : (
                  <span className="text-emerald-600 font-semibold">{syncRun?.status || "Unknown"}</span>
                )
              }
            />
            <SummaryRow label="Products found" value={syncStatus.products_found} />
            <SummaryRow
              label="Updated count"
              value={`${syncRun?.updated_count ?? syncStatus.updated} / ${syncStatus.products_found}`}
            />
            <SummaryRow
              label="Last update"
              value={syncRun?.finished_at ? new Date(syncRun.finished_at).toLocaleString() : "Running now"}
            />
            <SummaryRow label="Next check" value={`${syncStatus.next_check} (${formData.sync_frequency})`} />
            <p className="text-xs text-slate-500 italic mt-2">*This status will update automatically.*</p>
          </SectionCard>

          <SectionCard className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-800">What happens now?</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
              <li>We connect to {formData.name || "supplier"} and sync inventory counts.</li>
              <li>You will receive notifications ({formData.notification_types.join(", ")}) if something fails.</li>
              <li>The profile is now available in the Workflow section to set up advanced rules (e.g., price adjustments).</li>
            </ol>
          </SectionCard>

          <div className="flex flex-col gap-3">
            <Link
              to={withSearch("/app")}
              className="w-full text-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-3 text-sm font-semibold shadow-lg"
            >
              ➡️ Go to Dashboard
            </Link>
            <button className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              ⚙️ See detailed log for this sync
            </button>
            <button className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              📝 Edit supplier profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function Input({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  helper,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: any) => void;
  type?: string;
  helper?: string;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "file") {
      const file = e.target.files?.[0] || null;
      onChange?.(file);
    } else {
      onChange?.(e.target.value);
    }
  };

  return (
    <div className="space-y-1">
      {type === "file" ? (
        <>
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <input
            type="file"
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          {helper && <p className="text-xs text-slate-500">{helper}</p>}
        </>
      ) : (
        <TextField
          label={label}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(next) => onChange?.(next)}
          autoComplete="off"
          helpText={helper}
        />
      )}
    </div>
  );
}

function LoaderRow({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </span>
  );
}

function TestResult({ success, products, matched }: { success: boolean; products: number; matched: number }) {
  return (
    <div className={`p-4 rounded-xl text-sm ${success ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
      {success ? `✅ Found ${products} products (${matched} match in your store)` : "❌ Connection failed. Please check your credentials."}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
      <span className="text-slate-600">{label}:</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

function getShopDomainFromLocation() {
  if (typeof window === "undefined") return null;
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get("shop");
  } catch {
    return null;
  }
}

function getShopHostFromLocation() {
  if (typeof window === "undefined") return null;
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get("host") || window.sessionStorage.getItem("shopify_host");
  } catch {
    return null;
  }
}

async function readJsonOrText(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

function getErrorMessage(data: unknown) {
  if (!data) return null;
  if (typeof data === "string") return data;
  if (typeof data === "object" && "message" in data) {
    const value = (data as { message?: unknown }).message;
    return typeof value === "string" ? value : null;
  }
  return null;
}
