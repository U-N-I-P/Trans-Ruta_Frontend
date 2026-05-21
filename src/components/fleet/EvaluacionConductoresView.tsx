import { useEffect, useMemo, useState } from "react";
import { Award, AlertTriangle, Loader2, RefreshCcw } from "lucide-react";
import { obtenerRankingEvaluacion, EvaluacionRanking } from "../../services/evaluacion.service";

export function EvaluacionConductoresView() {
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionRanking[]>([]);
  const [periodo, setPeriodo] = useState(() => new Date().toISOString().slice(0, 7));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarEvaluaciones = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await obtenerRankingEvaluacion(periodo);
      setEvaluaciones(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el ranking de evaluaciones. Verifica la conexión con el backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void cargarEvaluaciones();
  }, [periodo]);

  const promedioPuntaje = useMemo(
    () => (evaluaciones.length ? Math.round(evaluaciones.reduce((acc, item) => acc + item.scoreTotal, 0) / evaluaciones.length) : 0),
    [evaluaciones]
  );

  const totalEntregas = evaluaciones.reduce((acc, item) => acc + item.entregasTotales, 0);

  const getRankingColor = (posicion: number) => {
    if (posicion === 1) return "bg-yellow-100 text-yellow-800";
    if (posicion === 2) return "bg-slate-100 text-slate-800";
    if (posicion === 3) return "bg-orange-100 text-orange-800";
    return "bg-slate-50 text-slate-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Evaluación de Conductores</h2>
          <p className="text-sm text-slate-600">Desempeño mensual y ranking real de conductores</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="text-sm text-slate-600">Periodo</label>
          <input
            type="month"
            value={periodo}
            onChange={(event) => setPeriodo(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          />
          <button
            type="button"
            onClick={() => void cargarEvaluaciones()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Actualizar
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Puntaje Promedio</p>
          <p className="text-2xl font-bold text-blue-600">{promedioPuntaje}%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Entregas Totales</p>
          <p className="text-2xl font-bold text-green-600">{totalEntregas}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Conductores Evaluados</p>
          <p className="text-2xl font-bold text-slate-900">{evaluaciones.length}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">Cargando datos de evaluación...</div>
      ) : evaluaciones.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">No hay evaluaciones disponibles para este periodo.</div>
      ) : (
        <div className="space-y-3">
          {evaluaciones.map((evaluacion) => (
            <div key={evaluacion.conductor.id} className={`rounded-xl border border-slate-200 p-6 ${evaluacion.posicion <= 3 ? "bg-gradient-to-r from-slate-50 to-blue-50" : "bg-white"}`}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start justify-between sm:col-span-2">
                  <div>
                    <div className="flex items-center gap-3">
                      {evaluacion.posicion <= 3 && <Award className="h-5 w-5 text-yellow-600" />}
                      <h3 className="font-bold text-slate-900">{evaluacion.conductor.nombre}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">Licencia: {evaluacion.conductor.numeroLicencia}</p>
                  </div>
                  <div className={`inline-block rounded-full px-4 py-2 font-bold text-center w-20 ${getRankingColor(evaluacion.posicion)}`}>
                    #{evaluacion.posicion}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Puntaje Total</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{evaluacion.scoreTotal}%</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Puntualidad</p>
                  <p className="text-lg font-semibold text-slate-900">{evaluacion.porcentajePuntualidad}%</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Incidentes</p>
                  <p className="text-lg font-semibold text-slate-900">{evaluacion.incidentesTotales}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Rendimiento</p>
                  <p className="text-lg font-semibold text-slate-900">{evaluacion.rendimientoPromedio ?? 0}%</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Entregas</p>
                  <p className="text-lg font-semibold text-slate-900">{evaluacion.entregasTotales}</p>
                </div>
              </div>

              {evaluacion.scoreTotal < 80 && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
                  <AlertTriangle className="h-4 w-4" />
                  <p>Conductor con desempeño mejorable. Revisa su historial y toma acciones.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
