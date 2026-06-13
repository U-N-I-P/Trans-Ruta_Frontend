import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, LogOut, Menu, Search, Sun, Moon, X, Truck, User, ClipboardList } from "lucide-react";
import { NotificacionIncidente, Vehiculo, Conductor, OrdenDespacho } from "../../types/domain";
import { VistaPrincipal } from "./Sidebar";

interface TopbarProps {
  notificaciones: NotificacionIncidente[];
  onAbrirMovil: () => void;
  onCerrarSesion: () => void;
  busquedaGlobal: string;
  onBusquedaGlobalChange: (valor: string) => void;
  vehiculos: Vehiculo[];
  conductores: Conductor[];
  ordenes: OrdenDespacho[];
  onCambiarVista: (vista: VistaPrincipal) => void;
}

const colorSeveridad = {
  Alta: "bg-red-500",
  Media: "bg-amber-500",
  Baja: "bg-emerald-500"
};

const formatearTipoVehiculo = (tipo: string) => {
  switch (tipo) {
    case "CAMION_CARGA_PESADA":
      return "Camión";
    case "TURBO":
      return "Turbo";
    case "CAMIONETA":
      return "Camioneta";
    default:
      return tipo;
  }
};

export function Topbar({
  notificaciones,
  onAbrirMovil,
  onCerrarSesion,
  busquedaGlobal,
  onBusquedaGlobalChange,
  vehiculos = [],
  conductores = [],
  ordenes = [],
  onCambiarVista
}: TopbarProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  const [mostrarResultados, setMostrarResultados] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setMostrarResultados(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const termino = busquedaGlobal.trim().toLowerCase();

  const resultadosVehiculos = useMemo(() => {
    if (termino.length < 2) return [];
    return vehiculos.filter(v => 
      v.placa.toLowerCase().includes(termino) ||
      v.tipo.toLowerCase().includes(termino) ||
      (v.estado && v.estado.toLowerCase().includes(termino))
    );
  }, [vehiculos, termino]);

  const resultadosConductores = useMemo(() => {
    if (termino.length < 2) return [];
    return conductores.filter(c => 
      c.nombre.toLowerCase().includes(termino) ||
      c.apellido.toLowerCase().includes(termino) ||
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(termino) ||
      c.cedula.toLowerCase().includes(termino)
    );
  }, [conductores, termino]);

  const resultadosOrdenes = useMemo(() => {
    if (termino.length < 2) return [];
    return ordenes.filter(o => 
      o.codigo.toLowerCase().includes(termino) ||
      o.origen.toLowerCase().includes(termino) ||
      o.destino.toLowerCase().includes(termino) ||
      (o.cliente?.nombre && o.cliente.nombre.toLowerCase().includes(termino))
    );
  }, [ordenes, termino]);

  const totalResultados = resultadosVehiculos.length + resultadosConductores.length + resultadosOrdenes.length;

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
    <header className="sticky top-4 z-20 mx-4 mb-4 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:mx-8 dark:border-slate-800 dark:bg-slate-900/95 transition-all duration-300 shadow-sm">
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

        <div ref={searchContainerRef} className="relative hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-slate-400 sm:flex dark:border-slate-800 dark:bg-slate-950/40 shrink-0">
          <Search size={16} />
          <input
            type="search"
            placeholder="Buscar orden, placa o conductor"
            value={busquedaGlobal}
            onChange={(e) => {
              onBusquedaGlobalChange(e.target.value);
              setMostrarResultados(true);
            }}
            onFocus={() => setMostrarResultados(true)}
            className="w-40 lg:w-56 border-none text-sm text-slate-700 outline-none bg-transparent dark:text-slate-300"
          />
          {busquedaGlobal && (
            <button
              type="button"
              onClick={() => {
                onBusquedaGlobalChange("");
                setMostrarResultados(false);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}

          {/* Search Results Dropdown Overlay */}
          {mostrarResultados && termino.length >= 2 && (
            <div className="absolute left-0 top-full mt-2 w-80 lg:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-panel dark:border-slate-800 dark:bg-slate-900 z-30 max-h-96 overflow-y-auto">
              {totalResultados === 0 ? (
                <div className="text-center py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                  No se encontraron resultados para "{busquedaGlobal}"
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Órdenes section */}
                  {resultadosOrdenes.length > 0 && (
                    <div>
                      <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Órdenes de Despacho ({resultadosOrdenes.length})</p>
                      <div className="space-y-1">
                        {resultadosOrdenes.map(orden => (
                          <button
                            key={orden.id}
                            type="button"
                            onClick={() => {
                              onCambiarVista("panel");
                              onBusquedaGlobalChange(orden.codigo);
                              setMostrarResultados(false);
                            }}
                            className="w-full text-left flex items-start gap-2.5 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                          >
                            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mt-0.5">
                              <ClipboardList size={14} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">{orden.codigo}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{orden.origen} → {orden.destino}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vehículos section */}
                  {resultadosVehiculos.length > 0 && (
                    <div>
                      <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Vehículos ({resultadosVehiculos.length})</p>
                      <div className="space-y-1">
                        {resultadosVehiculos.map(vehiculo => (
                          <button
                            key={vehiculo.id}
                            type="button"
                            onClick={() => {
                              onCambiarVista("vehiculos");
                              onBusquedaGlobalChange(vehiculo.placa);
                              setMostrarResultados(false);
                            }}
                            className="w-full text-left flex items-start gap-2.5 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                          >
                            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mt-0.5">
                              <Truck size={14} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{vehiculo.placa}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Tipo: {formatearTipoVehiculo(vehiculo.tipo)} • Estado: {vehiculo.estado}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conductores section */}
                  {resultadosConductores.length > 0 && (
                    <div>
                      <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Conductores ({resultadosConductores.length})</p>
                      <div className="space-y-1">
                        {resultadosConductores.map(conductor => (
                          <button
                            key={conductor.id}
                            type="button"
                            onClick={() => {
                              onCambiarVista("conductores");
                              onBusquedaGlobalChange(`${conductor.nombre} ${conductor.apellido}`);
                              setMostrarResultados(false);
                            }}
                            className="w-full text-left flex items-start gap-2.5 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                          >
                            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mt-0.5">
                              <User size={14} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">{conductor.nombre} {conductor.apellido}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">Cédula: {conductor.cedula} • Licencia: {conductor.categoriaLicencia}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
