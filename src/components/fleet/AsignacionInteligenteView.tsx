import { useState, useMemo } from "react";
import { BarChart3, Zap, CheckCircle } from "lucide-react";
import { Conductor, OrdenDespacho, Vehiculo } from "../../types/domain";
import { actualizarOrdenDespacho } from "../../services/orden.service";

interface Recomendacion {
  ordenId: number;
  codigoOrden: string;
  vehiculoId: number;
  vehiculoPlaca: string;
  conductorId: number;
  conductorNombre: string;
  score: number;
  razones: string[];
}

interface AsignacionInteligenteProps {
  ordenes: OrdenDespacho[];
  vehiculos: Vehiculo[];
  conductores: Conductor[];
}

export function AsignacionInteligenteView({ ordenes, vehiculos, conductores }: AsignacionInteligenteProps) {
  const [actualizando, setActualizando] = useState<number | null>(null);

  const recomendaciones = useMemo(() => {
    // Solo evaluamos órdenes que recién se despachan
    const ordenesEvaluables = ordenes.filter(o => o.estado === "DESPACHADO");
    
    return ordenesEvaluables.map(orden => {
      const vehiculo = vehiculos.find(v => v.id === orden.vehiculoId);
      const conductor = conductores.find(c => c.id === orden.conductorId);
      
      let score = 100;
      const razones: string[] = [];

      if (!vehiculo || !conductor) {
        return {
          ordenId: orden.id,
          codigoOrden: orden.codigo,
          vehiculoId: 0,
          vehiculoPlaca: "Desconocido",
          conductorId: 0,
          conductorNombre: "Desconocido",
          score: 0,
          razones: ["Faltan datos de asignación"]
        };
      }

      // Evaluar Vehículo
      if (vehiculo.capacidadCarga < orden.pesoCarga) {
        score -= 50;
        razones.push("¡Peligro! Sobrecarga detectada");
      } else if (vehiculo.capacidadCarga >= orden.pesoCarga * 2) {
        score -= 15;
        razones.push("Vehículo sobredimensionado (Gasto innecesario)");
      } else {
        razones.push("Capacidad de carga óptima");
      }

      if (vehiculo.estado === "EN_MANTENIMIENTO") {
        score -= 40;
        razones.push("Vehículo en mantenimiento");
      } else if (vehiculo.estado === "DISPONIBLE" || vehiculo.estado === "EN_RUTA") {
        razones.push("Vehículo operativo");
      }

      // Evaluar Conductor
      if (conductor.horasConducidas > 40) {
        score -= 20;
        razones.push("Fatiga: Exceso de horas de conducción");
      } else {
        razones.push("Horas de conducción en norma");
      }

      if (conductor.licenciaVencida) {
        score -= 50;
        razones.push("¡Licencia Vencida!");
      } else if (conductor.diasParaVencimiento < 30) {
        score -= 10;
        razones.push("Licencia próxima a vencer");
      } else {
        razones.push("Licencia vigente");
      }

      return {
        ordenId: orden.id,
        codigoOrden: orden.codigo,
        vehiculoId: vehiculo.id,
        vehiculoPlaca: vehiculo.placa,
        conductorId: conductor.id,
        conductorNombre: `${conductor.nombre} ${conductor.apellido}`,
        score: Math.max(0, score),
        razones
      };
    });
  }, [ordenes, vehiculos, conductores]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 75) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const handleAsignar = async (rec: Recomendacion) => {
    try {
      setActualizando(rec.ordenId);
      // Simula confirmación de evaluación en backend (o podría hacer una reasignación si cambiara IDs)
      await actualizarOrdenDespacho(rec.ordenId, { vehiculoId: rec.vehiculoId, conductorId: rec.conductorId });
      alert(`Asignación de la Orden ${rec.codigoOrden} confirmada y optimizada exitosamente.`);
    } catch (err) {
      alert("Error al confirmar asignación.");
    } finally {
      setActualizando(null);
    }
  };

  const promediarScore = recomendaciones.length > 0 
    ? Math.round(recomendaciones.reduce((acc, r) => acc + r.score, 0) / recomendaciones.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Asignación Inteligente</h2>
        <p className="text-sm text-slate-550 dark:text-slate-400">Evaluador y optimizador de recursos asignados a órdenes activas</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-550 dark:text-slate-400">Órdenes Evaluadas</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{recomendaciones.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-550 dark:text-slate-400">Score Promedio</p>
              <p className={`text-2xl font-bold ${promediarScore >= 90 ? 'text-green-600 dark:text-emerald-400' : promediarScore >= 75 ? 'text-yellow-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                {promediarScore}%
              </p>
            </div>
            <Zap className="h-8 w-8 text-yellow-600 dark:text-amber-500" />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-550 dark:text-slate-400">Asignaciones Óptimas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-emerald-400">
                {recomendaciones.filter(r => r.score >= 90).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {recomendaciones.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-10 text-center text-slate-500 dark:text-slate-400 shadow-sm">
            No hay órdenes recién despachadas para evaluar.
          </div>
        ) : (
          recomendaciones.map((rec) => (
            <div key={rec.ordenId} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Orden</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{rec.codigoOrden}</p>
                </div>
                <div className="flex items-end justify-between sm:flex-col sm:items-start">
                  <div>
                    <p className="text-sm text-slate-555 dark:text-slate-400">Score de Asignación actual</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${getScoreColor(rec.score)}`}>
                        {rec.score}%
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Conductor Asignado</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{rec.conductorNombre}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Vehículo Asignado</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{rec.vehiculoPlaca}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Evaluación de esta asignación:</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.razones.map((r, i) => (
                      <span key={i} className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        r.includes("¡Peligro!") || r.includes("Vencida") 
                          ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/30 dark:border-red-500/10" 
                          : r.includes("óptima") || r.includes("vigente") || r.includes("norma")
                            ? "bg-green-50 text-green-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-green-200/30 dark:border-emerald-500/10"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/30 dark:border-blue-500/10"
                      }`}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2 mt-2">
                  <button
                    onClick={() => handleAsignar(rec)}
                    disabled={actualizando === rec.ordenId}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 font-semibold disabled:opacity-50 transition-colors shadow-md shadow-blue-500/10"
                  >
                    {actualizando === rec.ordenId ? "Confirmando..." : "Confirmar Evaluación"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
