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
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando documentos vehiculares...</p>
      </div>
    );
  }

  const columnas = [
    { id: "placa", encabezado: "Vehículo", celda: (doc: DocumentoVehicular) => <span className="font-semibold text-slate-900 dark:text-slate-100">{doc.vehiculo?.placa ?? "-"}</span> },
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
      celda: (doc: DocumentoVehicular) => (doc.archivoAdjunto ? <a href={doc.archivoAdjunto} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Ver</a> : "-")
    },
    {
      id: "acciones",
      encabezado: "Acciones",
      celda: (doc: DocumentoVehicular) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleEditarDocumento(doc)}
            className="rounded-lg bg-blue-600/10 border border-blue-500/20 px-2.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 transition hover:bg-blue-600/20"
            title="Editar"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleEliminarDocumento(doc)}
            className="rounded-lg bg-red-600/10 border border-red-500/20 px-2.5 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-600/20"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-['Sora'] text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">Documentación Vehicular</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">Administra los documentos obligatorios y revisa alertas de vencimiento.</p>
          </div>
          <button
            onClick={handleCrearDocumento}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-500/10"
          >
            <Plus size={18} />
            Nuevo Documento
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="rounded-2xl border border-amber-250 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-950/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-700 dark:text-amber-400" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-200">Alertas de documentos por vencer</h3>
              <p className="text-sm text-amber-800 dark:text-amber-400">{alertas.length} documento(s) tienen vencimiento en los próximos 30 días.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {alertas.map((alerta) => (
              <div key={alerta.id} className="rounded-2xl border border-amber-200/20 dark:border-slate-800 bg-white/90 dark:bg-slate-800/80 p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{alerta.placa}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{alerta.tipo}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Vence: {new Date(alerta.fechaVencimiento).toLocaleDateString("es-CO")}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Faltan: {alerta.diasFaltantes} días</p>
                <span
                  className={`inline-flex mt-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    alerta.nivelAlerta === "CRITICO"
                      ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/30 dark:border-red-500/10"
                      : alerta.nivelAlerta === "ALERTA"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/30 dark:border-amber-500/10"
                      : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/30 dark:border-blue-500/10"
                  }`}
                >
                  {alerta.nivelAlerta}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-panel backdrop-blur-sm">
        <Table columnas={columnas} datos={documentos} claveFila={(doc) => String(doc.id)} estadoVacio="No hay documentos registrados" />
      </div>

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
            <p className="text-slate-600 dark:text-slate-300">¿Confirma eliminar el documento <strong>{documentoEliminar.numero}</strong> del vehículo <strong>{documentoEliminar.vehiculo?.placa}</strong>?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDocumentoEliminar(null);
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarEliminar}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
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
