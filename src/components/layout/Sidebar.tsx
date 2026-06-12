import { useEffect, useState } from "react";
import { ClipboardList, PackageSearch, Truck, Users, FileText, AlertCircle, DollarSign, BarChart3, Lock, Zap, Wrench, CheckCircle, Award, MapPin, ShoppingCart, Clock, Package, Phone, ShieldCheck } from "lucide-react";
import { SidebarItem } from "./SidebarItem";

export type VistaPrincipal = "panel" | "flota" | "vehiculos" | "conductores" | "documentos" | "mantenimiento" | "entregas" | "ordenes" | "incidentes" | "viaticos" | "combustible" | "asignacion" | "evaluacion" | "compras" | "gps" | "manifiestos" | "operativo" | "inventario" | "clientes" | "reportes" | "auditoria";

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

export function Sidebar({
  movilAbierto,
  vistaActiva,
  onCerrarMovil,
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
          <div className="flex items-center gap-3 w-full">
            <div className="bg-blue-600 rounded-lg p-2 shrink-0 shadow-lg shadow-blue-500/20">
              <Truck size={24} className="text-white" />
            </div>
            <div className="flex-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100 overflow-hidden whitespace-nowrap">
              <p className="font-['Sora'] text-lg font-bold tracking-wide">Trans-Ruta</p>
              <p className="text-[10px] text-blue-300 font-medium uppercase tracking-wider">Centro de Control</p>
            </div>
          </div>
        </div>

        {/* Navigation Modules */}
        <nav className="flex-1 space-y-1.5 px-3 pb-6">
          {/* OPERACIÓN */}
          <div className="h-[1px] bg-slate-800/60 my-2 mx-1 group-hover:hidden" />
          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mt-4 mb-2 hidden group-hover:block transition-all duration-300">OPERACIÓN</p>
          <SidebarItem
            icono={ClipboardList}
            etiqueta="Panel de Control"
            activo={vistaActiva === "panel"}
            onClick={() => onCambiarVista("panel")}
          />
          <SidebarItem
            icono={MapPin}
            etiqueta="GPS Rastreo"
            activo={vistaActiva === "gps"}
            onClick={() => onCambiarVista("gps")}
          />
          <SidebarItem
            icono={Zap}
            etiqueta="Asignación"
            activo={vistaActiva === "asignacion"}
            onClick={() => onCambiarVista("asignacion")}
          />
          <SidebarItem
            icono={Clock}
            etiqueta="Control Operativo"
            activo={vistaActiva === "operativo"}
            onClick={() => onCambiarVista("operativo")}
          />
          <SidebarItem
            icono={CheckCircle}
            etiqueta="Entregas"
            activo={vistaActiva === "entregas"}
            onClick={() => onCambiarVista("entregas")}
          />
          <SidebarItem
            icono={AlertCircle}
            etiqueta="Incidentes"
            activo={vistaActiva === "incidentes"}
            onClick={() => onCambiarVista("incidentes")}
          />
          <SidebarItem
            icono={FileText}
            etiqueta="Manifiestos"
            activo={vistaActiva === "manifiestos"}
            onClick={() => onCambiarVista("manifiestos")}
          />

          {/* FLOTA */}
          <div className="h-[1px] bg-slate-800/60 my-2 mx-1 group-hover:hidden" />
          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mt-4 mb-2 hidden group-hover:block transition-all duration-300">FLOTA</p>
          <SidebarItem
            icono={PackageSearch}
            etiqueta="Gestión Flota"
            activo={vistaActiva === "flota"}
            onClick={() => onCambiarVista("flota")}
          />
          <SidebarItem
            icono={Truck}
            etiqueta="Vehículos"
            activo={vistaActiva === "vehiculos"}
            onClick={() => onCambiarVista("vehiculos")}
          />
          <SidebarItem
            icono={Users}
            etiqueta="Conductores"
            activo={vistaActiva === "conductores"}
            onClick={() => onCambiarVista("conductores")}
          />
          <SidebarItem
            icono={FileText}
            etiqueta="Documentos"
            activo={vistaActiva === "documentos"}
            onClick={() => onCambiarVista("documentos")}
          />

          {/* MANTENIMIENTO */}
          <div className="h-[1px] bg-slate-800/60 my-2 mx-1 group-hover:hidden" />
          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mt-4 mb-2 hidden group-hover:block transition-all duration-300">MANTENIMIENTO</p>
          <SidebarItem
            icono={Wrench}
            etiqueta="Mantenimiento"
            activo={vistaActiva === "mantenimiento"}
            onClick={() => onCambiarVista("mantenimiento")}
          />
          <SidebarItem
            icono={Package}
            etiqueta="Inventario"
            activo={vistaActiva === "inventario"}
            onClick={() => onCambiarVista("inventario")}
          />

          {/* FINANZAS */}
          <div className="h-[1px] bg-slate-800/60 my-2 mx-1 group-hover:hidden" />
          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mt-4 mb-2 hidden group-hover:block transition-all duration-300">FINANZAS</p>
          <SidebarItem
            icono={DollarSign}
            etiqueta="Viáticos"
            activo={vistaActiva === "viaticos"}
            onClick={() => onCambiarVista("viaticos")}
          />
          <SidebarItem
            icono={Truck}
            etiqueta="Combustible"
            activo={vistaActiva === "combustible"}
            onClick={() => onCambiarVista("combustible")}
          />
          <SidebarItem
            icono={ShoppingCart}
            etiqueta="Compras"
            activo={vistaActiva === "compras"}
            onClick={() => onCambiarVista("compras")}
          />

          {/* REPORTES */}
          <div className="h-[1px] bg-slate-800/60 my-2 mx-1 group-hover:hidden" />
          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mt-4 mb-2 hidden group-hover:block transition-all duration-300">REPORTES</p>
          <SidebarItem
            icono={BarChart3}
            etiqueta="Reportes"
            activo={vistaActiva === "reportes"}
            onClick={() => onCambiarVista("reportes")}
          />

          {/* ADMINISTRACIÓN */}
          <div className="h-[1px] bg-slate-800/60 my-2 mx-1 group-hover:hidden" />
          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mt-4 mb-2 hidden group-hover:block transition-all duration-300">ADMINISTRACIÓN</p>
          <SidebarItem
            icono={Phone}
            etiqueta="Clientes"
            activo={vistaActiva === "clientes"}
            onClick={() => onCambiarVista("clientes")}
          />
          <SidebarItem
            icono={Award}
            etiqueta="Evaluación"
            activo={vistaActiva === "evaluacion"}
            onClick={() => onCambiarVista("evaluacion")}
          />
          <SidebarItem
            icono={Lock}
            etiqueta="Auditoría"
            activo={vistaActiva === "auditoria"}
            onClick={() => onCambiarVista("auditoria")}
          />
        </nav>

        {/* Sidebar Footer with system status and user profile */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 p-3 mt-auto space-y-3">
          {/* Status Indicators */}
          <div className="space-y-1.5 px-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] font-medium text-slate-400 group-hover:block hidden transition-opacity duration-300">
                Sistema Operativo
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <p className="text-[10px] font-medium text-slate-400 group-hover:block hidden transition-opacity duration-300">
                GPS Conectado
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={8} className="text-blue-500" />
              <p className="text-[9px] font-medium text-slate-500 group-hover:block hidden transition-opacity duration-300">
                Sincronizado: 100%
              </p>
            </div>
          </div>

          {/* Profile Card */}
          {usuario && (
            <div className="flex items-center gap-2 border-t border-slate-800/80 pt-2 px-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/35 text-xs font-semibold text-blue-300 border border-blue-500/20" title={usuario.nombre}>
                {getInitials(usuario.nombre)}
              </div>
              <div className="flex-1 overflow-hidden group-hover:block hidden">
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
