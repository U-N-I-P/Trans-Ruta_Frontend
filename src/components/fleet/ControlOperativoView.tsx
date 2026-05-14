import { useState } from "react";
import { Clock, AlertCircle } from "lucide-react";

interface ControlOperativo {
  id: string;
  conductor: string;
  horasConducidas: number;
  horasDescanso: number;
  distancia: number;
  velocidadPromedio: number;
  paradas: number;
  estado: "EN_RUTA" | "DESCANSANDO" | "FINALIZADO";
}

export function ControlOperativoView({}: any) {
  const [registros] = useState<ControlOperativo[]>([
    {
      id: "1",
      conductor: "Juan Pérez",
      horasConducidas: 6.5,
      horasDescanso: 1.5,
      distancia: 450,
      velocidadPromedio: 65,
      paradas: 3,
      estado: "EN_RUTA"
    },
    {
      id: "2",
      conductor: "Carlos López",
      horasConducidas: 7.2,
      horasDescanso: 0.8,
      distancia: 520,
      velocidadPromedio: 72,
      paradas: 2,
      estado: "EN_RUTA"
    },
    {
      id: "3",
      conductor: "Ana García",
      horasConducidas: 8,
      horasDescanso: 0.5,
      distancia: 580,
      velocidadPromedio: 70,
      paradas: 4,
      estado: "FINALIZADO"
    }
  ]);

  const horasMaximasLegales = 9;
  const descansominimo = 2;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Control Operativo</h2>
        <p className="text-sm text-slate-600">Monitorea horas de conducción y cumplimiento de normativas</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Conductores Activos</p>
          <p className="text-2xl font-bold text-blue-600">{registros.filter(r => r.estado === "EN_RUTA").length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Horas Promedio</p>
          <p className="text-2xl font-bold text-slate-900">
            {(registros.reduce((acc, r) => acc + r.horasConducidas, 0) / registros.length).toFixed(1)}h
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Distancia Total</p>
          <p className="text-2xl font-bold text-slate-900">{registros.reduce((acc, r) => acc + r.distancia, 0)} km</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Velocidad Promedio</p>
          <p className="text-2xl font-bold text-slate-900">
            {Math.round(registros.reduce((acc, r) => acc + r.velocidadPromedio, 0) / registros.length)} km/h
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {registros.map((reg) => {
          const alerta = reg.horasConducidas > horasMaximasLegales - 1;
          return (
            <div key={reg.id} className={`rounded-xl border p-4 ${alerta ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-white"}`}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-600">Conductor</p>
                  <p className="font-bold text-slate-900">{reg.conductor}</p>
                </div>
                <div className="flex items-end justify-between sm:flex-col sm:items-start">
                  <div>
                    <p className="text-sm text-slate-600">Estado</p>
                    <p className={`font-semibold ${reg.estado === "EN_RUTA" ? "text-blue-600" : reg.estado === "DESCANSANDO" ? "text-yellow-600" : "text-green-600"}`}>
                      {reg.estado}
                    </p>
                  </div>
                </div>

                <div className="sm:col-span-2 grid gap-4 sm:grid-cols-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <p className="text-xs text-slate-600">Horas Conducidas</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-lg font-bold text-slate-900">{reg.horasConducidas.toFixed(1)}h</p>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full ${reg.horasConducidas >= horasMaximasLegales ? "bg-red-600" : "bg-green-600"}`}
                          style={{ width: `${(reg.horasConducidas / horasMaximasLegales) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Máximo: {horasMaximasLegales}h</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <p className="text-xs text-slate-600">Horas Descanso</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-lg font-bold text-slate-900">{reg.horasDescanso.toFixed(1)}h</p>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full ${reg.horasDescanso < descansominimo ? "bg-orange-500" : "bg-blue-600"}`}
                          style={{ width: `${(reg.horasDescanso / descansominimo) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Mínimo: {descansominimo}h</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600">Estadísticas</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-slate-900"><span className="font-semibold">{reg.distancia}</span> km</p>
                      <p className="text-sm text-slate-900"><span className="font-semibold">{reg.velocidadPromedio}</span> km/h prom.</p>
                      <p className="text-sm text-slate-900"><span className="font-semibold">{reg.paradas}</span> paradas</p>
                    </div>
                  </div>
                </div>

                {alerta && (
                  <div className="sm:col-span-2 flex items-center gap-2 text-orange-700 bg-white p-3 rounded-lg border border-orange-300">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-xs font-medium">Próximo a límite legal de conducción diaria</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
