import { EstadoOrden } from "../../types/domain";

interface BadgeProps {
  estado: EstadoOrden;
}

const estilosPorEstado: Record<EstadoOrden, string> = {
  Despachado: "bg-blue-100 text-blue-800 border-blue-200",
  "En Ruta": "bg-amber-100 text-amber-800 border-amber-200",
  Entregado: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Incidente: "bg-red-100 text-red-800 border-red-200"
};

export function Badge({ estado }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${estilosPorEstado[estado]}`}
    >
      {estado}
    </span>
  );
}
