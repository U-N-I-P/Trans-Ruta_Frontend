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
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {columnas.map((columna) => (
              <th key={columna.id} className="px-4 py-3 font-semibold" style={{ minWidth: columna.anchoMinimo }}>
                {columna.encabezado}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {datos.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-center text-slate-500" colSpan={columnas.length}>
                {estadoVacio}
              </td>
            </tr>
          )}
          {datos.map((fila) => (
            <tr key={claveFila(fila)} className="transition hover:bg-slate-50/80">
              {columnas.map((columna) => (
                <td key={columna.id} className="px-4 py-3 text-slate-700">
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
