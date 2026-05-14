import { useState } from "react";
import { Plus, MapPin, Trash2, Edit2 } from "lucide-react";

interface Orden {
  id: string;
  codigo: string;
  origen: string;
  destino: string;
  pesoCarga: number;
  cliente: string;
  estado: "PENDIENTE" | "DESPACHADO" | "EN_RUTA" | "ENTREGADO";
  fecha: string;
}

export function OrdenesListView({ ordenes }: any) {
  const [ordenesList] = useState<Orden[]>(
    ordenes?.map((o: any) => ({
      id: o.id,
      codigo: o.codigo,
      origen: o.origen,
      destino: o.destino,
      pesoCarga: o.pesoCarga,
      cliente: o.cliente?.nombre || "N/A",
      estado: o.estado,
      fecha: o.createdAt || new Date().toISOString()
    })) || []
  );

  const estadoColors: Record<string, string> = {
    PENDIENTE: "bg-slate-100 text-slate-800",
    DESPACHADO: "bg-blue-100 text-blue-800",
    EN_RUTA: "bg-yellow-100 text-yellow-800",
    ENTREGADO: "bg-green-100 text-green-800"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Órdenes</h2>
          <p className="text-sm text-slate-600">Crea y controla órdenes de despacho</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Nueva Orden
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Total Órdenes</p>
          <p className="text-2xl font-bold text-slate-900">{ordenesList.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Pendientes</p>
          <p className="text-2xl font-bold text-slate-600">{ordenesList.filter(o => o.estado === "PENDIENTE").length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">En Ruta</p>
          <p className="text-2xl font-bold text-yellow-600">{ordenesList.filter(o => o.estado === "EN_RUTA").length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Entregadas</p>
          <p className="text-2xl font-bold text-green-600">{ordenesList.filter(o => o.estado === "ENTREGADO").length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-900">Código</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Cliente</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Ruta</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Peso (kg)</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Estado</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Fecha</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {ordenesList.length > 0 ? (
              ordenesList.map((orden) => (
                <tr key={orden.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">{orden.codigo}</td>
                  <td className="px-6 py-3 text-slate-600">{orden.cliente}</td>
                  <td className="px-6 py-3 text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {orden.origen} → {orden.destino}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{orden.pesoCarga}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${estadoColors[orden.estado]}`}>
                      {orden.estado}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{new Date(orden.fecha).toLocaleDateString("es-CO")}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-700">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  No hay órdenes registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
