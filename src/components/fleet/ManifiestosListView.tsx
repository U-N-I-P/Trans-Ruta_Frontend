import { useState } from "react";
import { Plus, Download } from "lucide-react";

interface Manifiesto {
  id: string;
  numero: string;
  ordenes: number;
  peso: number;
  conductor: string;
  vehiculo: string;
  estado: "PENDIENTE" | "GENERADO" | "ENTREGADO";
  fecha: string;
}

export function ManifiestosListView({}: any) {
  const [manifiestos] = useState<Manifiesto[]>([
    {
      id: "1",
      numero: "MF-001",
      ordenes: 5,
      peso: 1250,
      conductor: "Juan Pérez",
      vehiculo: "ABC-123",
      estado: "ENTREGADO",
      fecha: "2026-05-10"
    },
    {
      id: "2",
      numero: "MF-002",
      ordenes: 3,
      peso: 850,
      conductor: "Carlos López",
      vehiculo: "XYZ-789",
      estado: "GENERADO",
      fecha: "2026-05-13"
    },
    {
      id: "3",
      numero: "MF-003",
      ordenes: 7,
      peso: 2100,
      conductor: "Ana García",
      vehiculo: "DEF-456",
      estado: "PENDIENTE",
      fecha: "2026-05-13"
    }
  ]);

  const estadoColors: Record<string, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-800",
    GENERADO: "bg-blue-100 text-blue-800",
    ENTREGADO: "bg-green-100 text-green-800"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Manifiestos</h2>
          <p className="text-sm text-slate-600">Crea y gestiona manifiestos de carga</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Nuevo Manifiesto
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Manifiestos Generados</p>
          <p className="text-2xl font-bold text-slate-900">{manifiestos.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Peso Total</p>
          <p className="text-2xl font-bold text-slate-900">{manifiestos.reduce((acc, m) => acc + m.peso, 0)} kg</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Órdenes Agrupadas</p>
          <p className="text-2xl font-bold text-slate-900">{manifiestos.reduce((acc, m) => acc + m.ordenes, 0)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-900">Número</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Órdenes</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Peso Total</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Conductor</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Vehículo</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Fecha</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Estado</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {manifiestos.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-900">{m.numero}</td>
                <td className="px-6 py-3 text-slate-600">{m.ordenes}</td>
                <td className="px-6 py-3 text-slate-600">{m.peso} kg</td>
                <td className="px-6 py-3 text-slate-600">{m.conductor}</td>
                <td className="px-6 py-3 text-slate-600">{m.vehiculo}</td>
                <td className="px-6 py-3 text-slate-600">{new Date(m.fecha).toLocaleDateString("es-CO")}</td>
                <td className="px-6 py-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${estadoColors[m.estado]}`}>
                    {m.estado}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    <Download className="h-4 w-4" />
                    Descargar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
