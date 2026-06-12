import { useEffect, useMemo, useState } from "react";
import { Award, AlertCircle, RefreshCw, Search, Star, Trophy, TrendingUp, ShieldCheck } from "lucide-react";
import { Conductor } from "../../types/domain";
import { EvaluacionConductor } from "../../types/domain";
import { generarEvaluaciones, obtenerRankingEvaluaciones } from "../../services/evaluacion.service";
import { useToast } from "../ui/ToastProvider";
import { obtenerEvaluacionConductor } from "../../services/evaluacion.service";

interface EvaluacionConductoresViewProps {
  conductores: Conductor[];
}

export function EvaluacionConductoresView({ conductores: _ }: EvaluacionConductoresViewProps) {
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionConductor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recalculando, setRecalculando] = useState(false);
  const [modoReporte, setModoReporte] = useState<"MENSUAL" | "TRIMESTRAL">("MENSUAL");
  const [busqueda, setBusqueda] = useState("");
  const [periodo, setPeriodo] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const { addToast } = useToast();
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [evaluacionDetalle, setEvaluacionDetalle] = useState<EvaluacionConductor | null>(null);

  const obtenerPeriodosTrimestre = (periodoBase: string) => {
    const [anio, mes] = periodoBase.split("-").map(Number);
    const trimestre = Math.floor((mes - 1) / 3);
    const meses = Array.from({ length: 3 }, (_, index) => trimestre * 3 + index + 1);
    return meses.map((mesTrimestre) => `${anio}-${String(mesTrimestre).padStart(2, "0")}`);
  };

  const cargarEvaluaciones = async () => {
    try {
      setCargando(true);
      setError(null);

      if (modoReporte === "TRIMESTRAL") {
        const periodos = obtenerPeriodosTrimestre(periodo);
        const resultados = await Promise.all(periodos.map((periodoMes) => obtenerRankingEvaluaciones(periodoMes)));
        const mapa = new Map<number, EvaluacionConductor & { totalPeriodos: number }>();

        resultados.flat().forEach((item) => {
          const existente = mapa.get(item.conductorId);
          if (!existente) {
            mapa.set(item.conductorId, { ...item, totalPeriodos: 1 });
            return;
          }

          mapa.set(item.conductorId, {
            ...existente,
            scoreTotal: Number(existente.scoreTotal) + Number(item.scoreTotal),
            scorePuntualidad: Number(existente.scorePuntualidad) + Number(item.scorePuntualidad),
            scoreIncidentes: Number(existente.scoreIncidentes) + Number(item.scoreIncidentes),
            scoreCombustible: Number(existente.scoreCombustible) + Number(item.scoreCombustible),
            scoreCumplimientoProtocolos: Number(existente.scoreCumplimientoProtocolos) + Number(item.scoreCumplimientoProtocolos),
            scoreCalificacionClientes:
              Number(existente.scoreCalificacionClientes ?? 0) + Number(item.scoreCalificacionClientes ?? 0),
            entregasTotales: existente.entregasTotales + item.entregasTotales,
            entregasATiempo: existente.entregasATiempo + item.entregasATiempo,
            incidentesTotales: existente.incidentesTotales + item.incidentesTotales,
            ranking: existente.ranking ?? item.ranking,
            totalPeriodos: existente.totalPeriodos + 1,
          });
        });

        const consolidadas = Array.from(mapa.values())
          .map((item) => ({
            ...item,
            scoreTotal: Number((Number(item.scoreTotal) / item.totalPeriodos).toFixed(2)),
            scorePuntualidad: Number((Number(item.scorePuntualidad) / item.totalPeriodos).toFixed(2)),
            scoreIncidentes: Number((Number(item.scoreIncidentes) / item.totalPeriodos).toFixed(2)),
            scoreCombustible: Number((Number(item.scoreCombustible) / item.totalPeriodos).toFixed(2)),
            scoreCalificacionClientes: item.scoreCalificacionClientes != null
              ? Number((Number(item.scoreCalificacionClientes) / item.totalPeriodos).toFixed(2))
              : null,
            scoreCumplimientoProtocolos: Number((Number(item.scoreCumplimientoProtocolos) / item.totalPeriodos).toFixed(2)),
          }))
          .sort((a, b) => Number(b.scoreTotal) - Number(a.scoreTotal))
          .map((item, index) => ({ ...item, ranking: index + 1 }));

        setEvaluaciones(consolidadas);
        return;
      }

      const data = await obtenerRankingEvaluaciones(periodo);
      setEvaluaciones(data);
    } catch {
      setError("No se pudo cargar el ranking de evaluaciones. Verifica tu conexión.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarEvaluaciones();
  }, [modoReporte, periodo]);

  const recalcularMes = async () => {
    try {
      setRecalculando(true);
      await generarEvaluaciones(periodo);
      addToast({ message: "Evaluaciones generadas correctamente", type: "success" });
      await cargarEvaluaciones();
    } catch {
      setError("No se pudieron generar las evaluaciones del período seleccionado.");
      addToast({ message: "Error generando evaluaciones", type: "error" });
    } finally {
      setRecalculando(false);
    }
  };

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

  const evaluacionesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return evaluaciones.filter((evaluacion) => {
      if (texto.length === 0) return true;
      const nombre = `${evaluacion.conductor?.nombre ?? ""} ${evaluacion.conductor?.apellido ?? ""}`.toLowerCase();
      return nombre.includes(texto) || String(evaluacion.conductorId).includes(texto);
    });
  }, [busqueda, evaluaciones]);

  const resumen = useMemo(() => {
    const promedio = evaluaciones.length
      ? Math.round(
          evaluaciones.reduce((acc, item) => {
            const v = Number(item.scoreTotal);
            return acc + (Number.isFinite(v) ? v : 0);
          }, 0) / evaluaciones.length
        )
      : 0;
    const entregas = evaluaciones.reduce((acc, item) => acc + (Number(item.entregasTotales) || 0), 0);
    const puntualidad = evaluaciones.length
      ? Math.round(
          evaluaciones.reduce((acc, item) => {
            const v = Number(item.scorePuntualidad);
            return acc + (Number.isFinite(v) ? v : 0);
          }, 0) / evaluaciones.length
        )
      : 0;
    const top = evaluaciones[0];
    return { promedio, entregas, puntualidad, top };
  }, [evaluaciones]);

  const podium = evaluaciones.slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 dark:text-slate-300">
              <Trophy size={14} /> Evaluación de conductores
            </span>
            <h2 className="mt-3 font-['Sora'] text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">Desempeño, ranking y seguimiento operativo</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Revisa el rendimiento por período con una presentación más visual, agregando filtros, métricas y podio de desempeño.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[760px]">
            <SummaryCard titulo="Promedio" valor={`${resumen.promedio}%`} icono={Star} tono="bg-white/10" />
            <SummaryCard titulo="Entregas" valor={resumen.entregas} icono={TrendingUp} tono="bg-sky-400/20 dark:bg-sky-950/20" />
            <SummaryCard titulo="Puntualidad" valor={`${resumen.puntualidad}%`} icono={ShieldCheck} tono="bg-emerald-400/20 dark:bg-emerald-950/20" />
            <SummaryCard titulo="Ranking" valor={evaluaciones.length} icono={Award} tono="bg-amber-400/20 dark:bg-amber-950/20" />
          </div>
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-[1.2fr_1fr]">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-slate-700 dark:text-slate-300">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar conductor o ID..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-xs uppercase tracking-wider">Modo</span>
              <select
                value={modoReporte}
                onChange={(e) => setModoReporte(e.target.value as "MENSUAL" | "TRIMESTRAL")}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="MENSUAL">Mensual</option>
                <option value="TRIMESTRAL">Trimestral</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-xs uppercase tracking-wider">Período</span>
              <input
                type="month"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => void recalcularMes()}
              disabled={recalculando || modoReporte !== "MENSUAL"}
              className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-slate-100 transition hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${recalculando ? "animate-spin" : ""}`} />
              {recalculando ? "Generando..." : "Generar evaluación"}
            </button>
          </div>
        </div>
      </section>

      {detalleOpen && evaluacionDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Detalle de evaluación</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{evaluacionDetalle.conductor?.nombre}</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getRankingColor(evaluacionDetalle.ranking ?? 0)}`}>
                #{evaluacionDetalle.ranking ?? "-"}
              </span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 p-3">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Período</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">{evaluacionDetalle.periodo}</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 p-3">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Puntaje total</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">{`${evaluacionDetalle.scoreTotal}%`}</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 p-3">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Puntualidad</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">{String(evaluacionDetalle.scorePuntualidad)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 p-3">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Incidentes</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">{String(evaluacionDetalle.scoreIncidentes)}</p>
              </div>
              <div className="sm:col-span-2 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 p-4">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Comentarios</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{evaluacionDetalle.comentariosAdmin || "—"}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button 
                type="button" 
                onClick={() => setDetalleOpen(false)} 
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-xs text-red-400">{error}</div>}

      {cargando ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-10 text-center text-slate-500 dark:text-slate-400 shadow-panel backdrop-blur-sm">
          Cargando evaluaciones...
        </div>
      ) : evaluaciones.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-10 text-center text-slate-500 dark:text-slate-400 shadow-panel backdrop-blur-sm">
          No hay evaluaciones generadas para el período <strong>{periodo}</strong>.
          <p className="text-xs mt-2 text-slate-500 dark:text-slate-400">Puedes generar evaluaciones del mes desde el backend con el botón superior.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-5 shadow-panel backdrop-blur-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-['Sora'] text-lg font-semibold text-slate-900 dark:text-slate-100">Podio del período</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Los tres mejores resultados actuales</p>
                  </div>
                  <Trophy className="h-5 w-5 text-amber-500" />
                </div>
                <div className="space-y-3">
                  {podium.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Sin podio disponible.</p>}
                  {podium.map((evaluacion, index) => (
                    <button
                      key={evaluacion.id}
                      type="button"
                      onClick={async () => {
                        try {
                          const data = await obtenerEvaluacionConductor(evaluacion.conductorId, periodo);
                          setEvaluacionDetalle(data);
                          setDetalleOpen(true);
                        } catch {
                          addToast({ message: "No hay evaluación para este conductor en el período seleccionado.", type: "info" });
                        }
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                        index === 0 
                          ? "border-amber-250 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-950/20" 
                          : index === 1 
                            ? "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50" 
                            : "border-orange-200 dark:border-orange-500/20 bg-orange-50/70 dark:bg-orange-950/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">#{index + 1}</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-slate-100">
                            {evaluacion.conductor ? `${evaluacion.conductor.nombre} ${evaluacion.conductor.apellido}` : `Conductor #${evaluacion.conductorId}`}
                          </p>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{evaluacion.entregasTotales} entregas · {evaluacion.entregasATiempo} a tiempo</p>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{Number(evaluacion.scoreTotal).toFixed(0)}%</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {evaluacionesFiltradas.map((evaluacion, index) => {
                const ranking = evaluacion.ranking ?? index + 1;
                const scoreTotal = Number(evaluacion.scoreTotal);
                return (
                  <div key={evaluacion.id} className={`rounded-3xl border p-6 shadow-panel backdrop-blur-sm ${ranking <= 3 ? "border-slate-250 dark:border-slate-800 bg-gradient-to-r from-slate-50/90 to-blue-50/90 dark:from-slate-900/50 dark:to-blue-950/15" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80"}`}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start justify-between sm:col-span-2">
                        <div>
                          <div className="flex items-center gap-3">
                            {ranking <= 3 && <Award className="h-5 w-5 text-yellow-600 dark:text-amber-400" />}
                            <h3 className="font-bold text-slate-900 dark:text-slate-100">
                              {evaluacion.conductor
                                ? `${evaluacion.conductor.nombre} ${evaluacion.conductor.apellido}`
                                : `Conductor #${evaluacion.conductorId}`}
                            </h3>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const data = await obtenerEvaluacionConductor(evaluacion.conductorId, periodo);
                                  setEvaluacionDetalle(data);
                                  setDetalleOpen(true);
                                } catch {
                                  addToast({ message: "No hay evaluación para este conductor en el período seleccionado.", type: "info" });
                                }
                              }}
                              className="rounded-lg bg-blue-600/10 border border-blue-500/20 px-2 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 transition hover:bg-blue-600/20 ml-3 shrink-0"
                            >
                              Ver detalle
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Entregas: {evaluacion.entregasTotales} · A tiempo: {evaluacion.entregasATiempo}</p>
                        </div>
                        <div className={`inline-block rounded-full px-4 py-2 font-bold text-center w-20 ${getRankingColor(ranking)}`}>
                          #{ranking}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-baseline justify-between">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Puntaje General</p>
                          <p className={`text-2xl font-bold ${getPuntajeColor(scoreTotal)}`}>{scoreTotal}%</p>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className={`h-2 rounded-full ${scoreTotal >= 90 ? "bg-green-600" : scoreTotal >= 75 ? "bg-yellow-600" : "bg-red-600"}`}
                            style={{ width: `${scoreTotal}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Métricas</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-xl bg-white dark:bg-slate-950/40 p-2 shadow-sm border border-slate-100 dark:border-slate-850/50">
                            <p className="text-slate-500 dark:text-slate-400">Puntualidad</p>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{Number(evaluacion.scorePuntualidad).toFixed(1)}/30</p>
                          </div>
                          <div className="rounded-xl bg-white dark:bg-slate-950/40 p-2 shadow-sm border border-slate-100 dark:border-slate-850/50">
                            <p className="text-slate-500 dark:text-slate-400">Seguridad</p>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{Number(evaluacion.scoreIncidentes).toFixed(1)}/25</p>
                          </div>
                          <div className="rounded-xl bg-white dark:bg-slate-950/40 p-2 shadow-sm border border-slate-100 dark:border-slate-850/50">
                            <p className="text-slate-500 dark:text-slate-400">Combustible</p>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{Number(evaluacion.scoreCombustible).toFixed(1)}/20</p>
                          </div>
                          <div className="rounded-xl bg-white dark:bg-slate-950/40 p-2 shadow-sm border border-slate-100 dark:border-slate-850/50">
                            <p className="text-slate-500 dark:text-slate-400">Protocolos</p>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{Number(evaluacion.scoreCumplimientoProtocolos).toFixed(1)}/10</p>
                          </div>
                          <div className="col-span-2 rounded-xl bg-white dark:bg-slate-950/40 p-2 shadow-sm border border-slate-100 dark:border-slate-850/50">
                            <p className="text-slate-500 dark:text-slate-400">Clientes</p>
                            <p className="font-bold text-slate-900 dark:text-slate-100">
                              {evaluacion.scoreCalificacionClientes != null ? `${Number(evaluacion.scoreCalificacionClientes).toFixed(1)}/15` : "Sin datos"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {evaluacion.comentariosAdmin && (
                        <div className="sm:col-span-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/30 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                          <span className="font-semibold">Comentarios: </span>{evaluacion.comentariosAdmin}
                        </div>
                      )}
                    </div>

                    {scoreTotal < 75 && (
                      <div className="mt-4 flex items-center gap-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200/40 dark:border-orange-500/10 p-3 text-xs text-orange-700 dark:text-orange-400">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <p>Requiere seguimiento de desempeño</p>
                      </div>
                    )}
                  </div>
                );
              })}
              {evaluacionesFiltradas.length === 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-8 text-center text-slate-500 dark:text-slate-400 shadow-panel backdrop-blur-sm">
                  No hay conductores que coincidan con la búsqueda.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  titulo,
  valor,
  icono: Icono,
  tono
}: {
  titulo: string;
  valor: string | number;
  icono: typeof Star;
  tono: string;
}) {
  const bgClass = tono === "bg-white/10" ? "bg-slate-50/80 dark:bg-slate-800/80" : tono;
  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-800/80 ${bgClass} p-3 backdrop-blur-sm`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">{titulo}</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{valor}</p>
        </div>
        <Icono size={18} className="text-slate-700 dark:text-slate-300 mt-0.5" />
      </div>
    </div>
  );
}
