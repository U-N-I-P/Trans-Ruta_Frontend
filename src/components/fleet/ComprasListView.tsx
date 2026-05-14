import { useState } from "react";
import { Plus, CheckCircle, XCircle, Clock } from "lucide-react";

interface SolicitudCompra {
  id: string;
  codigo: string;
  concepto: string;
  cantidad: number;
  costo: number;
  solicitadoPor: string;
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA" | "RECIBIDA";
  fecha: string;
}

export function ComprasListView() {
  const [solicitudes] = useState<SolicitudCompra[]>([
    {
      id: "1",
      codigo: "SOL-001",
      concepto: "Repuesto de Motor",
      cantidad: 2,
      costo: 850000,
      solicitadoPor: "Jefe de Mantenimiento",
      estado: "PENDIENTE",
      fecha: "2026-05-10"
    },
    {
      id: "2",
      codigo: "SOL-002",
      concepto: "Aceite lubricante 10W30",
      cantidad: 10,
      costo: 125000,
      solicitadoPor: "Conductor",
      estado: "APROBADA",
      fecha: "2026-05-08"
    },
    {
      id: "3",
      codigo: "SOL-003",
      concepto: "Batería Automotriz",
      cantidad: 1,
      costo: 450000,
      solicitadoPor: "Jefe de Mantenimiento",
      estado: "RECIBIDA",
      fecha: "2026-05-05"
    }
  ]);

  const estadoColors: Record<string, { color: string; icono: any }> = {
    PENDIENTE: { color: "bg-yellow-100 text-yellow-800", icono: Clock },
    APROBADA: { color: "bg-blue-100 text-blue-800", icono: CheckCircle },
    RECHAZADA: { color: "bg-red-100 text-red-800", icono: XCircle },
    RECIBIDA: { color: "bg-green-100 text-green-800", icono: CheckCircle }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Solicitudes de Compra</h2>
          <p className="text-sm text-slate-600">Aprueba o rechaza solicitudes de repuestos</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Nueva Solicitud
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">{solicitudes.filter(s => s.estado === "PENDIENTE").length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Aprobadas</p>
          <p className="text-2xl font-bold text-blue-600">{solicitudes.filter(s => s.estado === "APROBADA").length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Recibidas</p>
          <p className="text-2xl font-bold text-green-600">{solicitudes.filter(s => s.estado === "RECIBIDA").length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Inversión Total</p>
          <p className="text-2xl font-bold text-slate-900">
            ${solicitudes.reduce((acc, s) => acc + s.costo, 0).toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-900">Código</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Concepto</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Cantidad</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Costo</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Solicitado Por</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Estado</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {solicitudes.map((sol) => {
              const { color, icono: Icon } = estadoColors[sol.estado];
              return (
                <tr key={sol.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">{sol.codigo}</td>
                  <td className="px-6 py-3 text-slate-600">{sol.concepto}</td>
                  <td className="px-6 py-3 text-slate-600">{sol.cantidad}</td>
                  <td className="px-6 py-3 font-semibold text-slate-900">
                    ${sol.costo.toLocaleString("es-CO")}
                  </td>
                  <td className="px-6 py-3 text-slate-600">{sol.solicitadoPor}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${color}`}>
                      <Icon className="h-3 w-3" />
                      {sol.estado}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {sol.estado === "PENDIENTE" ? (
                      <div className="flex gap-2">
                        <button className="text-green-600 hover:text-green-700 text-xs font-medium">Aprobar</button>
                        <button className="text-red-600 hover:text-red-700 text-xs font-medium">Rechazar</button>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
