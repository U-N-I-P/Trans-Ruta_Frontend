import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  titulo: string;
  valor: number;
  icono: LucideIcon;
  tono: "azul" | "ambar" | "verde" | "rojo";
}

const estilosTono = {
  azul: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100 dark:border-blue-500/10",
  ambar: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-500/10",
  verde: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/10",
  rojo: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-500/10"
};

export function KpiCard({ titulo, valor, icono: Icono, tono }: KpiCardProps) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-800/80">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{titulo}</p>
        <span className={`rounded-lg p-2 ${estilosTono[tono]}`}>
          <Icono size={16} />
        </span>
      </div>
      <p className="font-['Sora'] text-2xl font-bold text-slate-900 dark:text-slate-100">{valor}</p>
    </article>
  );
}
