import { useEffect, useState } from "react";
import { Clock, AlertCircle, RefreshCw, Activity } from "lucide-react";
import { ConductorHorasHoy, obtenerHorasHoy } from "../../services/conductor.service";

export function ControlOperativoView() {
  const [conductores, setConductores] = useState<ConductorHorasHoy[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const horasMaximasLegales = 9;
  const descansoMinimo = 2;

  const cargar = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await obtenerHorasHoy();
      setConductores(data);
    } catch {
      setError("No se pudo cargar el control operativo. Verifica tu conexión.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { void cargar(); }, []);

  const enRuta = conductores.filter(c => !c.disponible).length;
  const enDescanso = conductores.filter(c => c.disponible).length;
  const promedioHoras = conductores.length
    ? (conductores.reduce((acc, c) => acc + c.horasHoy, 0) / conductores.length).toFixed(1)
    : "0.0";
  const conAlerta = conductores.filter(c => c.horasHoy >= horasMaximasLegales - 1 && !c.disponible).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Control Operativo</h2>
          <p className="text-sm text-slate-600">Horas de conducción en tiempo real según órdenes activas de hoy</p>
        </div>
        <button
          type="button"
          onClick={() => void cargar()}
          disabled={cargando}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">En Ruta</p>
          <p className="text-2xl font-bold text-blue-600">{enRuta}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Horas Promedio Hoy</p>
          <p className="text-2xl font-bold text-slate-900">{promedioHoras}h</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">En Descanso</p>
          <p className="text-2xl font-bold text-green-600">{enDescanso}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Con Alerta</p>
          <p className="text-2xl font-bold text-orange-600">{conAlerta}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {cargando ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Cargando datos operativos...
        </div>
      ) : conductores.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No hay conductores registrados.
        </div>
      ) : (
        <div className="space-y-3">
          {conductores.map((conductor) => {
            const horasHoy = conductor.horasHoy;
            const alerta = horasHoy >= horasMaximasLegales - 1 && !conductor.disponible;
            const estado = conductor.disponible ? "DESCANSANDO" : "EN_RUTA";
            const horasDescanso = conductor.disponible ? Math.max(0, 24 - horasHoy - 8) : 0;

            return (
              <div
                key={conductor.id}
                className={`rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md ${alerta ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-white"}`}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-600">Conductor</p>
                    <p className="font-bold text-slate-900">{conductor.nombre} {conductor.apellido}</p>
                    <p className="text-xs text-slate-500">Lic. {conductor.numeroLicencia}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div>
                      <p className="text-sm text-slate-600">Estado</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold mt-1 ${estado === "EN_RUTA" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                        {estado.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-slate-600">Órdenes hoy</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Activity className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-900">{conductor.ordenesHoy}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2 grid gap-4 sm:grid-cols-3 pt-2 border-t border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <p className="text-xs font-semibold text-slate-700">Horas Conducidas Hoy</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-lg font-bold text-slate-900">{horasHoy.toFixed(1)}h</p>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full transition-all ${horasHoy >= horasMaximasLegales ? "bg-red-600" : horasHoy >= horasMaximasLegales - 1 ? "bg-orange-500" : "bg-green-600"}`}
                            style={{ width: `${Math.min((horasHoy / horasMaximasLegales) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-xs text-slate-500">Límite: {horasMaximasLegales}h</p>
                          <p className="text-[10px] text-slate-400">Total histórico: {(conductor.horasConducidas || 0).toFixed(0)}h</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <p className="text-xs text-slate-500">Descanso Estimado</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-lg font-bold text-slate-900">{horasDescanso.toFixed(1)}h</p>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${horasDescanso < descansoMinimo ? "bg-orange-500" : "bg-blue-600"}`}
                            style={{ width: `${Math.min((horasDescanso / descansoMinimo) * 100, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Mínimo: {descansoMinimo}h</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Resumen del día</p>
                      <div className="mt-2 space-y-1 text-sm text-slate-900">
                        <p><span className="font-semibold">{conductor.ordenesHoy}</span> orden{conductor.ordenesHoy !== 1 ? "es" : ""} activa{conductor.ordenesHoy !== 1 ? "s" : ""}</p>
                        <p><span className="font-semibold">{horasHoy.toFixed(1)}h</span> conducidas</p>
                        <p className={`text-xs ${horasHoy >= horasMaximasLegales ? "text-red-600 font-semibold" : "text-slate-400"}`}>
                          {horasHoy >= horasMaximasLegales ? "⚠ Límite legal alcanzado" : `${(horasMaximasLegales - horasHoy).toFixed(1)}h disponibles`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {alerta && (
                    <div className="sm:col-span-2 flex items-center gap-2 rounded-xl bg-white p-3 border border-orange-300 text-orange-700 mt-2 shadow-sm">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 animate-pulse text-red-600" />
                      <p className="text-sm font-semibold">¡Atención! Este conductor está por superar o ya superó el límite legal de conducción diaria.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
