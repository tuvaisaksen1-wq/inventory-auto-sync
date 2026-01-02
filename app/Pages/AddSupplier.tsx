
import { Form, useActionData, useNavigation } from "@remix-run/react";

interface ActionResult {
  ok: boolean;
  message: string;
}

export default function AddSupplierPage() {
  const actionData = useActionData<ActionResult>();
  const nav = useNavigation();
  const isSubmitting = nav.state === "submitting";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Connect a supplier
        </h2>
        <p className="text-sm text-slate-600 max-w-xl">
          Paste your supplier&apos;s Google Sheet and fill in how we should
          match products to your Shopify store.
        </p>
      </div>

      {actionData && (
        <div
          className={\`rounded-md border px-3 py-2 text-sm \${actionData.ok
            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
            : "border-rose-300 bg-rose-50 text-rose-800"}\`}
        >
          {actionData.message}
        </div>
      )}

      <Form method="post" action="/api/supplier-setup" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Supplier name
            </label>
            <input
              name="name"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Supplier ID (internal)
            </label>
            <input
              name="supplier_id"
              required
              placeholder="e.g. brandstreettokyo"
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-700">
              Shopify domain
            </label>
            <input
              name="shop_domain"
              required
              placeholder="teststore.myshopify.com"
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Location ID
            </label>
            <input
              name="location_id"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700">
            Shopify access token
          </label>
          <input
            name="access_token"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
          />
        </div>

        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Google Sheet URL
            </label>
            <input
              name="sheet_url"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700">
                Sheet tab name
              </label>
              <input
                name="sheet_name"
                required
                placeholder="Inventory"
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Matching key column (e.g. A)
              </label>
              <input
                name="match_col"
                required
                defaultValue="A"
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Stock column (e.g. B)
              </label>
              <input
                name="qty_col"
                required
                defaultValue="B"
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Matching key in your store
            </label>
            <select
              name="matching_key"
              defaultValue="sku"
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            >
              <option value="sku">SKU</option>
              <option value="barcode">Barcode / EAN</option>
              <option value="handle">Product handle</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Sync frequency
            </label>
            <select
              name="frequency"
              defaultValue="6h"
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            >
              <option value="1h">Every hour</option>
              <option value="3h">Every 3 hours</option>
              <option value="6h">Every 6 hours</option>
              <option value="12h">Every 12 hours</option>
              <option value="24h">Daily</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Connecting..." : "Save supplier"}
        </button>
      </Form>
    </div>
  );
}
