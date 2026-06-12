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
      DISPONIBLE: "bg-green-50 text-green-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-green-200/30 dark:border-emerald-500/10",
      EN_RUTA: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/30 dark:border-blue-500/10",
      EN_MANTENIMIENTO: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/30 dark:border-amber-500/10",
      FUERA_DE_SERVICIO: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/30 dark:border-red-500/10"
    };
    return colors[estado] || "bg-gray-50 text-gray-700 dark:bg-slate-800 dark:text-slate-300";
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
        <p className="text-slate-500 dark:text-slate-400">Cargando vehículos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-['Sora'] text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">Gestión de Vehículos</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Total: {vehiculos.length} vehículos registrados en la flota</p>
          </div>
          <button
            onClick={handleCrearVehiculo}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-500/10"
          >
            <Plus size={18} />
            Nuevo Vehículo
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-panel backdrop-blur-sm overflow-x-auto">
        {vehiculos.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold">Placa</th>
                <th className="px-6 py-3 text-sm font-semibold">Tipo</th>
                <th className="px-6 py-3 text-sm font-semibold">Capacidad</th>
                <th className="px-6 py-3 text-sm font-semibold">Estado</th>
                <th className="px-6 py-3 text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {vehiculos.map((vehiculo) => (
                <tr key={vehiculo.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{vehiculo.placa}</td>
                  <td className="px-6 py-4 text-sm">{getTipoVehiculo(vehiculo.tipo)}</td>
                  <td className="px-6 py-4 text-sm">{vehiculo.capacidadCarga} kg</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getEstadoColor(vehiculo.estado)}`}>
                      {vehiculo.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditarVehiculo(vehiculo)}
                        className="rounded-lg bg-blue-600/10 border border-blue-500/20 px-2.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 transition hover:bg-blue-600/20"
                        title="Editar"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminarVehiculo(vehiculo)}
                        className="rounded-lg bg-red-600/10 border border-red-500/20 px-2.5 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-600/20"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-500 dark:text-slate-400">
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
