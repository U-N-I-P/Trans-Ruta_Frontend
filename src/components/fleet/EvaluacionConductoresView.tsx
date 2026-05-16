import { useEffect, useState } from "react";
import { Award, AlertCircle } from "lucide-react";
import { Conductor } from "../../types/domain";
import { EvaluacionConductor } from "../../types/domain";
import { obtenerRankingEvaluaciones } from "../../services/evaluacion.service";

interface EvaluacionConductoresViewProps {
  conductores: Conductor[];
}

export function EvaluacionConductoresView({ conductores: _ }: EvaluacionConductoresViewProps) {
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionConductor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await obtenerRankingEvaluaciones(periodo);
        setEvaluaciones(data);
      } catch {
        setError("No se pudo cargar el ranking de evaluaciones. Verifica tu conexión.");
      } finally {
        setCargando(false);
      }
    };
    void cargar();
  }, [periodo]);

  const getRankingColor = (ranking: number) => {
    if (ranking === 1) return "bg-yellow-100 text-yellow-800";
    if (ranking === 2) return "bg-slate-100 text-slate-800";
    if (ranking === 3) return "bg-orange-100 text-orange-800";
    return "bg-slate-50 text-slate-600";
  };

  const getPuntajeColor = (puntaje: number) => {
    if (puntaje >= 90) return "text-green-600";
    if (puntaje >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Evaluación de Conductores</h2>
          <p className="text-sm text-slate-600">Desempeño mensual y ranking de conductores</p>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mr-2">Período:</label>
          <input
            type="month"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {cargando ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Cargando evaluaciones...
        </div>
      ) : evaluaciones.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No hay evaluaciones generadas para el período <strong>{periodo}</strong>.
          <p className="text-xs mt-2 text-slate-400">Puedes generar evaluaciones desde el backend con POST /evaluaciones/generar.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Promedio de Flota</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(evaluaciones.reduce((acc, e) => acc + Number(e.scoreTotal), 0) / evaluaciones.length)}%
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Entregas Totales</p>
              <p className="text-2xl font-bold text-green-600">
                {evaluaciones.reduce((acc, e) => acc + e.entregasTotales, 0)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Conductores Evaluados</p>
              <p className="text-2xl font-bold text-slate-900">{evaluaciones.length}</p>
            </div>
          </div>

          <div className="space-y-3">
            {evaluaciones.map((evaluacion, index) => {
              const ranking = evaluacion.ranking ?? index + 1;
              const scoreTotal = Number(evaluacion.scoreTotal);
              return (
                <div key={evaluacion.id} className={`rounded-xl border border-slate-200 p-6 ${ranking <= 3 ? "bg-gradient-to-r from-slate-50 to-blue-50" : "bg-white"}`}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start justify-between sm:col-span-2">
                      <div>
                        <div className="flex items-center gap-3">
                          {ranking <= 3 && <Award className="h-5 w-5 text-yellow-600" />}
                          <h3 className="font-bold text-slate-900">
                            {evaluacion.conductor
                              ? `${evaluacion.conductor.nombre} ${evaluacion.conductor.apellido}`
                              : `Conductor #${evaluacion.conductorId}`}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">Entregas: {evaluacion.entregasTotales} · A tiempo: {evaluacion.entregasATiempo}</p>
                      </div>
                      <div className={`inline-block rounded-full px-4 py-2 font-bold text-center w-20 ${getRankingColor(ranking)}`}>
                        #{ranking}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between">
                        <p className="text-sm text-slate-600">Puntaje General</p>
                        <p className={`text-2xl font-bold ${getPuntajeColor(scoreTotal)}`}>{scoreTotal}%</p>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${scoreTotal >= 90 ? "bg-green-600" : scoreTotal >= 75 ? "bg-yellow-600" : "bg-red-600"}`}
                          style={{ width: `${scoreTotal}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-700 uppercase">Métricas</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white rounded p-2">
                          <p className="text-slate-600">Puntualidad</p>
                          <p className="font-bold text-slate-900">{Number(evaluacion.scorePuntualidad).toFixed(1)}/30</p>
                        </div>
                        <div className="bg-white rounded p-2">
                          <p className="text-slate-600">Seguridad</p>
                          <p className="font-bold text-slate-900">{Number(evaluacion.scoreIncidentes).toFixed(1)}/25</p>
                        </div>
                        <div className="bg-white rounded p-2">
                          <p className="text-slate-600">Combustible</p>
                          <p className="font-bold text-slate-900">{Number(evaluacion.scoreCombustible).toFixed(1)}/20</p>
                        </div>
                        <div className="bg-white rounded p-2">
                          <p className="text-slate-600">Protocolos</p>
                          <p className="font-bold text-slate-900">{Number(evaluacion.scoreCumplimientoProtocolos).toFixed(1)}/10</p>
                        </div>
                      </div>
                    </div>

                    {evaluacion.comentariosAdmin && (
                      <div className="sm:col-span-2 text-xs text-slate-600 bg-slate-50 rounded p-2">
                        <span className="font-semibold">Comentarios: </span>{evaluacion.comentariosAdmin}
                      </div>
                    )}
                  </div>

                  {scoreTotal < 75 && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-orange-700 bg-orange-50 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <p>Requiere seguimiento de desempeño</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
