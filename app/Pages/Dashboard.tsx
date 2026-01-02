
export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">
        Connect your first supplier
      </h2>
      <p className="text-sm text-slate-700 max-w-xl">
        We sync inventory from your suppliers to your Shopify store, so you
        avoid overselling and manual stock updates.
      </p>

      <ul className="list-disc text-sm text-slate-700 ml-5 space-y-1">
        <li>Automatically pulls stock levels from your suppliers.</li>
        <li>Updates your Shopify inventory on a schedule (e.g. every 6 hours).</li>
        <li>Supports multiple suppliers per store.</li>
      </ul>

      <p className="text-sm text-slate-700 max-w-xl">
        Stores that resell products from other shops need reliable inventory sync
        between suppliers and their own Shopify store.
      </p>

      <p className="text-xs text-slate-500 max-w-xl">
        Google Sheets (live), CSV, API, and URL-based feeds — starting with Google Sheets.
      </p>
    </div>
  );
}
