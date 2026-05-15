import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  titulo: string;
  valor: number;
  icono: LucideIcon;
  tono: "azul" | "ambar" | "verde" | "rojo";
}

const estilosTono = {
  azul: "bg-blue-50 text-blue-700",
  ambar: "bg-amber-50 text-amber-700",
  verde: "bg-emerald-50 text-emerald-700",
  rojo: "bg-red-50 text-red-700"
};

export function KpiCard({ titulo, valor, icono: Icono, tono }: KpiCardProps) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm hover:shadow-md transition-shadow duration-300 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{titulo}</p>
        <span className={`rounded-lg p-2 ${estilosTono[tono]}`}>
          <Icono size={16} />
        </span>
      </div>
      <p className="font-['Sora'] text-2xl font-bold text-slate-900">{valor}</p>
    </article>
  );
}
