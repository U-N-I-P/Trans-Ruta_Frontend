import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icono: LucideIcon;
  etiqueta: string;
  activo?: boolean;
  onClick: () => void;
  expanded?: boolean;
}

export function SidebarItem({ icono: Icono, etiqueta, activo, onClick, expanded }: SidebarItemProps) {
  return (
    <button
      className={`group/item relative flex w-full items-center gap-4 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-300 overflow-hidden ${
        activo
          ? "bg-blue-600/20 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.15)]"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
      }`}
      onClick={onClick}
      type="button"
      title={etiqueta}
    >
      {/* Indicador activo vertical brillante */}
      {activo && (
        <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
      )}
      
      <div className={`shrink-0 transition-transform duration-300 ${activo ? "scale-110" : "group-hover/item:scale-110"}`}>
        <Icono size={20} strokeWidth={activo ? 2.5 : 2} />
      </div>
      
      <span className={`transition-opacity duration-300 whitespace-nowrap tracking-wide ${expanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
        {etiqueta}
      </span>
    </button>
  );
}
