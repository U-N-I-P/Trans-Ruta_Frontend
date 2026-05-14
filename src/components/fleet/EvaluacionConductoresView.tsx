import { useState } from "react";
import { Award, AlertCircle } from "lucide-react";

interface EvaluacionConductor {
  id: string;
  nombre: string;
  puntaje: number;
  entregas: number;
  eficiencia: number;
  seguridad: number;
  puntualidad: number;
  ranking: number;
}

export function EvaluacionConductoresView({}: any) {
  const [evaluaciones] = useState<EvaluacionConductor[]>([
    {
      id: "1",
      nombre: "Juan Pérez",
      puntaje: 95,
      entregas: 156,
      eficiencia: 94,
      seguridad: 98,
      puntualidad: 93,
      ranking: 1
    },
    {
      id: "2",
      nombre: "Carlos López",
      puntaje: 87,
      entregas: 142,
      eficiencia: 86,
      seguridad: 89,
      puntualidad: 87,
      ranking: 2
    },
    {
      id: "3",
      nombre: "Ana García",
      puntaje: 92,
      entregas: 148,
      eficiencia: 91,
      seguridad: 95,
      puntualidad: 90,
      ranking: 3
    },
    {
      id: "4",
      nombre: "Pedro Martínez",
      puntaje: 78,
      entregas: 125,
      eficiencia: 75,
      seguridad: 82,
      puntualidad: 77,
      ranking: 4
    }
  ]);

  const getRankingColor = (ranking: number) => {
    if (ranking === 1) return "bg-yellow-100 text-yellow-800";
    if (ranking === 2) return "bg-slate-100 text-slate-800";
    if (ranking === 3) return "bg-orange-100 text-orange-800";
    return "bg-slate-50 text-slate-600";
  };

  const getPuntajeColor = (puntaje: number) => {
    if (puntaje >= 90) return "text-green-600";
    if (puntaje >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Evaluación de Conductores</h2>
        <p className="text-sm text-slate-600">Desempeño mensual y ranking de conductores</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Promedio de Flota</p>
          <p className="text-2xl font-bold text-blue-600">
            {Math.round(evaluaciones.reduce((acc, e) => acc + e.puntaje, 0) / evaluaciones.length)}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Entregas Totales</p>
          <p className="text-2xl font-bold text-green-600">
            {evaluaciones.reduce((acc, e) => acc + e.entregas, 0)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Conductores Evaluados</p>
          <p className="text-2xl font-bold text-slate-900">{evaluaciones.length}</p>
        </div>
      </div>

      <div className="space-y-3">
        {evaluaciones.map((evaluacion) => (
          <div key={evaluacion.id} className={`rounded-xl border border-slate-200 p-6 ${evaluacion.ranking <= 3 ? "bg-gradient-to-r from-slate-50 to-blue-50" : "bg-white"}`}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start justify-between sm:col-span-2">
                <div>
                  <div className="flex items-center gap-3">
                    {evaluacion.ranking <= 3 && <Award className="h-5 w-5 text-yellow-600" />}
                    <h3 className="font-bold text-slate-900">{evaluacion.nombre}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Entregas: {evaluacion.entregas}</p>
                </div>
                <div className={`inline-block rounded-full px-4 py-2 font-bold text-center w-20 ${getRankingColor(evaluacion.ranking)}`}>
                  #{evaluacion.ranking}
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-slate-600">Puntaje General</p>
                  <p className={`text-2xl font-bold ${getPuntajeColor(evaluacion.puntaje)}`}>{evaluacion.puntaje}%</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      evaluacion.puntaje >= 90 ? "bg-green-600" : evaluacion.puntaje >= 80 ? "bg-yellow-600" : "bg-red-600"
                    }`}
                    style={{ width: `${evaluacion.puntaje}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700 uppercase">Métricas</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white rounded p-2">
                    <p className="text-slate-600">Eficiencia</p>
                    <p className="font-bold text-slate-900">{evaluacion.eficiencia}%</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <p className="text-slate-600">Seguridad</p>
                    <p className="font-bold text-slate-900">{evaluacion.seguridad}%</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <p className="text-slate-600">Puntualidad</p>
                    <p className="font-bold text-slate-900">{evaluacion.puntualidad}%</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <p className="text-slate-600">Entregas</p>
                    <p className="font-bold text-slate-900">{evaluacion.entregas}</p>
                  </div>
                </div>
              </div>
            </div>

            {evaluacion.puntaje < 80 && (
              <div className="mt-4 flex items-center gap-2 text-xs text-orange-700 bg-orange-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p>Requiere seguimiento de desempeño</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
