import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icono: LucideIcon;
  etiqueta: string;
  activo?: boolean;
  colapsado?: boolean;
  onClick: () => void;
}

export function SidebarItem({ icono: Icono, etiqueta, activo, colapsado, onClick }: SidebarItemProps) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        activo
          ? "bg-white/15 text-white"
          : "text-blue-100 hover:bg-white/10 hover:text-white"
      }`}
      onClick={onClick}
      type="button"
      title={etiqueta}
    >
      <Icono size={18} />
      {!colapsado && <span>{etiqueta}</span>}
    </button>
  );
}
