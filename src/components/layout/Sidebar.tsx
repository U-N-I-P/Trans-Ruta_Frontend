import { ClipboardList, PackageSearch, Truck, X } from "lucide-react";
import { SidebarItem } from "./SidebarItem";

export type VistaPrincipal = "panel" | "flota";

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
            etiqueta="Mision de Control"
            activo={vistaActiva === "panel"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("panel")}
          />
          <SidebarItem
            icono={PackageSearch}
            etiqueta="Flota e Inventario"
            activo={vistaActiva === "flota"}
            colapsado={colapsado}
            onClick={() => onCambiarVista("flota")}
          />
        </nav>
      </aside>
    </>
  );
}
