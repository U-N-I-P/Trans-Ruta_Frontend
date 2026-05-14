import { useEffect, useState } from "react";
import { Trash2, Edit2, Plus } from "lucide-react";
import { Vehiculo } from "../../types/domain";
import { obtenerVehiculos, eliminarVehiculo } from "../../services/vehiculo.service";
import { Modal } from "../ui/Modal";
import { VehicleFormModal } from "./VehicleFormModal";

interface VehicleListViewProps {
  onActualizar?: () => void;
}

export function VehicleListView({ onActualizar }: VehicleListViewProps) {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [vehiculoEditar, setVehiculoEditar] = useState<Vehiculo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehiculoEliminar, setVehiculoEliminar] = useState<Vehiculo | null>(null);

  const cargarVehiculos = async () => {
    try {
      setLoading(true);
      setError(null);
      const datos = await obtenerVehiculos();
      setVehiculos(datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar vehículos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const handleCrearVehiculo = () => {
    setVehiculoEditar(null);
    setShowFormModal(true);
  };

  const handleEditarVehiculo = (vehiculo: Vehiculo) => {
    setVehiculoEditar(vehiculo);
    setShowFormModal(true);
  };

  const handleEliminarVehiculo = (vehiculo: Vehiculo) => {
    setVehiculoEliminar(vehiculo);
    setShowDeleteModal(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!vehiculoEliminar) return;

    try {
      await eliminarVehiculo(vehiculoEliminar.id);
      setShowDeleteModal(false);
      setVehiculoEliminar(null);
      cargarVehiculos();
      onActualizar?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar vehículo");
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setVehiculoEditar(null);
    cargarVehiculos();
    onActualizar?.();
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      DISPONIBLE: "bg-green-100 text-green-800",
      EN_RUTA: "bg-blue-100 text-blue-800",
      EN_MANTENIMIENTO: "bg-yellow-100 text-yellow-800",
      FUERA_DE_SERVICIO: "bg-red-100 text-red-800"
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  const getTipoVehiculo = (tipo: string) => {
    const tipos: Record<string, string> = {
      CAMION_CARGA_PESADA: "Camión Carga Pesada",
      TURBO: "Turbo",
      CAMIONETA: "Camioneta"
    };
    return tipos[tipo] || tipo;
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Cargando vehículos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Vehículos</h2>
          <p className="text-sm text-gray-600">Total: {vehiculos.length} vehículos</p>
        </div>
        <button
          onClick={handleCrearVehiculo}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Nuevo Vehículo
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {vehiculos.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Placa</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tipo</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Capacidad</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vehiculos.map((vehiculo) => (
                <tr key={vehiculo.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{vehiculo.placa}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{getTipoVehiculo(vehiculo.tipo)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{vehiculo.capacidadCarga} kg</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getEstadoColor(vehiculo.estado)}`}>
                      {vehiculo.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditarVehiculo(vehiculo)}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleEliminarVehiculo(vehiculo)}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex h-64 items-center justify-center text-gray-500">
            No hay vehículos registrados. ¡Crea el primero!
          </div>
        )}
      </div>

      {/* Modal Formulario */}
      {showFormModal && (
        <VehicleFormModal
          vehiculo={vehiculoEditar}
          onClose={() => {
            setShowFormModal(false);
            setVehiculoEditar(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && vehiculoEliminar && (
        <Modal
          abierto={showDeleteModal}
          titulo="Eliminar Vehículo"
          onCerrar={() => {
            setShowDeleteModal(false);
            setVehiculoEliminar(null);
          }}
        >
          <div className="space-y-4">
            <p className="text-slate-600">
              ¿Estás seguro de que deseas eliminar el vehículo <strong>{vehiculoEliminar.placa}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setVehiculoEliminar(null);
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
