import { ReactNode } from "react";

export interface ColumnaTabla<T> {
  id: string;
  encabezado: string;
  celda: (fila: T) => ReactNode;
  anchoMinimo?: string;
}

interface TableProps<T> {
  columnas: ColumnaTabla<T>[];
  datos: T[];
  claveFila: (fila: T) => string;
  estadoVacio: string;
}

export function Table<T>({ columnas, datos, claveFila, estadoVacio }: TableProps<T>) {
  return (
    <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-slate-100/80 bg-white/50 backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-800/80">
      <table className="min-w-full text-left text-xs sm:text-sm">
        <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900/60 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
          <tr>
            {columnas.map((columna) => (
              <th key={columna.id} className="px-4 py-3 font-semibold" style={{ minWidth: columna.anchoMinimo }}>
                {columna.encabezado}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {datos.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-center text-slate-500 dark:text-slate-400" colSpan={columnas.length}>
                {estadoVacio}
              </td>
            </tr>
          )}
          {datos.map((fila) => (
            <tr key={claveFila(fila)} className="transition-colors duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
              {columnas.map((columna) => (
                <td key={columna.id} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  {columna.celda(fila)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
