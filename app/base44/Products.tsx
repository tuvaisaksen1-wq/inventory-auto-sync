import React, { useMemo, useState } from "react";
import { Search, Package, BadgeCheck, Loader2 } from "lucide-react";

type ProductStatus = "synced" | "out_of_sync" | "error" | "pending";

interface Product {
  id: string;
  name: string;
  supplier_name: string;
  store_name?: string;
  sku: string;
  stock: number;
  last_sync?: string | null;
  status: ProductStatus;
}

const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Wireless Bluetooth Headphones",
    supplier_name: "Electromarket AS",
    store_name: "Min Nettbutikk",
    sku: "A2B202",
    stock: 42,
    last_sync: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: "synced",
  },
  {
    id: "p2",
    name: "USB-C Charging Cable 2m",
    supplier_name: "Electromarket AS",
    store_name: "Min Nettbutikk",
    sku: "A2B305",
    stock: 115,
    last_sync: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: "synced",
  },
  {
    id: "p3",
    name: "Premium Leather Wallet",
    supplier_name: "BrandStreet Tokyo",
    store_name: "Min Nettbutikk",
    sku: "BST-1001",
    stock: 25,
    last_sync: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: "synced",
  },
  {
    id: "p4",
    name: "Cotton T-Shirt Basic",
    supplier_name: "Fashion Hub PL",
    store_name: "Min Nettbutikk",
    sku: "5901234123457",
    stock: 180,
    last_sync: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending",
  },
];

const statusConfig: Record<
  ProductStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  synced: { label: "Synced", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  out_of_sync: { label: "Out of sync", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  error: { label: "Error", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" },
  pending: { label: "Pending", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
};

function formatTimeAgo(value?: string | null) {
  if (!value) return "Never";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} months ago`.replace(" months", Math.floor(days / 30).toString());
}

export default function Products({
  initialProducts,
  initialSupplierId,
  suppliers = [],
}: {
  initialProducts?: Array<{
    matching_key: string;
    qty: number;
    updated_at?: string | null;
    status: string;
  }>;
  initialSupplierId?: string | null;
  suppliers?: Array<{ id: string; name: string }>;
}) {
  const [products] = useState<Product[]>(() => {
    if (!initialProducts) return mockProducts;
    return initialProducts.map((p) => ({
      id: p.matching_key,
      name: p.matching_key,
      supplier_name: initialSupplierId ?? "Supplier",
      sku: p.matching_key,
      stock: Number(p.qty ?? 0),
      last_sync: p.updated_at ?? null,
      status: p.status === "in_stock" ? "synced" : "out_of_sync",
    }));
  });
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const supplierOptions = useMemo(() => {
    const fromDb = suppliers.map((s) => s.name || s.id);
    const fromProducts = products.map((p) => p.supplier_name);
    return Array.from(new Set([...fromDb, ...fromProducts])).filter(Boolean);
  }, [products, suppliers]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchStock =
        stockFilter === "all" ||
        (stockFilter === "in_stock" && p.stock > 0) ||
        (stockFilter === "out_of_stock" && p.stock === 0);
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      const matchSupplier = supplierFilter === "all" || p.supplier_name === supplierFilter;
      return matchSearch && matchStock && matchStatus && matchSupplier;
    });
  }, [search, stockFilter, statusFilter, supplierFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <p className="text-slate-500">{products.length} products synced</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-3 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            placeholder="Search products (name or SKU)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
        >
          <option value="all">All stock</option>
          <option value="in_stock">In Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
        >
          <option value="all">All statuses</option>
          <option value="synced">Synced</option>
          <option value="out_of_sync">Out of sync</option>
          <option value="error">Error</option>
          <option value="pending">Pending</option>
        </select>
        <select
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
        >
          <option value="all">All suppliers</option>
          {supplierOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_1fr_0.8fr_0.6fr_0.8fr_0.8fr] px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-100">
          <div>Product</div>
          <div>Supplier</div>
          <div>SKU</div>
          <div>Stock</div>
          <div>Last sync</div>
          <div>Status</div>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 text-slate-400 mb-2">
                <Package className="h-6 w-6" />
              </div>
              <p>No products found</p>
            </div>
          ) : (
            filtered.map((p) => <ProductRow key={p.id} product={p} />)
          )}
        </div>
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  const status = statusConfig[product.status];
  return (
    <div className="grid md:grid-cols-[2fr_1fr_0.8fr_0.6fr_0.8fr_0.8fr] px-4 py-4 items-center gap-3 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-medium">IMG</div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 truncate">{product.name}</p>
          <p className="text-sm text-slate-500 truncate">Connected to: {product.store_name || "Your Store"}</p>
        </div>
      </div>
      <div className="text-sm text-slate-700 truncate">{product.supplier_name}</div>
      <div className="text-sm font-mono px-2 py-1 bg-slate-100 rounded-lg border border-slate-200 inline-flex w-max">{product.sku}</div>
      <div className="text-sm font-semibold text-slate-800">{product.stock}</div>
      <div className="text-sm text-slate-500">{formatTimeAgo(product.last_sync)}</div>
      <div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${status.bg} ${status.color} ${status.border}`}>
          {product.status === "pending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
          {status.label}
        </span>
      </div>
    </div>
  );
}
