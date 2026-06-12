import { EstadoOrden } from "../../types/domain";

interface BadgeProps {
  estado: EstadoOrden;
}

const estilosPorEstado: Record<EstadoOrden, string> = {
  DESPACHADO: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  EN_RUTA: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  CERCA_DEL_DESTINO: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  ENTREGADO: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  CANCELADO: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"
};

const etiquetasPorEstado: Record<EstadoOrden, string> = {
  DESPACHADO: "Despachado",
  EN_RUTA: "En ruta",
  CERCA_DEL_DESTINO: "Cerca del destino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado"
};

export function Badge({ estado }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-sm ${estilosPorEstado[estado]}`}
    >
      {etiquetasPorEstado[estado]}
    </span>
  );
}
