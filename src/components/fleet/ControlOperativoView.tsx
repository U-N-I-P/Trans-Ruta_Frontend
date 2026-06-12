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
      {/* Header */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm backdrop-blur-sm">
        <h2 className="font-['Sora'] text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">Control Operativo</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Monitorea horas de conducción y cumplimiento de normativas de tu flota real</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 w-full sm:w-1/2">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar conductor o licencia..."
              className="pl-10 pr-3 py-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 text-sm focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2 items-center mt-2 sm:mt-0">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as any)} 
            className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 text-sm outline-none"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="EN_RUTA">En ruta</option>
            <option value="DESCANSANDO">Descansando</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)} 
            className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 text-sm outline-none"
          >
            <option value="horas">Ordenar: Horas (desc)</option>
            <option value="nombre">Ordenar: Nombre (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 backdrop-blur-sm shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Conductores en Ruta</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{enRutaCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 backdrop-blur-sm shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Horas Promedio</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {conductores.length > 0
              ? (conductores.reduce((acc, r) => acc + (r.horasConducidas || 0), 0) / conductores.length).toFixed(1)
              : "0.0"}h
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 backdrop-blur-sm shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Conductores</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{conductores.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 backdrop-blur-sm shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">En Descanso</p>
          <p className="text-2xl font-bold text-green-600 dark:text-emerald-400">{conductores.filter(c => c.disponible).length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredConductores.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400">No hay conductores registrados.</p>
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
            <div key={conductor.id} className={`rounded-xl border p-5 shadow-sm transition-all duration-300 backdrop-blur-sm ${alerta ? "border-orange-300 dark:border-orange-500/20 bg-orange-50/70 dark:bg-orange-950/20 text-orange-950 dark:text-orange-200" : "border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300"}`}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Conductor</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{conductor.nombre} {conductor.apellido}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lic. {conductor.numeroLicencia}</p>
                </div>
                <div className="flex items-end justify-between sm:flex-col sm:items-end">
                  <div className="text-right sm:text-right">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estado</p>
                    <span className={`inline-block font-semibold text-xs px-2.5 py-1 rounded-full mt-1 ${estado === "EN_RUTA" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/30 dark:border-blue-500/10" : "bg-green-50 text-green-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-green-200/30 dark:border-emerald-500/10"}`}>
                      {estado === "EN_RUTA" ? "En Ruta" : "Descansando"}
                    </span>
                  </div>
                  <div className="sm:mt-2">
                    <button 
                      onClick={() => { setSelected(conductor); setHistOpen(true); }} 
                      className="rounded-lg bg-blue-600/10 border border-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 transition hover:bg-blue-600/20"
                    >
                      Ver historial
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2 grid gap-4 sm:grid-cols-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Horas Conducidas (Hoy)</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{horasHoy.toFixed(1)}h</p>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${horasHoy >= horasMaximasLegales ? "bg-red-600" : "bg-green-600"}`}
                          style={{ width: `${Math.min((horasHoy / horasMaximasLegales) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        <span>Límite: {horasMaximasLegales}h</span>
                        <span>Total: {totalHistorico.toFixed(0)}h</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Horas Descanso (Est.)</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{simDescanso.toFixed(1)}h</p>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-1.5">
                        <div
                          className={`h-1.5 rounded-full ${simDescanso < descansominimo ? "bg-orange-500" : "bg-blue-600"}`}
                          style={{ width: `${Math.min((simDescanso / descansominimo) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">Mínimo: {descansominimo}h</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Rendimiento (Est.)</p>
                    <div className="mt-2 space-y-1 text-sm text-slate-800 dark:text-slate-200">
                      <p><span className="font-bold text-slate-950 dark:text-slate-100">{simDistancia}</span> km recorridos</p>
                      <p><span className="font-bold text-slate-950 dark:text-slate-100">{simVelocidad}</span> km/h prom.</p>
                      <p><span className="font-bold text-slate-950 dark:text-slate-100">{simParadas}</span> paradas</p>
                    </div>
                  </div>
                </div>

                {alerta && (
                  <div className="sm:col-span-2 flex items-center gap-2.5 text-orange-700 dark:text-orange-400 bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-orange-300 dark:border-orange-500/15 mt-2 shadow-inner">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 animate-pulse text-red-650" />
                    <p className="text-xs font-semibold leading-relaxed">¡Atención! Este conductor está por superar o ya superó el límite legal de conducción diaria.</p>
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
