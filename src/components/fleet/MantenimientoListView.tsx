import { useState } from "react";
import { Plus, Wrench, AlertTriangle } from "lucide-react";

interface PlanMantenimiento {
  id: string;
  vehiculoPlaca: string;
  tipo: "PREVENTIVO" | "CORRECTIVO";
  descripcion: string;
  fechaProgramada: string;
  estado: "PENDIENTE" | "EN_PROCESO" | "COMPLETADO" | "VENCIDO";
  prioridad: "BAJA" | "MEDIA" | "ALTA" | "CRÍTICA";
}

export function MantenimientoListView({}: any) {
  const [planes] = useState<PlanMantenimiento[]>([
    {
      id: "1",
      vehiculoPlaca: "ABC123",
      tipo: "PREVENTIVO",
      descripcion: "Cambio de aceite y filtros",
      fechaProgramada: "2026-05-20",
      estado: "PENDIENTE",
      prioridad: "MEDIA"
    },
    {
      id: "2",
      vehiculoPlaca: "XYZ789",
      tipo: "CORRECTIVO",
      descripcion: "Reparación de frenos",
      fechaProgramada: "2026-05-15",
      estado: "EN_PROCESO",
      prioridad: "CRÍTICA"
    }
  ]);

  const tipoColors: Record<string, string> = {
    PREVENTIVO: "bg-blue-100 text-blue-800",
    CORRECTIVO: "bg-red-100 text-red-800"
  };

  const prioridadColors: Record<string, string> = {
    BAJA: "bg-green-100 text-green-800",
    MEDIA: "bg-yellow-100 text-yellow-800",
    ALTA: "bg-orange-100 text-orange-800",
    CRÍTICA: "bg-red-100 text-red-800"
  };

  const estadoColors: Record<string, string> = {
    PENDIENTE: "bg-slate-100 text-slate-800",
    EN_PROCESO: "bg-blue-100 text-blue-800",
    COMPLETADO: "bg-green-100 text-green-800",
    VENCIDO: "bg-red-100 text-red-800"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Mantenimiento</h2>
          <p className="text-sm text-slate-600">Planifica y controla el mantenimiento de tu flota</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Nuevo Plan
        </button>
      </div>

      {planes.some(p => p.prioridad === "CRÍTICA") && (
        <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">Mantenimiento Crítico Pendiente</p>
              <p className="text-sm text-red-700">Hay {planes.filter(p => p.prioridad === "CRÍTICA" && p.estado !== "COMPLETADO").length} planes con prioridad crítica</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-900">Vehículo</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Tipo</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Descripción</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Fecha Programada</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Prioridad</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Estado</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {planes.map((plan) => (
              <tr key={plan.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-900">{plan.vehiculoPlaca}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${tipoColors[plan.tipo]}`}>
                    <Wrench className="h-3 w-3" />
                    {plan.tipo}
                  </span>
                </td>
                <td className="px-6 py-3 text-slate-600">{plan.descripcion}</td>
                <td className="px-6 py-3 text-slate-600">{new Date(plan.fechaProgramada).toLocaleDateString("es-CO")}</td>
                <td className="px-6 py-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${prioridadColors[plan.prioridad]}`}>
                    {plan.prioridad}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${estadoColors[plan.estado]}`}>
                    {plan.estado}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
