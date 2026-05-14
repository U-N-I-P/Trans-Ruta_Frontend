import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { DocumentVehicularFormModal } from "./DocumentVehicularFormModal";
import { obtenerDocumentosVehiculares, eliminarDocumentoVehicular, obtenerAlertasDocumentosVehiculares } from "../../services/documentoVehicular.service";
import { obtenerVehiculos } from "../../services/vehiculo.service";
import { Table } from "../ui/Table";
import { DocumentoVehicular, DocumentoVehicularAlerta, Vehiculo } from "../../types/domain";
import { Modal } from "../ui/Modal";

export function DocumentVehicularListView() {
  const [documentos, setDocumentos] = useState<DocumentoVehicular[]>([]);
  const [alertas, setAlertas] = useState<DocumentoVehicularAlerta[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [documentoEditar, setDocumentoEditar] = useState<DocumentoVehicular | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentoEliminar, setDocumentoEliminar] = useState<DocumentoVehicular | null>(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const [documentosData, alertasData, vehiculosData] = await Promise.all([
        obtenerDocumentosVehiculares(),
        obtenerAlertasDocumentosVehiculares(),
        obtenerVehiculos()
      ]);
      setDocumentos(documentosData);
      setAlertas(alertasData);
      setVehiculos(vehiculosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar documentos vehiculares");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCrearDocumento = () => {
    setDocumentoEditar(null);
    setShowFormModal(true);
  };

  const handleEditarDocumento = (documento: DocumentoVehicular) => {
    setDocumentoEditar(documento);
    setShowFormModal(true);
  };

  const handleEliminarDocumento = (documento: DocumentoVehicular) => {
    setDocumentoEliminar(documento);
    setShowDeleteModal(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!documentoEliminar) return;
    try {
      await eliminarDocumentoVehicular(documentoEliminar.id);
      setShowDeleteModal(false);
      setDocumentoEliminar(null);
      cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar documento");
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setDocumentoEditar(null);
    cargarDatos();
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Cargando documentos vehiculares...</div>
    );
  }

  const columnas = [
    { id: "placa", encabezado: "Vehículo", celda: (doc: DocumentoVehicular) => doc.vehiculo?.placa ?? "-" },
    { id: "tipo", encabezado: "Tipo", celda: (doc: DocumentoVehicular) => doc.tipo },
    { id: "numero", encabezado: "Número", celda: (doc: DocumentoVehicular) => doc.numero },
    {
      id: "vencimiento",
      encabezado: "Vencimiento",
      celda: (doc: DocumentoVehicular) => new Date(doc.fechaVencimiento).toLocaleDateString("es-CO")
    },
    {
      id: "adjunto",
      encabezado: "Adjunto",
      celda: (doc: DocumentoVehicular) => (doc.archivoAdjunto ? <a href={doc.archivoAdjunto} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Ver</a> : "-")
    },
    {
      id: "acciones",
      encabezado: "Acciones",
      celda: (doc: DocumentoVehicular) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditarDocumento(doc)}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-blue-600 hover:bg-blue-50"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleEliminarDocumento(doc)}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Documentación Vehicular</h2>
          <p className="text-sm text-slate-600">Administra los documentos obligatorios y revisa alertas de vencimiento.</p>
        </div>
        <button
          onClick={handleCrearDocumento}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Nuevo Documento
        </button>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {alertas.length > 0 && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-orange-700" />
            <div>
              <h3 className="font-semibold text-orange-900">Alertas de documentos por vencer</h3>
              <p className="text-sm text-orange-800">{alertas.length} documento(s) tienen vencimiento en los próximos 30 días.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {alertas.map((alerta) => (
              <div key={alerta.id} className="rounded-2xl border border-orange-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">{alerta.placa}</p>
                <p className="text-sm text-slate-600">{alerta.tipo}</p>
                <p className="text-sm text-slate-600">Vence: {new Date(alerta.fechaVencimiento).toLocaleDateString("es-CO")}</p>
                <p className="text-sm text-slate-600">Faltan: {alerta.diasFaltantes} días</p>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    alerta.nivelAlerta === "CRITICO"
                      ? "bg-red-100 text-red-800"
                      : alerta.nivelAlerta === "ALERTA"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {alerta.nivelAlerta}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Table columnas={columnas} datos={documentos} claveFila={(doc) => String(doc.id)} estadoVacio="No hay documentos registrados" />

      {showFormModal && (
        <DocumentVehicularFormModal
          documento={documentoEditar}
          vehiculos={vehiculos}
          onClose={() => {
            setShowFormModal(false);
            setDocumentoEditar(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {showDeleteModal && documentoEliminar && (
        <Modal
          abierto={true}
          titulo="Eliminar Documento"
          onCerrar={() => {
            setShowDeleteModal(false);
            setDocumentoEliminar(null);
          }}
        >
          <div className="space-y-4">
            <p>¿Confirma eliminar el documento {documentoEliminar.numero} del vehículo {documentoEliminar.vehiculo?.placa}?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDocumentoEliminar(null);
                }}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarEliminar}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
