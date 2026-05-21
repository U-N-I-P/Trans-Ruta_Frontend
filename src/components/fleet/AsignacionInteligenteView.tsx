import { useEffect, useMemo, useState } from "react";
import { BarChart3, Zap, CheckCircle, Loader2, RefreshCcw } from "lucide-react";
import { obtenerSugerencias, SugerenciaAsignacion } from "../../services/sugerencia.service";
import { Conductor, OrdenDespacho, Vehiculo } from "../../types/domain";

interface AsignacionInteligenteViewProps {
  ordenes: OrdenDespacho[];
  vehiculos: Vehiculo[];
  conductores: Conductor[];
}

export function AsignacionInteligenteView({ ordenes }: AsignacionInteligenteViewProps) {
  const [origen, setOrigen] = useState(ordenes[0]?.origen ?? "");
  const [destino, setDestino] = useState(ordenes[0]?.destino ?? "");
  const [pesoCarga, setPesoCarga] = useState(ordenes[0]?.pesoCarga ?? 1000);
  const [recomendaciones, setRecomendaciones] = useState<SugerenciaAsignacion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarSugerencias = async () => {
    if (!origen || !destino || !pesoCarga) {
      setError("Completa origen, destino y peso de carga para generar una sugerencia.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await obtenerSugerencias(pesoCarga, origen, destino, 5);
      setRecomendaciones(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron obtener sugerencias. Verifica que el backend esté disponible.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (origen && destino) {
      void cargarSugerencias();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scorePromedio = useMemo(
    () => (recomendaciones.length ? Math.round(recomendaciones.reduce((acc, item) => acc + item.scoreCombinado, 0) / recomendaciones.length) : 0),
    [recomendaciones]
  );

  const asignacionesOptimas = useMemo(() => recomendaciones.filter((item) => item.scoreCombinado >= 90).length, [recomendaciones]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 75) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Asignación Inteligente</h2>
          <p className="text-sm text-slate-600">Genera recomendaciones reales de asignación desde el backend</p>
        </div>
        <button
          type="button"
          onClick={() => void cargarSugerencias()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Actualizar
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Órdenes Simuladas</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{ordenes.length}</p>
          <p className="text-sm text-slate-500 mt-2">Ordenes cargadas en el panel</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Score Promedio</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{scorePromedio}%</p>
          <p className="text-sm text-slate-500 mt-2">Calificación de las sugerencias actuales</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Asignaciones Óptimas</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{asignacionesOptimas}</p>
          <p className="text-sm text-slate-500 mt-2">Propuestas con score >= 90%</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Origen</span>
            <input
              type="text"
              value={origen}
              onChange={(event) => setOrigen(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              placeholder="Ciudad de origen"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Destino</span>
            <input
              type="text"
              value={destino}
              onChange={(event) => setDestino(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              placeholder="Ciudad de destino"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Peso de carga (kg)</span>
            <input
              type="number"
              value={pesoCarga}
              onChange={(event) => setPesoCarga(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
              min={1}
            />
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">Obteniendo sugerencias...</div>
      ) : recomendaciones.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">No hay sugerencias disponibles con los datos actuales.</div>
      ) : (
        <div className="space-y-4">
          {recomendaciones.map((rec, index) => (
            <div key={`${rec.vehiculo.id}-${rec.conductor.id}-${index}`} className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Vehículo</p>
                  <p className="font-semibold text-slate-900">{rec.vehiculo.placa} • {rec.vehiculo.tipo}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Conductor</p>
                  <p className="font-semibold text-slate-900">{rec.conductor.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Score Vehículo</p>
                  <p className="mt-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-900">{rec.scoreVehiculo}%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Score Conductor</p>
                  <p className="mt-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-900">{rec.scoreConductor}%</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-slate-500">Score Combinado</p>
                  <p className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getScoreColor(rec.scoreCombinado)}`}>
                    {rec.scoreCombinado}%
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-slate-500">Justificación</p>
                  <p className="mt-2 text-slate-700">{rec.justificacion}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-slate-500 mb-2">Detalles de la recomendación</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Vehículo</p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {rec.detallesVehiculo.map((detalle) => (
                          <li key={detalle}>• {detalle}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Conductor</p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {rec.detallesConductor.map((detalle) => (
                          <li key={detalle}>• {detalle}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    className="w-full rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    onClick={() => window.alert(`Asignación sugerida: ${rec.conductor.nombre} / ${rec.vehiculo.placa}`)}
                  >
                    Confirmar asignación
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
