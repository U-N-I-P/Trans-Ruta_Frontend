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
    PENDIENTE: { color: "bg-yellow-100 text-yellow-800", icono: Clock },
    APROBADA: { color: "bg-blue-100 text-blue-800", icono: CheckCircle },
    RECHAZADA: { color: "bg-red-100 text-red-800", icono: XCircle },
    RECIBIDA: { color: "bg-green-100 text-green-800", icono: CheckCircle }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Solicitudes de Compra</h2>
          <p className="text-sm text-slate-600">Aprueba o rechaza solicitudes de repuestos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nueva Compra
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Solicitud de compra registrada (Simulación)");
              setShowForm(false);
            }}
          >
            <div>
              <label className="block text-sm font-medium text-slate-700">Concepto / Repuesto</label>
              <input type="text" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" required placeholder="Ej. Filtro de Aceite" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Cantidad</label>
              <input type="number" min="1" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Costo Estimado</label>
              <input type="number" step="0.01" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" required />
            </div>
            <div className="sm:col-span-2 flex gap-3 mt-2">
              <button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 font-medium">
                Guardar Compra
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {cargando ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Cargando solicitudes de compra...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{solicitudes.filter(s => s.estado === "PENDIENTE").length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Aprobadas</p>
              <p className="text-2xl font-bold text-blue-600">{solicitudes.filter(s => s.estado === "APROBADA").length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Recibidas</p>
              <p className="text-2xl font-bold text-green-600">{solicitudes.filter(s => s.estado === "RECIBIDA").length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Inversión Total</p>
              <p className="text-2xl font-bold text-slate-900">
                ${solicitudes.reduce((acc, s) => acc + (s.costoEstimado ?? 0), 0).toLocaleString("es-CO")}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-900">Código</th>
                  <th className="px-6 py-3 font-semibold text-slate-900">Concepto</th>
                  <th className="px-6 py-3 font-semibold text-slate-900">Cantidad</th>
                  <th className="px-6 py-3 font-semibold text-slate-900">Costo Est.</th>
                  <th className="px-6 py-3 font-semibold text-slate-900">Solicitado Por</th>
                  <th className="px-6 py-3 font-semibold text-slate-900">Estado</th>
                  <th className="px-6 py-3 font-semibold text-slate-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {solicitudes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-slate-500">No hay solicitudes de compra.</td>
                  </tr>
                )}
                {solicitudes.map((sol) => {
                  const config = estadoColors[sol.estado] ?? { color: "bg-slate-100 text-slate-800", icono: Clock };
                  const Icon = config.icono;
                  return (
                    <tr key={sol.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium text-slate-900">{sol.codigo}</td>
                      <td className="px-6 py-3 text-slate-600">{sol.conceptoLibre ?? sol.repuesto?.nombre ?? "—"}</td>
                      <td className="px-6 py-3 text-slate-600">{sol.cantidad}</td>
                      <td className="px-6 py-3 font-semibold text-slate-900">
                        {sol.costoEstimado != null ? `$${sol.costoEstimado.toLocaleString("es-CO")}` : "—"}
                      </td>
                      <td className="px-6 py-3 text-slate-600">{sol.solicitante?.nombre ?? "—"}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
                          <Icon className="h-3 w-3" />
                          {sol.estado}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {sol.estado === "PENDIENTE" ? (
                          <div className="flex gap-2">
                            <button className="text-green-600 hover:text-green-700 text-xs font-medium">Aprobar</button>
                            <button className="text-red-600 hover:text-red-700 text-xs font-medium">Rechazar</button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
