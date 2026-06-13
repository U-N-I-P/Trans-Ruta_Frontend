import { useEffect, useState } from "react";
import { ClipboardList, PackageSearch, Truck, Users, UserPlus, FileText, AlertCircle, DollarSign, BarChart3, Lock, Zap, Wrench, CheckCircle, Award, MapPin, ShoppingCart, Clock, Package, Phone, ShieldCheck } from "lucide-react";
import { SidebarItem } from "./SidebarItem";

export type VistaPrincipal = "panel" | "flota" | "vehiculos" | "conductores" | "documentos" | "mantenimiento" | "entregas" | "ordenes" | "incidentes" | "viaticos" | "combustible" | "asignacion" | "evaluacion" | "compras" | "gps" | "manifiestos" | "operativo" | "inventario" | "clientes" | "reportes" | "auditoria" | "equipos";

interface SidebarProps {
  colapsado: boolean;
  movilAbierto: boolean;
  vistaActiva: VistaPrincipal;
  onCerrarMovil: () => void;
  onAlternarColapsado: () => void;
  onCambiarVista: (vista: VistaPrincipal) => void;
}

interface UserData {
  nombre: string;
  correo: string;
  rol: string;
}

const VISTAS_POR_ROL: Record<string, string[]> = {
  ADMINISTRADOR: [
    "panel", "gps", "asignacion", "operativo", "entregas", "incidentes", "manifiestos",
    "flota", "vehiculos", "conductores", "documentos",
    "mantenimiento", "inventario",
    "viaticos", "combustible", "compras",
    "reportes", "clientes", "evaluacion", "auditoria"
  ],
  DESPACHADOR: [
    "panel", "gps", "asignacion", "operativo", "entregas", "incidentes", "manifiestos",
    "flota", "vehiculos", "conductores", "documentos",
    "reportes", "clientes", "evaluacion"
  ],
  CONDUCTOR: [
    "entregas", "incidentes", "viaticos", "combustible"
  ],
  JEFE_TALLER: [
    "mantenimiento", "inventario", "vehiculos", "documentos", "combustible", "compras", "incidentes"
  ],
  GESTOR_INVENTARIO: [
    "inventario", "compras"
  ],
  AUDITOR: [
    "auditoria", "panel", "gps", "manifiestos", "incidentes", "viaticos", "combustible", "reportes"
  ],
  CLIENTE: [
    "clientes"
  ]
};

export function Sidebar({
  colapsado: _colapsado,
  movilAbierto,
  vistaActiva,
  onCerrarMovil,
  onAlternarColapsado: _onAlternarColapsado,
  onCambiarVista
}: SidebarProps) {
  const [usuario, setUsuario] = useState<UserData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("trans_ruta_usuario");
      if (raw) {
        setUsuario(JSON.parse(raw));
      }
    } catch {
      // noop
    }
  }, []);

  const rol = usuario?.rol || "ADMINISTRADOR";
  const vistasPermitidas = VISTAS_POR_ROL[rol] || VISTAS_POR_ROL["ADMINISTRADOR"];
  const esPermitido = (vista: string) => vistasPermitidas.includes(vista);

  const tieneOperacion = ["panel", "gps", "asignacion", "operativo", "entregas", "incidentes", "manifiestos"].some(esPermitido);
  const tieneFlota = ["flota", "vehiculos", "conductores", "documentos"].some(esPermitido);
  const tieneMantenimiento = ["mantenimiento", "inventario"].some(esPermitido);
  const tieneFinanzas = ["viaticos", "combustible", "compras"].some(esPermitido);
  const tieneReportes = ["reportes"].some(esPermitido);
  const tieneAdministracion = ["clientes", "evaluacion", "auditoria"].some(esPermitido);

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      {movilAbierto && <div className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={onCerrarMovil} />}
      <aside
        className={`group fixed left-0 top-0 z-40 m-4 h-[calc(100vh-2rem)] flex flex-col rounded-2xl bg-slate-900/75 backdrop-blur-md border border-slate-800 text-white shadow-2xl transition-all duration-300 ease-in-out [&::-webkit-scrollbar]:hidden overflow-y-auto overflow-x-hidden ${
          movilAbierto ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 w-20 hover:w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="mb-6 flex items-center justify-center p-4 sticky top-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/50 z-10">
          <div className="flex items-center justify-center lg:group-hover:justify-start w-full">
            <div className="bg-blue-600 rounded-lg p-2 shrink-0 shadow-lg shadow-blue-500/20">
              <Truck size={24} className="text-white" />
            </div>
            <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
              movilAbierto
                ? "opacity-100 w-auto ml-3"
                : "w-0 opacity-0 lg:group-hover:w-auto lg:group-hover:opacity-100 lg:group-hover:ml-3"
            }`}>
              <p className="font-['Sora'] text-lg font-bold tracking-wide">Trans-Ruta</p>
              <p className="text-[10px] text-blue-300 font-medium uppercase tracking-wider">Centro de Control</p>
            </div>
          </div>
        </div>

        {/* Navigation Modules */}
        <nav className="flex-1 space-y-1.5 px-3 pb-6">
          {/* OPERACIÓN */}
          {tieneOperacion && (
            <>
              <div className={`h-[1px] bg-slate-800/60 my-2 mx-1 ${movilAbierto ? "hidden" : "group-hover:hidden"}`} />
              <p className={`text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mt-4 mb-2 transition-all duration-300 ${movilAbierto ? "block" : "hidden group-hover:block"}`}>OPERACIÓN</p>
              {esPermitido("panel") && (
                <SidebarItem
                  icono={ClipboardList}
                  etiqueta="Panel de Control"
                  activo={vistaActiva === "panel"}
                  onClick={() => onCambiarVista("panel")}
                  expanded={movilAbierto}
                />
              )}
              {esPermitido("gps") && (
                <SidebarItem
                  icono={MapPin}
                  etiqueta="GPS Rastreo"
                  activo={vistaActiva === "gps"}
                  onClick={() => onCambiarVista("gps")}
                  expanded={movilAbierto}
                />
              )}
              {esPermitido("asignacion") && (
                <SidebarItem
                  icono={Zap}
                  etiqueta="Asignación"
                  activo={vistaActiva === "asignacion"}
                  onClick={() => onCambiarVista("asignacion")}
                  expanded={movilAbierto}
                />
              )}
              {esPermitido("operativo") && (
                <SidebarItem
                  icono={Clock}
                  etiqueta="Control Operativo"
                  activo={vistaActiva === "operativo"}
                  onClick={() => onCambiarVista("operativo")}
                  expanded={movilAbierto}
                />
              )}
              {esPermitido("entregas") && (
                <SidebarItem
                  icono={CheckCircle}
                  etiqueta="Entregas"
                  activo={vistaActiva === "entregas"}
                  onClick={() => onCambiarVista("entregas")}
                  expanded={movilAbierto}
                />
              )}
              {esPermitido("incidentes") && (
                <SidebarItem
                  icono={AlertCircle}
                  etiqueta="Incidentes"
                  activo={vistaActiva === "incidentes"}
                  onClick={() => onCambiarVista("incidentes")}
                  expanded={movilAbierto}
                />
              )}
              {esPermitido("manifiestos") && (
                <SidebarItem
                  icono={FileText}
                  etiqueta="Manifiestos"
                  activo={vistaActiva === "manifiestos"}
                  onClick={() => onCambiarVista("manifiestos")}
                  expanded={movilAbierto}
                />
              )}
            </>
          )}

          {/* FLOTA */}
          {tieneFlota && (
            <>
              <div className={`h-[1px] bg-slate-800/60 my-2 mx-1 ${movilAbierto ? "hidden" : "group-hover:hidden"}`} />
              <p className={`text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mt-4 mb-2 transition-all duration-300 ${movilAbierto ? "block" : "hidden group-hover:block"}`}>FLOTA</p>
              {esPermitido("flota") && (
                <SidebarItem
                  icono={PackageSearch}
                  etiqueta="Gestión Flota"
                  activo={vistaActiva === "flota"}
                  onClick={() => onCambiarVista("flota")}
                  expanded={movilAbierto}
                />
              )}
              {esPermitido("vehiculos") && (
                <SidebarItem
                  icono={Truck}
                  etiqueta="Vehículos"
                  activo={vistaActiva === "vehiculos"}
                  onClick={() => onCambiarVista("vehiculos")}
                  expanded={movilAbierto}
                />
              )}
              {esPermitido("conductores") && (
                <SidebarItem
                  icono={Users}
                  etiqueta="Conductores"
                  activo={vistaActiva === "conductores"}
                  onClick={() => onCambiarVista("conductores")}
                  expanded={movilAbierto}
                />
              )}
              {esPermitido("documentos") && (
                <SidebarItem
                  icono={FileText}
                  etiqueta="Documentos"
                  activo={vistaActiva === "documentos"}
                  onClick={() => onCambiarVista("documentos")}
                  expanded={movilAbierto}
                />
              )}
            </>
          )}

          {/* MANTENIMIENTO */}
          {tieneMantenimiento && (
            <>
              <div className={`h-[1px] bg-slate-800/60 my-2 mx-1 ${movilAbierto ? "hidden" : "group-hover:hidden"}`} />
              <p className={`text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mt-4 mb-2 transition-all duration-300 ${movilAbierto ? "block" : "hidden group-hover:block"}`}>MANTENIMIENTO</p>
              {esPermitido("mantenimiento") && (
                <SidebarItem
                  icono={Wrench}
                  etiqueta="Mantenimiento"
                  activo={vistaActiva === "mantenimiento"}
                  onClick={() => onCambiarVista("mantenimiento")}
                  expanded={movilAbierto}
                />
              )}
              {esPermitido("inventario") && (
                <SidebarItem
                  icono={Package}
                  etiqueta="Inventario"
                  activo={vistaActiva === "inventario"}
                  onClick={() => onCambiarVista("inventario")}
                  expanded={movilAbierto}
                />
              )}
            </>
          )}

          {/* FINANZAS */}
          {tieneFinanzas && (
            <>
              <div className={`h-[1px] bg-slate-800/60 my-2 mx-1 ${movilAbierto ? "hidden" : "group-hover:hidden"}`} />
              <p className={`text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mt-4 mb-2 transition-all duration-300 ${movilAbierto ? "block" : "hidden group-hover:block"}`}>FINANZAS</p>
              {esPermitido("viaticos") && (
                <SidebarItem
                  icono={DollarSign}
                  etiqueta="Viáticos"
                  activo={vistaActiva === "viaticos"}
                  onClick={() => onCambiarVista("viaticos")}
                  expanded={movilAbierto}
                />
              )}
              {esPermitido("combustible") && (
                <SidebarItem
                  icono={Truck}
                  etiqueta="Combustible"
                  activo={vistaActiva === "combustible"}
                  onClick={() => onCambiarVista("combustible")}
                  expanded={movilAbierto}
                />
              )}
              {esPermitido("compras") && (
                <SidebarItem
                  icono={ShoppingCart}
                  etiqueta="Compras"
                  activo={vistaActiva === "compras"}
                  onClick={() => onCambiarVista("compras")}
                  expanded={movilAbierto}
                />
              )}
            </>
          )}

          {/* REPORTES */}
          {tieneReportes && (
            <>
              <div className={`h-[1px] bg-slate-800/60 my-2 mx-1 ${movilAbierto ? "hidden" : "group-hover:hidden"}`} />
              <p className={`text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mt-4 mb-2 transition-all duration-300 ${movilAbierto ? "block" : "hidden group-hover:block"}`}>REPORTES</p>
              {esPermitido("reportes") && (
                <SidebarItem
                  icono={BarChart3}
                  etiqueta="Reportes"
                  activo={vistaActiva === "reportes"}
                  onClick={() => onCambiarVista("reportes")}
                  expanded={movilAbierto}
                />
              )}
            </>
          )}

          {/* ADMINISTRACIÓN */}
          {tieneAdministracion && (
            <>
              <div className={`h-[1px] bg-slate-800/60 my-2 mx-1 ${movilAbierto ? "hidden" : "group-hover:hidden"}`} />
              <p className={`text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mt-4 mb-2 transition-all duration-300 ${movilAbierto ? "block" : "hidden group-hover:block"}`}>ADMINISTRACIÓN</p>
              {esPermitido("clientes") && (
                <SidebarItem
                  icono={Phone}
                  etiqueta="Clientes"
                  activo={vistaActiva === "clientes"}
                  onClick={() => onCambiarVista("clientes")}
                  expanded={movilAbierto}
                />
              )}
              {esPermitido("evaluacion") && (
                <SidebarItem
                  icono={Award}
                  etiqueta="Evaluación"
                  activo={vistaActiva === "evaluacion"}
                  onClick={() => onCambiarVista("evaluacion")}
                  expanded={movilAbierto}
                />
              )}
              {esPermitido("auditoria") && (
                <SidebarItem
                  icono={Lock}
                  etiqueta="Auditoría"
                  activo={vistaActiva === "auditoria"}
                  onClick={() => onCambiarVista("auditoria")}
                  expanded={movilAbierto}
                />
              )}
              {esPermitido("equipos") && (
                <SidebarItem
                  icono={UserPlus}
                  etiqueta="Equipos"
                  activo={vistaActiva === "equipos"}
                  onClick={() => onCambiarVista("equipos")}
                  expanded={movilAbierto}
                />
              )}
            </>
          )}
        </nav>

        {/* Sidebar Footer with system status and user profile */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 p-3 mt-auto space-y-3">
          {/* Status Indicators */}
          <div className="space-y-1.5 px-2">
            <div className="flex items-center justify-center lg:group-hover:justify-start">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className={`text-[10px] font-medium text-slate-400 transition-all duration-300 overflow-hidden whitespace-nowrap ${
                movilAbierto
                  ? "opacity-100 w-auto ml-2"
                  : "w-0 opacity-0 lg:group-hover:w-auto lg:group-hover:opacity-100 lg:group-hover:ml-2"
              }`}>
                Sistema Operativo
              </p>
            </div>
            <div className="flex items-center justify-center lg:group-hover:justify-start">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <p className={`text-[10px] font-medium text-slate-400 transition-all duration-300 overflow-hidden whitespace-nowrap ${
                movilAbierto
                  ? "opacity-100 w-auto ml-2"
                  : "w-0 opacity-0 lg:group-hover:w-auto lg:group-hover:opacity-100 lg:group-hover:ml-2"
              }`}>
                GPS Conectado
              </p>
            </div>
            <div className="flex items-center justify-center lg:group-hover:justify-start">
              <ShieldCheck size={8} className="text-blue-500 shrink-0" />
              <p className={`text-[9px] font-medium text-slate-500 transition-all duration-300 overflow-hidden whitespace-nowrap ${
                movilAbierto
                  ? "opacity-100 w-auto ml-2"
                  : "w-0 opacity-0 lg:group-hover:w-auto lg:group-hover:opacity-100 lg:group-hover:ml-2"
              }`}>
                Sincronizado: 100%
              </p>
            </div>
          </div>

          {/* Profile Card */}
          {usuario && (
            <div className="flex items-center justify-center lg:group-hover:justify-start border-t border-slate-800/80 pt-2 px-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/35 text-xs font-semibold text-blue-300 border border-blue-500/20" title={usuario.nombre}>
                {getInitials(usuario.nombre)}
              </div>
              <div className={`transition-all duration-300 overflow-hidden ${
                movilAbierto
                  ? "opacity-100 w-auto ml-2"
                  : "w-0 opacity-0 lg:group-hover:w-auto lg:group-hover:opacity-100 lg:group-hover:ml-2"
              }`}>
                <p className="truncate text-xs font-semibold text-slate-200">{usuario.nombre}</p>
                <p className="truncate text-[9px] text-slate-500 uppercase tracking-wider font-bold">{usuario.rol}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
