import { useState } from "react";
import { BarChart3, Zap, CheckCircle } from "lucide-react";

interface Recomendacion {
  ordenId: string;
  vehiculoPlaca: string;
  conductorNombre: string;
  score: number;
  razon: string[];
}

export function AsignacionInteligenteView({}: any) {
  const [recomendaciones] = useState<Recomendacion[]>([
    {
      ordenId: "ORD-004",
      vehiculoPlaca: "ABC-123",
      conductorNombre: "Juan Pérez",
      score: 95,
      razon: ["Disponible", "Zona cercana", "Licencia vigente", "Buen rendimiento"]
    },
    {
      ordenId: "ORD-005",
      vehiculoPlaca: "XYZ-789",
      conductorNombre: "Carlos López",
      score: 87,
      razon: ["Capacidad suficiente", "Ruta optimizada", "Horario disponible"]
    },
    {
      ordenId: "ORD-006",
      vehiculoPlaca: "DEF-456",
      conductorNombre: "Ana García",
      score: 92,
      razon: ["Especializado", "Documentación completa", "Experiencia"]
    }
  ]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 75) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const handleAsignar = (rec: Recomendacion) => {
    alert(`Orden ${rec.ordenId} asignada a ${rec.conductorNombre} - Vehículo ${rec.vehiculoPlaca}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Asignación Inteligente</h2>
        <p className="text-sm text-slate-600">Sistema de recomendación automática de recursos</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Órdenes Pendientes</p>
              <p className="text-2xl font-bold text-slate-900">{recomendaciones.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Score Promedio</p>
              <p className="text-2xl font-bold text-slate-900">
                {Math.round(recomendaciones.reduce((acc, r) => acc + r.score, 0) / recomendaciones.length)}%
              </p>
            </div>
            <Zap className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Asignaciones Óptimas</p>
              <p className="text-2xl font-bold text-slate-900">
                {recomendaciones.filter(r => r.score >= 90).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {recomendaciones.map((rec) => (
          <div key={rec.ordenId} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Orden</p>
                <p className="font-bold text-slate-900">{rec.ordenId}</p>
              </div>
              <div className="flex items-end justify-between sm:flex-col sm:items-start">
                <div>
                  <p className="text-sm text-slate-500">Score de Asignación</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${getScoreColor(rec.score)}`}>
                      {rec.score}%
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Conductor Recomendado</p>
                <p className="font-semibold text-slate-900">{rec.conductorNombre}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Vehículo Recomendado</p>
                <p className="font-semibold text-slate-900">{rec.vehiculoPlaca}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-slate-500 mb-2">Criterios que optimizan esta asignación:</p>
                <div className="flex flex-wrap gap-2">
                  {rec.razon.map((r) => (
                    <span key={r} className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <button
                  onClick={() => handleAsignar(rec)}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 font-medium"
                >
                  Confirmar Asignación
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
