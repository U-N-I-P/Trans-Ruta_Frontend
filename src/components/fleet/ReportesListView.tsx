import { useEffect, useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import {
  obtenerReporteConsumoCombustible,
  obtenerReporteCumplimientoEntregas,
  obtenerReporteRutasRentables,
  ReporteConsumoCombustible,
  ReporteCumplimientoEntregas,
  ReporteRutaRentable
} from "../../services/reporte.service";

type ReporteVista = "combustible" | "rutas" | "cumplimiento";

export function ReportesListView() {
  const [consumos, setConsumos] = useState<ReporteConsumoCombustible[]>([]);
  const [rutas, setRutas] = useState<ReporteRutaRentable[]>([]);
  const [cumplimiento, setCumplimiento] = useState<ReporteCumplimientoEntregas | null>(null);
  const [vista, setVista] = useState<ReporteVista>("combustible");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarReportes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [consumoData, rutasData, cumplimientoData] = await Promise.all([
        obtenerReporteConsumoCombustible(),
        obtenerReporteRutasRentables(),
        obtenerReporteCumplimientoEntregas()
      ]);
      setConsumos(consumoData);
      setRutas(rutasData);
      setCumplimiento(cumplimientoData);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los reportes. Verifica la conexión con el backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void cargarReportes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reportes y Estadísticas</h2>
          <p className="text-sm text-slate-600">Analiza el rendimiento operativo de tu flota con datos reales</p>
        </div>
        <button
          type="button"
          onClick={() => void cargarReportes()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Actualizar reportes
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setVista("combustible")}
          className={`rounded-xl border p-5 text-left transition ${vista === "combustible" ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
        >
          <p className="text-sm text-slate-500">Consumo Combustible</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{consumos.length}</p>
          <p className="text-sm text-slate-600 mt-2">Vehículos con historial de consumo</p>
        </button>
        <button
          type="button"
          onClick={() => setVista("rutas")}
          className={`rounded-xl border p-5 text-left transition ${vista === "rutas" ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
        >
          <p className="text-sm text-slate-500">Rutas Rentables</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{rutas.length}</p>
          <p className="text-sm text-slate-600 mt-2">Rutas analizadas</p>
        </button>
        <button
          type="button"
          onClick={() => setVista("cumplimiento")}
          className={`rounded-xl border p-5 text-left transition ${vista === "cumplimiento" ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
        >
          <p className="text-sm text-slate-500">Cumplimiento de Entregas</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{cumplimiento ? cumplimiento.porcentajeCumplimiento : "--"}</p>
          <p className="text-sm text-slate-600 mt-2">Eficiencia del flujo operativo</p>
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {vista === "combustible" ? (
          <>
            <h3 className="text-lg font-bold text-slate-900">Detalle de consumo por vehículo</h3>
            <p className="text-sm text-slate-600">Resumen de órdenes agrupadas por vehículo</p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-900">Placa</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Tipo</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Órdenes</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Peso Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {consumos.map((item) => (
                    <tr key={item.vehiculo.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.vehiculo.placa}</td>
                      <td className="px-4 py-3 text-slate-600">{item.vehiculo.tipo}</td>
                      <td className="px-4 py-3 text-slate-600">{item.totalOrdenes}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{item.pesoTotal.toLocaleString("es-CO")} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : vista === "rutas" ? (
          <>
            <h3 className="text-lg font-bold text-slate-900">Rutas más rentables</h3>
            <p className="text-sm text-slate-600">Principales trayectos según volumen de órdenes</p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-900">Ruta</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Órdenes</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Peso Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rutas.map((item) => (
                    <tr key={item.ruta} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.ruta}</td>
                      <td className="px-4 py-3 text-slate-600">{item.totalOrdenes}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{item.pesoTotal.toLocaleString("es-CO")} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold text-slate-900">Cumplimiento de entregas</h3>
            <p className="text-sm text-slate-600">Indicadores de puntualidad de la operación</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Entregas a tiempo</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{cumplimiento?.aTiempo ?? 0}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Entregas tarde</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{cumplimiento?.tarde ?? 0}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Cumplimiento</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{cumplimiento?.porcentajeCumplimiento ?? "0%"}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
