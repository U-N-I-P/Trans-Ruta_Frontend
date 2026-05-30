import { useMemo, useState } from "react";
import { Clock, AlertCircle, Search } from "lucide-react";
import { ConductorConDisponibilidad } from "../../types/domain";
import { HistorialModal } from "./HistorialModal";

interface ControlOperativoViewProps {
  conductores: ConductorConDisponibilidad[];
}

export function ControlOperativoView({ conductores }: ControlOperativoViewProps) {
  const horasMaximasLegales = 9;
  const descansominimo = 2;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "EN_RUTA" | "DESCANSANDO">("ALL");
  const [sortBy, setSortBy] = useState<"nombre" | "horas">("horas");
  const [selected, setSelected] = useState<ConductorConDisponibilidad | null>(null);
  const [histOpen, setHistOpen] = useState(false);

  const enRutaCount = conductores.filter((c) => !c.disponible).length;

  const filteredConductores = useMemo(() => {
    let list = conductores.slice();
    if (statusFilter !== "ALL") {
      const wantDisponible = statusFilter === "DESCANSANDO";
      list = list.filter((c) => Boolean(c.disponible) === wantDisponible);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((c) => (`${c.nombre} ${c.apellido}`.toLowerCase().includes(q) || (c.numeroLicencia || "").toLowerCase().includes(q)));
    }
    if (sortBy === "horas") {
      list.sort((a, b) => (b.horasConducidas || 0) - (a.horasConducidas || 0));
    } else {
      list.sort((a, b) => (`${a.nombre} ${a.apellido}`).localeCompare(`${b.nombre} ${b.apellido}`));
    }
    return list;
  }, [conductores, query, statusFilter, sortBy]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Control Operativo</h2>
        <p className="text-sm text-slate-600">Monitorea horas de conducción y cumplimiento de normativas de tu flota real</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 w-full sm:w-1/2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar conductor o licencia..."
              className="pl-10 pr-3 py-2 w-full rounded border border-slate-200 bg-white text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2 items-center mt-2 sm:mt-0">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-3 py-2 border rounded bg-white text-sm">
            <option value="ALL">Todos</option>
            <option value="EN_RUTA">En ruta</option>
            <option value="DESCANSANDO">Descansando</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-2 border rounded bg-white text-sm">
            <option value="horas">Ordenar: Horas (desc)</option>
            <option value="nombre">Ordenar: Nombre (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Conductores en Ruta</p>
          <p className="text-2xl font-bold text-blue-600">{enRutaCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Horas Promedio</p>
          <p className="text-2xl font-bold text-slate-900">
            {conductores.length > 0
              ? (conductores.reduce((acc, r) => acc + (r.horasConducidas || 0), 0) / conductores.length).toFixed(1)
              : "0.0"}h
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Total Conductores</p>
          <p className="text-2xl font-bold text-slate-900">{conductores.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">En Descanso</p>
          <p className="text-2xl font-bold text-green-600">{conductores.filter(c => c.disponible).length}</p>
        </div>
      </div>

      <div className="space-y-3">
        {filteredConductores.length === 0 && (
          <p className="text-slate-500">No hay conductores registrados.</p>
        )}
        {filteredConductores.map((conductor) => {
          const totalHistorico = conductor.horasConducidas || 0;
          const horasHoy = !conductor.disponible ? (totalHistorico % 10) : 0;
          const alerta = horasHoy > horasMaximasLegales - 1 && !conductor.disponible;
          const estado = conductor.disponible ? "DESCANSANDO" : "EN_RUTA";

          const simDistancia = !conductor.disponible ? Math.floor(horasHoy * 60) : 0;
          const simVelocidad = !conductor.disponible ? Math.floor(Math.random() * 20) + 60 : 0;
          const simParadas = !conductor.disponible ? Math.floor(horasHoy / 2) : 0;
          const simDescanso = conductor.disponible ? Math.max(1, 24 - horasHoy - 8) : 0;

          return (
            <div key={conductor.id} className={`rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md ${alerta ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-white"}`}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-600">Conductor</p>
                  <p className="font-bold text-slate-900">{conductor.nombre} {conductor.apellido}</p>
                  <p className="text-xs text-slate-500">Lic. {conductor.numeroLicencia}</p>
                </div>
                <div className="flex items-end justify-between sm:flex-col sm:items-start">
                  <div>
                    <p className="text-sm text-slate-600">Estado</p>
                    <p className={`font-semibold text-sm px-2 py-0.5 rounded-full mt-1 ${estado === "EN_RUTA" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                      {estado.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="sm:mt-2">
                    <button onClick={() => { setSelected(conductor); setHistOpen(true); }} className="px-3 py-1 bg-sky-600 text-white rounded text-sm">Ver historial</button>
                  </div>
                </div>

                <div className="sm:col-span-2 grid gap-4 sm:grid-cols-3 pt-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <p className="text-xs font-semibold text-slate-700">Horas Conducidas (Hoy)</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-lg font-bold text-slate-900">{horasHoy.toFixed(1)}h</p>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full transition-all ${horasHoy >= horasMaximasLegales ? "bg-red-600" : "bg-green-600"}`}
                          style={{ width: `${Math.min((horasHoy / horasMaximasLegales) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-slate-500">Límite: {horasMaximasLegales}h</p>
                        <p className="text-[10px] text-slate-400">Total: {totalHistorico.toFixed(0)}h</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <p className="text-xs text-slate-500">Horas Descanso (Estimado)</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-lg font-bold text-slate-900">{simDescanso.toFixed(1)}h</p>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full ${simDescanso < descansominimo ? "bg-orange-500" : "bg-blue-600"}`}
                          style={{ width: `${Math.min((simDescanso / descansominimo) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Mínimo: {descansominimo}h</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Rendimiento (Estimado)</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-slate-900"><span className="font-semibold">{simDistancia}</span> km recorridos</p>
                      <p className="text-sm text-slate-900"><span className="font-semibold">{simVelocidad}</span> km/h prom.</p>
                      <p className="text-sm text-slate-900"><span className="font-semibold">{simParadas}</span> paradas</p>
                    </div>
                  </div>
                </div>

                {alerta && (
                  <div className="sm:col-span-2 flex items-center gap-2 text-orange-700 bg-white p-3 rounded-lg border border-orange-300 mt-2 shadow-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 animate-pulse text-red-600" />
                    <p className="text-sm font-semibold">¡Atención! Este conductor está por superar o ya superó el límite legal de conducción diaria.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <HistorialModal open={histOpen} conductor={selected} onClose={() => { setHistOpen(false); setSelected(null); }} />
    </div>
  );
}
