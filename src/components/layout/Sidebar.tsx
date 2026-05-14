import { ClipboardList, PackageSearch, Truck, X, Users, FileText, AlertCircle, DollarSign, BarChart3, Lock, Zap, Wrench, CheckCircle, Award, MapPin, ShoppingCart, Clock, Package, Phone } from "lucide-react";
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
  colapsado,
  movilAbierto,
  vistaActiva,
  onCerrarMovil,
  onAlternarColapsado,
  onCambiarVista
}: SidebarProps) {
  return (
    <>
      {movilAbierto && <div className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={onCerrarMovil} />}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-logistics-900 to-logistics-800 p-4 text-white shadow-panel transition-all duration-300 ${
          colapsado ? "w-[88px]" : "w-72"
        } ${movilAbierto ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="mb-8 flex items-center justify-between">
          {!colapsado && (
            <div>
              <p className="font-['Sora'] text-lg font-bold">Trans-Ruta</p>
              <p className="text-xs text-blue-100">Centro de Control</p>
            </div>
          )}
          <button
            type="button"
            className="rounded-lg p-2 text-blue-100 hover:bg-white/10"
            onClick={onAlternarColapsado}
            aria-label="Alternar barra lateral"
          >
            {colapsado ? <Truck size={18} /> : <X size={18} />}
          </button>
        </div>

        <nav className="space-y-2">
          <SidebarItem
            icono={ClipboardList}
            etiqueta="Panel de Control"
            activo={vistaActiva === "panel"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("panel")}
          />
          <SidebarItem
            icono={Truck}
            etiqueta="Vehículos"
            activo={vistaActiva === "vehiculos"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("vehiculos")}
          />
          <SidebarItem
            icono={Users}
            etiqueta="Conductores"
            activo={vistaActiva === "conductores"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("conductores")}
          />
          <SidebarItem
            icono={FileText}
            etiqueta="Documentos"
            activo={vistaActiva === "documentos"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("documentos")}
          />
          <SidebarItem
            icono={ClipboardList}
            etiqueta="Órdenes"
            activo={vistaActiva === "ordenes"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("ordenes")}
          />
          <SidebarItem
            icono={Wrench}
            etiqueta="Mantenimiento"
            activo={vistaActiva === "mantenimiento"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("mantenimiento")}
          />
          <SidebarItem
            icono={CheckCircle}
            etiqueta="Entregas"
            activo={vistaActiva === "entregas"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("entregas")}
          />
          <SidebarItem
            icono={AlertCircle}
            etiqueta="Incidentes"
            activo={vistaActiva === "incidentes"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("incidentes")}
          />
          <SidebarItem
            icono={DollarSign}
            etiqueta="Viáticos"
            activo={vistaActiva === "viaticos"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("viaticos")}
          />
          <SidebarItem
            icono={Truck}
            etiqueta="Combustible"
            activo={vistaActiva === "combustible"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("combustible")}
          />
          <SidebarItem
            icono={Zap}
            etiqueta="Asignación"
            activo={vistaActiva === "asignacion"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("asignacion")}
          />
          <SidebarItem
            icono={ShoppingCart}
            etiqueta="Compras"
            activo={vistaActiva === "compras"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("compras")}
          />
          <SidebarItem
            icono={MapPin}
            etiqueta="GPS"
            activo={vistaActiva === "gps"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("gps")}
          />
          <SidebarItem
            icono={FileText}
            etiqueta="Manifiestos"
            activo={vistaActiva === "manifiestos"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("manifiestos")}
          />
          <SidebarItem
            icono={Clock}
            etiqueta="Control Operativo"
            activo={vistaActiva === "operativo"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("operativo")}
          />
          <SidebarItem
            icono={Package}
            etiqueta="Inventario"
            activo={vistaActiva === "inventario"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("inventario")}
          />
          <SidebarItem
            icono={Phone}
            etiqueta="Clientes"
            activo={vistaActiva === "clientes"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("clientes")}
          />
          <SidebarItem
            icono={Award}
            etiqueta="Evaluación"
            activo={vistaActiva === "evaluacion"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("evaluacion")}
          />
          <SidebarItem
            icono={BarChart3}
            etiqueta="Reportes"
            activo={vistaActiva === "reportes"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("reportes")}
          />
          <SidebarItem
            icono={Lock}
            etiqueta="Auditoría"
            activo={vistaActiva === "auditoria"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("auditoria")}
          />
          <SidebarItem
            icono={PackageSearch}
            etiqueta="Inventario"
            activo={vistaActiva === "flota"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("flota")}
          />
        </nav>
      </aside>
    </>
  );
}
