import { useEffect, useState } from "react";
import { CheckCircle, Clock, Loader2, RefreshCcw, XCircle } from "lucide-react";
import {
  aprobarSolicitudCompra,
  obtenerSolicitudesCompra,
  rechazarSolicitudCompra,
  SolicitudCompra
} from "../../services/solicitudDeCompra.service";

const estadoColors: Record<string, { color: string; icono: any }> = {
  PENDIENTE: { color: "bg-yellow-100 text-yellow-800", icono: Clock },
  APROBADA: { color: "bg-blue-100 text-blue-800", icono: CheckCircle },
  RECHAZADA: { color: "bg-red-100 text-red-800", icono: XCircle },
  RECIBIDA: { color: "bg-green-100 text-green-800", icono: CheckCircle }
};

export function ComprasListView() {
  const [solicitudes, setSolicitudes] = useState<SolicitudCompra[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarSolicitudes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await obtenerSolicitudesCompra();
      setSolicitudes(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar las solicitudes. Verifica la conexión con el backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void cargarSolicitudes();
  }, []);

  const actualizarEstado = async (id: number, aprobada: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      if (aprobada) {
        await aprobarSolicitudCompra(id);
      } else {
        await rechazarSolicitudCompra(id);
      }
      await cargarSolicitudes();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el estado de la solicitud. Intenta de nuevo.");
      setIsLoading(false);
    }
  };

  const totalInversion = solicitudes.reduce((acc, solicitud) => acc + solicitud.montoTotal, 0);
  const pendientes = solicitudes.filter((solicitud) => solicitud.estado === "PENDIENTE").length;
  const aprobadas = solicitudes.filter((solicitud) => solicitud.estado === "APROBADA").length;
  const recibidas = solicitudes.filter((solicitud) => solicitud.estado === "RECIBIDA").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Solicitudes de Compra</h2>
          <p className="text-sm text-slate-600">Administra solicitudes y aprobaciones desde el backend</p>
        </div>
        <button
          type="button"
          onClick={() => void cargarSolicitudes()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Actualizar
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">{pendientes}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Aprobadas</p>
          <p className="text-2xl font-bold text-blue-600">{aprobadas}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Recibidas</p>
          <p className="text-2xl font-bold text-green-600">{recibidas}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Inversión Total</p>
          <p className="text-2xl font-bold text-slate-900">${totalInversion.toLocaleString("es-CO")}</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-900">ID</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Descripción</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Cantidad</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Monto Total</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Estado</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Fecha</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {solicitudes.map((solicitud) => {
              const { color, icono: Icon } = estadoColors[solicitud.estado];
              return (
                <tr key={solicitud.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">{solicitud.id}</td>
                  <td className="px-6 py-3 text-slate-600">{solicitud.descripcion || solicitud.conceptoLibre || "Sin descripción"}</td>
                  <td className="px-6 py-3 text-slate-600">{solicitud.cantidad}</td>
                  <td className="px-6 py-3 font-semibold text-slate-900">${solicitud.montoTotal.toLocaleString("es-CO")}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${color}`}>
                      <Icon className="h-3 w-3" />
                      {solicitud.estado}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{new Date(solicitud.fecha).toLocaleDateString("es-CO")}</td>
                  <td className="px-6 py-3">
                    {solicitud.estado === "PENDIENTE" ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void actualizarEstado(solicitud.id, true)}
                          className="rounded-full bg-green-100 px-3 py-1 text-green-700 transition hover:bg-green-200 text-xs font-semibold"
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => void actualizarEstado(solicitud.id, false)}
                          className="rounded-full bg-red-100 px-3 py-1 text-red-700 transition hover:bg-red-200 text-xs font-semibold"
                        >
                          Rechazar
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">Sin acciones disponibles</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
