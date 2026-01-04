import { Link } from "react-router";

export default function Index() {
  return (
    <div className="space-y-6">
      {/* Topp-seksjon med Velkomst */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Oversikt over din lager-synkronisering</p>
        </div>
        <Link 
          to="/app/suppliers/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-sm"
        >
          + Ny leverandør
        </Link>
      </div>

      {/* Stats-kort (Slik de ser ut i workdokumentet ditt) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Aktive synk</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">12</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Varer oppdatert i dag</p>
          <p className="text-3xl font-bold text-green-600 mt-1">1,240</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Systemstatus</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">99.9%</p>
        </div>
      </div>

      {/* Activity Log - Placeholder */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Siste hendelser</h2>
        </div>
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 text-slate-400 mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d=" incumbents-none 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01" />
            </svg>
          </div>
          <p className="text-slate-500">Ingen data å vise ennå. Koble til en leverandør for å starte.</p>
        </div>
      </div>
    </div>
  );
}

