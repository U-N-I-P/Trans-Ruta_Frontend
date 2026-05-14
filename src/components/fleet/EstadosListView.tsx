import { useState } from "react";

export function EstadosListView({ ordenes }: any) {
  const [filtro, setFiltro] = useState("");

  const ordenesFiltered = ordenes.filter(
    (o: any) => o.codigo.includes(filtro) || o.origen.includes(filtro) || o.destino.includes(filtro)
  );

  const estadoColors: Record<string, string> = {
    DESPACHADO: "bg-blue-100 text-blue-800",
    EN_RUTA: "bg-yellow-100 text-yellow-800",
    CERCA_DEL_DESTINO: "bg-orange-100 text-orange-800",
    ENTREGADO: "bg-green-100 text-green-800",
    CANCELADO: "bg-red-100 text-red-800"
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Seguimiento de Órdenes</h2>
        <p className="text-sm text-slate-600">Monitorea el estado de tus órdenes en tiempo real</p>
      </div>

      <div>
        <input
          type="text"
          placeholder="Buscar por código, origen o destino..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-2"
        />
      </div>

      <div className="grid gap-4">
        {ordenesFiltered.map((orden: any) => (
          <div key={orden.id} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Código Orden</p>
                <p className="font-semibold text-slate-900">{orden.codigo}</p>
              </div>
              <div className="flex items-end justify-between sm:flex-col sm:items-start">
                <div>
                  <p className="text-sm text-slate-500">Estado</p>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${estadoColors[orden.estado] || "bg-gray-100"}`}>
                    {orden.estado}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Ruta</p>
                <p className="text-slate-900">{orden.origen} → {orden.destino}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Peso Carga</p>
                <p className="font-semibold text-slate-900">{orden.pesoCarga} kg</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Conductor</p>
                <p className="text-slate-900">{orden.conductor?.nombre} {orden.conductor?.apellido}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Vehículo</p>
                <p className="text-slate-900">{orden.vehiculo?.placa}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
