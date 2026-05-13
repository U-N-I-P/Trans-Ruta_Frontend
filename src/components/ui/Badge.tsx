import { EstadoOrden } from "../../types/domain";

interface BadgeProps {
  estado: EstadoOrden;
}

const estilosPorEstado: Record<EstadoOrden, string> = {
  DESPACHADO: "bg-blue-100 text-blue-800 border-blue-200",
  EN_RUTA: "bg-amber-100 text-amber-800 border-amber-200",
  CERCA_DEL_DESTINO: "bg-sky-100 text-sky-800 border-sky-200",
  ENTREGADO: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELADO: "bg-red-100 text-red-800 border-red-200"
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
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${estilosPorEstado[estado]}`}
    >
      {etiquetasPorEstado[estado]}
    </span>
  );
}
