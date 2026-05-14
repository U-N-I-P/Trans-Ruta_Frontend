import { useState } from "react";

export function IncidentesListView({ ordenes }: any) {
  const [filtro, setFiltro] = useState("");

  const incidentes = ordenes.filter((o: any) => o.codigo.includes(filtro)).map((o: any) => ({
    id: o.id,
    orden: o.codigo,
    ruta: `${o.origen} → ${o.destino}`,
    estado: o.estado,
    tipo: Math.random() > 0.7 ? "FALLA_MECANICA" : Math.random() > 0.5 ? "RETRASO" : "OTRO"
  }));

  const tiposIncidente: Record<string, { label: string; color: string }> = {
    FALLA_MECANICA: { label: "Falla Mecánica", color: "bg-red-100 text-red-800" },
    RETRASO: { label: "Retraso", color: "bg-yellow-100 text-yellow-800" },
    OTRO: { label: "Otro", color: "bg-blue-100 text-blue-800" }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Gestión de Incidentes</h2>
        <p className="text-sm text-slate-600">Reporta y gestiona incidentes en ruta</p>
      </div>

      <div>
        <input
          type="text"
          placeholder="Buscar por código de orden..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-2"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-900">Orden</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Ruta</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Tipo</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {incidentes.length > 0 ? (
              incidentes.map((inc: any) => (
                <tr key={inc.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">{inc.orden}</td>
                  <td className="px-6 py-3 text-slate-600">{inc.ruta}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${tiposIncidente[inc.tipo].color}`}>
                      {tiposIncidente[inc.tipo].label}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{inc.estado}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No hay incidentes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
