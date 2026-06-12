import { useEffect, useState } from "react";
import { Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import { SolicitudCompra } from "../../types/domain";
import { obtenerSolicitudesCompra } from "../../services/solicitudCompra.service";

export function ComprasListView() {
  const [showForm, setShowForm] = useState(false);
  const [solicitudes, setSolicitudes] = useState<SolicitudCompra[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await obtenerSolicitudesCompra();
        setSolicitudes(data);
      } catch {
        setError("No se pudieron cargar las solicitudes de compra. Verifica tu conexión.");
      } finally {
        setCargando(false);
      }
    };
    void cargar();
  }, []);

  const estadoColors: Record<string, { color: string; icono: any }> = {
    PENDIENTE: { color: "bg-yellow-50 text-yellow-700 dark:bg-amber-950/30 dark:text-amber-400 border border-yellow-200/30 dark:border-amber-500/10", icono: Clock },
    APROBADA: { color: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/30 dark:border-blue-500/10", icono: CheckCircle },
    RECHAZADA: { color: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/30 dark:border-red-500/10", icono: XCircle },
    RECIBIDA: { color: "bg-green-50 text-green-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-green-200/30 dark:border-emerald-500/10", icono: CheckCircle }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Solicitudes de Compra</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Aprueba o rechaza solicitudes de repuestos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-550 transition-colors font-semibold shadow-md shadow-blue-500/10"
        >
          <Plus className="h-4 w-4" />
          Nueva Compra
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 shadow-sm backdrop-blur-sm">
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Solicitud de compra registrada (Simulación)");
              setShowForm(false);
            }}
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Concepto / Repuesto</label>
              <input type="text" className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" required placeholder="Ej. Filtro de Aceite" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Cantidad</label>
              <input type="number" min="1" className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Costo Estimado</label>
              <input type="number" step="0.01" className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>
            <div className="sm:col-span-2 flex gap-3 mt-2">
              <button type="submit" className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-550 transition-colors font-semibold shadow-md shadow-blue-500/10">
                Guardar Compra
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-xs text-red-400">{error}</div>
      )}

      {cargando ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-10 text-center text-slate-500 dark:text-slate-400 shadow-sm backdrop-blur-sm">
          Cargando solicitudes de compra...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-amber-400">{solicitudes.filter(s => s.estado === "PENDIENTE").length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400">Aprobadas</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{solicitudes.filter(s => s.estado === "APROBADA").length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400">Recibidas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-emerald-400">{solicitudes.filter(s => s.estado === "RECIBIDA").length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400">Inversión Total</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                ${solicitudes.reduce((acc, s) => acc + (s.costoEstimado ?? 0), 0).toLocaleString("es-CO")}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 overflow-hidden shadow-sm backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Código</th>
                    <th className="px-6 py-3 font-semibold">Concepto</th>
                    <th className="px-6 py-3 font-semibold">Cantidad</th>
                    <th className="px-6 py-3 font-semibold">Costo Est.</th>
                    <th className="px-6 py-3 font-semibold">Solicitado Por</th>
                    <th className="px-6 py-3 font-semibold">Estado</th>
                    <th className="px-6 py-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {solicitudes.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">No hay solicitudes de compra.</td>
                    </tr>
                  )}
                  {solicitudes.map((sol) => {
                    const config = estadoColors[sol.estado] ?? { color: "bg-slate-100 text-slate-800", icono: Clock };
                    const Icon = config.icono;
                    return (
                      <tr key={sol.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-3 font-bold text-slate-900 dark:text-slate-100">{sol.codigo}</td>
                        <td className="px-6 py-3">{sol.conceptoLibre ?? sol.repuesto?.nombre ?? "—"}</td>
                        <td className="px-6 py-3">{sol.cantidad}</td>
                        <td className="px-6 py-3 font-bold text-slate-900 dark:text-slate-100">
                          {sol.costoEstimado != null ? `$${sol.costoEstimado.toLocaleString("es-CO")}` : "—"}
                        </td>
                        <td className="px-6 py-3">{sol.solicitante?.nombre ?? "—"}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.color}`}>
                            <Icon className="h-3 w-3" />
                            {sol.estado}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          {sol.estado === "PENDIENTE" ? (
                            <div className="flex gap-2">
                              <button className="text-green-600 dark:text-emerald-450 hover:text-green-700 dark:hover:text-emerald-355 text-xs font-semibold transition-colors">Aprobar</button>
                              <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs font-semibold transition-colors">Rechazar</button>
                            </div>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
