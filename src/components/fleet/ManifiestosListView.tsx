import { useState } from "react";
import { Download, FileText, Plus } from "lucide-react";
import { OrdenDespacho } from "../../types/domain";
import { generarManifiesto, ManifiestoResponse } from "../../services/manifiesto.service";
import { Modal } from "../ui/Modal";

interface ManifiestosListViewProps {
  ordenes: OrdenDespacho[];
}

export function ManifiestosListView({ ordenes }: ManifiestosListViewProps) {
  const [manifiestoModal, setManifiestoModal] = useState<ManifiestoResponse | null>(null);
  const [cargando, setCargando] = useState<number | null>(null);

  // Filtramos solo las órdenes que puedan tener un manifiesto en curso
  const ordenesActivas = ordenes.filter(o => o.estado !== "CANCELADO");

  const handleDescargar = async (ordenId: number) => {
    try {
      setCargando(ordenId);
      const data = await generarManifiesto(ordenId);
      setManifiestoModal(data);
    } catch (err) {
      alert("Error al generar el manifiesto. Verifique la conexión con el servidor.");
    } finally {
      setCargando(null);
    }
  };

  const estadoColors: Record<string, string> = {
    DESPACHADO: "bg-blue-100 text-blue-800",
    EN_RUTA: "bg-yellow-100 text-yellow-800",
    ENTREGADO: "bg-green-100 text-green-800",
    CERCA_DEL_DESTINO: "bg-orange-100 text-orange-800"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Manifiestos</h2>
          <p className="text-sm text-slate-600">Crea y gestiona manifiestos de carga</p>
        </div>
        <button 
          onClick={() => alert("Por favor genere los manifiestos desde las Órdenes de Despacho.")}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo Manifiesto
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Total Órdenes</p>
          <p className="text-2xl font-bold text-slate-900">{ordenesActivas.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Peso Total Despachado</p>
          <p className="text-2xl font-bold text-slate-900">{ordenesActivas.reduce((acc, m) => acc + m.pesoCarga, 0)} kg</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">En Ruta Actualmente</p>
          <p className="text-2xl font-bold text-blue-600">
            {ordenesActivas.filter(o => o.estado === "EN_RUTA").length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-900">Orden / Manifiesto</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Fecha</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Conductor</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Vehículo</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Peso</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Estado</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {ordenesActivas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-slate-500">
                  No hay órdenes de despacho activas para generar manifiestos.
                </td>
              </tr>
            )}
            {ordenesActivas.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-bold text-slate-900">{o.codigo}</td>
                <td className="px-6 py-3 text-slate-600">{new Date(o.fechaCreacion).toLocaleDateString("es-CO")}</td>
                <td className="px-6 py-3 text-slate-600">{o.conductor?.nombre} {o.conductor?.apellido}</td>
                <td className="px-6 py-3 text-slate-600 font-medium">{o.vehiculo?.placa}</td>
                <td className="px-6 py-3 text-slate-600">{o.pesoCarga} kg</td>
                <td className="px-6 py-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${estadoColors[o.estado] || 'bg-slate-100 text-slate-800'}`}>
                    {o.estado.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <button 
                    onClick={() => handleDescargar(o.id)}
                    disabled={cargando === o.id}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                  >
                    <FileText className="h-4 w-4" />
                    {cargando === o.id ? "Generando..." : "Ver Manifiesto"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {manifiestoModal && (
        <Modal
          abierto={true}
          titulo={`Manifiesto Oficial de Carga - ${manifiestoModal.manifiesto.numeroOrden}`}
          onCerrar={() => setManifiestoModal(null)}
        >
          <div className="space-y-6 bg-white p-6 rounded border border-slate-200 max-h-[70vh] overflow-y-auto">
            <div className="border-b pb-4 mb-4 text-center">
              <h3 className="text-xl font-bold uppercase tracking-wide">República de Colombia</h3>
              <h4 className="text-sm font-bold text-slate-600">Ministerio de Transporte</h4>
              <p className="text-xs text-slate-500 mt-1">Formato Único de Manifiesto de Carga</p>
            </div>

            {manifiestoModal.manifiesto.carga.excedePesoLegal && (
              <div className="bg-red-50 text-red-800 p-3 rounded text-sm border border-red-200 mb-4 font-bold text-center">
                ALERTA LEGAL: La carga declarada ({manifiestoModal.manifiesto.carga.pesoKg} kg) EXCEDE el límite legal permitido ({manifiestoModal.manifiesto.carga.limiteLegalKg} kg) para el vehículo {manifiestoModal.manifiesto.vehiculo.tipo.replace(/_/g, ' ')}.
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div className="space-y-1">
                <p className="font-semibold text-slate-800 border-b pb-1">Datos del Conductor</p>
                <p><span className="text-slate-500">Nombre:</span> {manifiestoModal.manifiesto.conductor.nombre}</p>
                <p><span className="text-slate-500">Licencia:</span> {manifiestoModal.manifiesto.conductor.licencia} ({manifiestoModal.manifiesto.conductor.categoriaLicencia})</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-800 border-b pb-1">Datos del Vehículo</p>
                <p><span className="text-slate-500">Placa:</span> <span className="font-bold">{manifiestoModal.manifiesto.vehiculo.placa}</span></p>
                <p><span className="text-slate-500">Tipo:</span> {manifiestoModal.manifiesto.vehiculo.tipo.replace(/_/g, ' ')}</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-800 border-b pb-1">Datos de Ruta y Carga</p>
                <p><span className="text-slate-500">Origen:</span> {manifiestoModal.manifiesto.carga.origen}</p>
                <p><span className="text-slate-500">Destino:</span> {manifiestoModal.manifiesto.carga.destino}</p>
                <p><span className="text-slate-500">Peso Autorizado:</span> {manifiestoModal.manifiesto.carga.pesoKg} kg</p>
                <p><span className="text-slate-500">Descripción:</span> {manifiestoModal.manifiesto.carga.descripcion || 'Sin descripción'}</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-800 border-b pb-1">Datos del Cliente</p>
                <p><span className="text-slate-500">Nombre:</span> {manifiestoModal.manifiesto.cliente.nombre}</p>
                <p><span className="text-slate-500">NIT/CC:</span> {manifiestoModal.manifiesto.cliente.documento}</p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t flex justify-between text-xs text-slate-400">
              <p>Generado: {new Date(manifiestoModal.manifiesto.generadoEn).toLocaleString('es-CO')}</p>
              <p>Firma y Sello de la Empresa Autorizada</p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <button 
              onClick={() => setManifiestoModal(null)}
              className="px-4 py-2 border rounded text-slate-700 hover:bg-slate-50 text-sm font-semibold"
            >
              Cerrar
            </button>
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex gap-2 items-center text-sm font-semibold"
            >
              <Download className="w-4 h-4" />
              Imprimir / PDF
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
