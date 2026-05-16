import { ClipboardList, PackageSearch, Truck, Users, FileText, AlertCircle, DollarSign, BarChart3, Lock, Zap, Wrench, CheckCircle, Award, MapPin, ShoppingCart, Clock, Package, Phone } from "lucide-react";
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

export function Sidebar({
  movilAbierto,
  vistaActiva,
  onCerrarMovil,
  onCambiarVista
}: SidebarProps) {
  return (
    <>
      {movilAbierto && <div className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={onCerrarMovil} />}
      <aside
        className={`group fixed left-0 top-0 z-40 m-4 h-[calc(100vh-2rem)] flex flex-col rounded-2xl bg-slate-900/75 backdrop-blur-md border border-slate-800 text-white shadow-2xl transition-all duration-300 ease-in-out [&::-webkit-scrollbar]:hidden overflow-y-auto overflow-x-hidden ${
          movilAbierto ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 w-20 hover:w-64"
        }`}
      >
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

        <nav className="flex-1 space-y-1.5 px-3 pb-6">
          <SidebarItem
            icono={ClipboardList}
            etiqueta="Panel de Control"
            activo={vistaActiva === "panel"}
            onClick={() => onCambiarVista("panel")}
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
          <SidebarItem
            icono={ClipboardList}
            etiqueta="Órdenes"
            activo={vistaActiva === "ordenes"}
            onClick={() => onCambiarVista("ordenes")}
          />
          <SidebarItem
            icono={Wrench}
            etiqueta="Mantenimiento"
            activo={vistaActiva === "mantenimiento"}
            onClick={() => onCambiarVista("mantenimiento")}
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
            icono={Zap}
            etiqueta="Asignación"
            activo={vistaActiva === "asignacion"}
            onClick={() => onCambiarVista("asignacion")}
          />
          <SidebarItem
            icono={ShoppingCart}
            etiqueta="Compras"
            activo={vistaActiva === "compras"}
            onClick={() => onCambiarVista("compras")}
          />
          <SidebarItem
            icono={MapPin}
            etiqueta="GPS"
            activo={vistaActiva === "gps"}
            onClick={() => onCambiarVista("gps")}
          />
          <SidebarItem
            icono={FileText}
            etiqueta="Manifiestos"
            activo={vistaActiva === "manifiestos"}
            onClick={() => onCambiarVista("manifiestos")}
          />
          <SidebarItem
            icono={Clock}
            etiqueta="Control Operativo"
            activo={vistaActiva === "operativo"}
            onClick={() => onCambiarVista("operativo")}
          />
          <SidebarItem
            icono={Package}
            etiqueta="Inventario"
            activo={vistaActiva === "inventario"}
            onClick={() => onCambiarVista("inventario")}
          />
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
            icono={BarChart3}
            etiqueta="Reportes"
            activo={vistaActiva === "reportes"}
            onClick={() => onCambiarVista("reportes")}
          />
          <SidebarItem
            icono={Lock}
            etiqueta="Auditoría"
            activo={vistaActiva === "auditoria"}
            onClick={() => onCambiarVista("auditoria")}
          />
          <SidebarItem
            icono={PackageSearch}
            etiqueta="Gestión Flota"
            activo={vistaActiva === "flota"}
            onClick={() => onCambiarVista("flota")}
          />
        </nav>
      </aside>
    </>
  );
}
