import { useState } from "react";
import { CheckCircle, Signature } from "lucide-react";

interface Entrega {
  id: string;
  ordenId: string;
  conductor: string;
  destino: string;
  fechaEstimada: string;
  estado: "PENDIENTE" | "EN_TRANSITO" | "ENTREGADO" | "NO_ENTREGADO";
  firmado: boolean;
}

export function EntregasListView({}: any) {
  const [entregas, setEntregas] = useState<Entrega[]>([
    {
      id: "1",
      ordenId: "ORD-001",
      conductor: "Juan Pérez",
      destino: "Bogotá",
      fechaEstimada: "2026-05-13",
      estado: "ENTREGADO",
      firmado: true
    },
    {
      id: "2",
      ordenId: "ORD-002",
      conductor: "Carlos López",
      destino: "Medellín",
      fechaEstimada: "2026-05-15",
      estado: "EN_TRANSITO",
      firmado: false
    },
    {
      id: "3",
      ordenId: "ORD-003",
      conductor: "Ana García",
      destino: "Cali",
      fechaEstimada: "2026-05-14",
      estado: "PENDIENTE",
      firmado: false
    }
  ]);

  const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null);
  const [showSignature, setShowSignature] = useState(false);

  const estadoColors: Record<string, string> = {
    PENDIENTE: "bg-slate-100 text-slate-800",
    EN_TRANSITO: "bg-blue-100 text-blue-800",
    ENTREGADO: "bg-green-100 text-green-800",
    NO_ENTREGADO: "bg-red-100 text-red-800"
  };

  const handleFirmarEntrega = (entrega: Entrega) => {
    setSelectedEntrega(entrega);
    setShowSignature(true);
  };

  const handleConfirmarFirma = () => {
    if (selectedEntrega) {
      setEntregas(
        entregas.map(e =>
          e.id === selectedEntrega.id
            ? { ...e, estado: "ENTREGADO", firmado: true }
            : e
        )
      );
      setShowSignature(false);
      setSelectedEntrega(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Gestión de Entregas</h2>
        <p className="text-sm text-slate-600">Controla entregas con firma digital</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Entregas Completadas</p>
          <p className="text-2xl font-bold text-green-600">{entregas.filter(e => e.estado === "ENTREGADO").length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">En Tránsito</p>
          <p className="text-2xl font-bold text-blue-600">{entregas.filter(e => e.estado === "EN_TRANSITO").length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">{entregas.filter(e => e.estado === "PENDIENTE").length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-900">Orden</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Conductor</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Destino</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Fecha Estimada</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Estado</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Firma</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {entregas.map((entrega) => (
              <tr key={entrega.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-900">{entrega.ordenId}</td>
                <td className="px-6 py-3 text-slate-600">{entrega.conductor}</td>
                <td className="px-6 py-3 text-slate-600">{entrega.destino}</td>
                <td className="px-6 py-3 text-slate-600">{new Date(entrega.fechaEstimada).toLocaleDateString("es-CO")}</td>
                <td className="px-6 py-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${estadoColors[entrega.estado]}`}>
                    {entrega.estado}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {entrega.firmado ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Firmado
                    </span>
                  ) : (
                    <span className="text-slate-500 text-sm">Pendiente</span>
                  )}
                </td>
                <td className="px-6 py-3">
                  {entrega.estado === "EN_TRANSITO" && !entrega.firmado ? (
                    <button
                      onClick={() => handleFirmarEntrega(entrega)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Signature className="h-4 w-4" />
                      Firmar
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showSignature && selectedEntrega && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Firma Digital - Entrega</h3>
            <p className="text-sm text-slate-600 mb-4">Orden: <span className="font-semibold">{selectedEntrega.ordenId}</span></p>
            
            <div className="bg-slate-100 rounded-lg p-8 mb-4 text-center border-2 border-dashed border-slate-300">
              <Signature className="h-16 w-16 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Área de firma (simulado)</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSignature(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarFirma}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Confirmar Entrega
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
