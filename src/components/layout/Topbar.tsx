import { Bell, LogOut, Menu, Search } from "lucide-react";
import { NotificacionIncidente } from "../../types/domain";

interface TopbarProps {
  notificaciones: NotificacionIncidente[];
  onAbrirMovil: () => void;
  onCerrarSesion: () => void;
  busquedaGlobal: string;
  onBusquedaGlobalChange: (valor: string) => void;
}

const colorSeveridad = {
  Alta: "bg-red-500",
  Media: "bg-amber-500",
  Baja: "bg-emerald-500"
};

export function Topbar({
  notificaciones,
  onAbrirMovil,
  onCerrarSesion,
  busquedaGlobal,
  onBusquedaGlobalChange
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={onAbrirMovil}
            aria-label="Abrir barra lateral"
          >
            <Menu size={18} />
          </button>
          <div>
            <p className="font-['Sora'] text-lg font-semibold text-slate-900">Seguimiento en Tiempo Real</p>
            <p className="text-xs text-slate-500">Panel administrativo Trans-Ruta</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-slate-400 md:flex">
          <Search size={16} />
          <input
            type="search"
            placeholder="Buscar orden, placa o conductor"
            value={busquedaGlobal}
            onChange={(e) => onBusquedaGlobalChange(e.target.value)}
            className="w-56 border-none text-sm text-slate-700 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <Bell size={16} />
              Alertas
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">{notificaciones.length}</span>
            </summary>
            <div className="panel-fade-in absolute right-0 mt-3 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-panel">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Centro de notificaciones</p>
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {notificaciones.map((alerta) => (
                  <article key={alerta.id} className="rounded-lg border border-slate-100 p-2.5">
                    <div className="mb-1 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${colorSeveridad[alerta.severidad]}`} />
                      <p className="text-sm font-semibold text-slate-800">{alerta.titulo}</p>
                    </div>
                    <p className="text-xs text-slate-600">{alerta.descripcion}</p>
                  </article>
                ))}
              </div>
            </div>
          </details>

          <button
            type="button"
            onClick={onCerrarSesion}
            className="inline-flex items-center gap-2 rounded-xl bg-logistics-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-logistics-900"
          >
            <LogOut size={16} />
            Cerrar sesion
          </button>
        </div>
      </div>
    </header>
  );
}
