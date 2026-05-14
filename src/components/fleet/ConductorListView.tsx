import { useEffect, useState } from "react";
import { Trash2, Edit2, Plus, AlertTriangle } from "lucide-react";
import { Conductor } from "../../types/domain";
import { obtenerConductores, eliminarConductor, obtenerLicenciasPorVencer } from "../../services/conductor.service";
import { Modal } from "../ui/Modal";
import { ConductorFormModal } from "./ConductorFormModal";

interface ConductorListViewProps {
  onActualizar?: () => void;
}

export function ConductorListView({ onActualizar }: ConductorListViewProps) {
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [licenciasPorVencer, setLicenciasPorVencer] = useState<Conductor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [conductorEditar, setConductorEditar] = useState<Conductor | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conductorEliminar, setConductorEliminar] = useState<Conductor | null>(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const [datos, licencias] = await Promise.all([
        obtenerConductores(),
        obtenerLicenciasPorVencer()
      ]);
      setConductores(datos);
      setLicenciasPorVencer(licencias);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar conductores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCrearConductor = () => {
    setConductorEditar(null);
    setShowFormModal(true);
  };

  const handleEditarConductor = (conductor: Conductor) => {
    setConductorEditar(conductor);
    setShowFormModal(true);
  };

  const handleEliminarConductor = (conductor: Conductor) => {
    setConductorEliminar(conductor);
    setShowDeleteModal(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!conductorEliminar) return;

    try {
      await eliminarConductor(conductorEliminar.id);
      setShowDeleteModal(false);
      setConductorEliminar(null);
      cargarDatos();
      onActualizar?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar conductor");
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setConductorEditar(null);
    cargarDatos();
    onActualizar?.();
  };

  const getNombreCompleto = (conductor: Conductor) => `${conductor.nombre} ${conductor.apellido}`;

  const getLicenciaEstado = (conductor: Conductor) => {
    if (conductor.licenciaVencida) {
      return { color: "text-red-600", bg: "bg-red-50", label: "Vencida" };
    }
    if (conductor.diasParaVencimiento <= 7) {
      return { color: "text-orange-600", bg: "bg-orange-50", label: "Crítica" };
    }
    if (conductor.diasParaVencimiento <= 15) {
      return { color: "text-yellow-600", bg: "bg-yellow-50", label: "Alerta" };
    }
    if (conductor.diasParaVencimiento <= 30) {
      return { color: "text-blue-600", bg: "bg-blue-50", label: "Próxima" };
    }
    return { color: "text-green-600", bg: "bg-green-50", label: "Vigente" };
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Cargando conductores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas de Licencias por Vencer */}
      {licenciasPorVencer.length > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="text-orange-600 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-orange-900">Licencias por Vencer</h3>
              <p className="text-sm text-orange-800 mt-1">
                {licenciasPorVencer.length} conductor(es) tienen licencias próximas a vencer o vencidas:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-orange-700">
                {licenciasPorVencer.map((c) => (
                  <li key={c.id}>
                    • {getNombreCompleto(c)} - {c.diasParaVencimiento <= 0 ? "Vencida" : `Vence en ${c.diasParaVencimiento} días`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Conductores</h2>
          <p className="text-sm text-gray-600">Total: {conductores.length} conductores</p>
        </div>
        <button
          onClick={handleCrearConductor}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Nuevo Conductor
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
        {conductores.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cédula</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Licencia</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Categoría</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vencimiento</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Horas</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {conductores.map((conductor) => {
                const licenciaEstado = getLicenciaEstado(conductor);
                return (
                  <tr key={conductor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {getNombreCompleto(conductor)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{conductor.cedula}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{conductor.numeroLicencia}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{conductor.categoriaLicencia}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(conductor.fechaVencimientoLicencia).toLocaleDateString("es-CO")}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${licenciaEstado.bg} ${licenciaEstado.color}`}>
                        {licenciaEstado.label}
                        {conductor.diasParaVencimiento > 0 && ` (${conductor.diasParaVencimiento}d)`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{conductor.horasConducidas}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditarConductor(conductor)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleEliminarConductor(conductor)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex h-64 items-center justify-center text-gray-500">
            No hay conductores registrados. ¡Crea el primero!
          </div>
        )}
      </div>

      {/* Modal Formulario */}
      {showFormModal && (
        <ConductorFormModal
          conductor={conductorEditar}
          onClose={() => {
            setShowFormModal(false);
            setConductorEditar(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && conductorEliminar && (
        <Modal
          abierto={showDeleteModal}
          titulo="Eliminar Conductor"
          onCerrar={() => {
            setShowDeleteModal(false);
            setConductorEliminar(null);
          }}
        >
          <div className="space-y-4">
            <p className="text-slate-600">
              ¿Estás seguro de que deseas eliminar al conductor <strong>{getNombreCompleto(conductorEliminar)}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConductorEliminar(null);
                }}
                className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarEliminar}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
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
