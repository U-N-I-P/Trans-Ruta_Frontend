import { useEffect, useState } from "react";
import { Bell, LogOut, Menu, Search, Sun, Moon } from "lucide-react";
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
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-8 dark:border-slate-800 dark:bg-slate-900/95 transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden shrink-0"
            onClick={onAbrirMovil}
            aria-label="Abrir barra lateral"
          >
            <Menu size={18} />
          </button>
          <div className="overflow-hidden">
            <p className="font-['Sora'] text-sm sm:text-base md:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[140px] xs:max-w-[180px] sm:max-w-none">
              Seguimiento en Tiempo Real
            </p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
              Control Center Trans-Ruta
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-slate-400 md:flex dark:border-slate-800 dark:bg-slate-950/40 shrink-0">
          <Search size={16} />
          <input
            type="search"
            placeholder="Buscar orden, placa o conductor"
            value={busquedaGlobal}
            onChange={(e) => onBusquedaGlobalChange(e.target.value)}
            className="w-40 lg:w-56 border-none text-sm text-slate-700 outline-none bg-transparent dark:text-slate-300"
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 shrink-0"
            title={isDark ? "Modo Claro" : "Modo Oscuro"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 sm:px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
              <Bell size={16} />
              <span className="hidden sm:inline">Alertas</span>
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] sm:text-xs text-red-700 dark:bg-red-950/50 dark:text-red-400">
                {notificaciones.length}
              </span>
            </summary>
            <div className="panel-fade-in absolute right-0 mt-3 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-panel dark:border-slate-800 dark:bg-slate-900 z-30">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Centro de notificaciones</p>
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {notificaciones.map((alerta) => (
                  <article key={alerta.id} className="rounded-lg border border-slate-100 p-2.5 dark:border-slate-800 dark:bg-slate-950/50">
                    <div className="mb-1 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${colorSeveridad[alerta.severidad]}`} />
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{alerta.titulo}</p>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{alerta.descripcion}</p>
                  </article>
                ))}
              </div>
            </div>
          </details>

          <button
            type="button"
            onClick={onCerrarSesion}
            className="inline-flex items-center gap-1.5 rounded-xl bg-logistics-800 px-2.5 sm:px-3 py-2 text-sm font-semibold text-white transition hover:bg-logistics-900 shadow-sm shrink-0"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
