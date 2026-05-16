import { useEffect, useState } from "react";
import { Plus, Wrench, AlertTriangle, Edit2, Trash2 } from "lucide-react";
import { PlanMantenimiento, Vehiculo } from "../../types/domain";
import { obtenerPlanesMantenimiento, eliminarPlanMantenimiento } from "../../services/planDeMantenimiento.service";
import { PlanMantenimientoFormModal } from "./PlanMantenimientoFormModal";


interface MantenimientoListViewProps {
  vehiculos: Vehiculo[];
}

export function MantenimientoListView({ vehiculos }: MantenimientoListViewProps) {
  const [planes, setPlanes] = useState<PlanMantenimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [planEditar, setPlanEditar] = useState<PlanMantenimiento | null>(null);

  const cargarPlanes = async () => {
    try {
      setLoading(true);
      setError(null);
      const datos = await obtenerPlanesMantenimiento();
      setPlanes(datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar planes de mantenimiento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarPlanes();
  }, []);

  const handleNuevoPlan = () => {
    setPlanEditar(null);
    setMostrarModal(true);
  };

  const handleEditarPlan = (plan: PlanMantenimiento) => {
    setPlanEditar(plan);
    setMostrarModal(true);
  };

  const handleEliminarPlan = async (plan: PlanMantenimiento) => {
    const confirmar = window.confirm(`¿Eliminar el plan ${plan.nombre}?`);
    if (!confirmar) return;

    try {
      await eliminarPlanMantenimiento(plan.id);
      await cargarPlanes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar plan de mantenimiento");
    }
  };

  const handleSuccess = async () => {
    setMostrarModal(false);
    setPlanEditar(null);
    await cargarPlanes();
  };

  const tipoColors: Record<string, string> = {
    CAMION_CARGA_PESADA: "bg-blue-100 text-blue-800",
    TURBO: "bg-indigo-100 text-indigo-800",
    CAMIONETA: "bg-emerald-100 text-emerald-800"
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Cargando planes de mantenimiento...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Mantenimiento</h2>
          <p className="text-sm text-slate-600">Planifica y controla el mantenimiento de tu flota</p>
        </div>
        <button type="button" onClick={handleNuevoPlan} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Nuevo Plan
        </button>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

      {planes.length > 0 && planes.some((p) => (p.frecuenciaKm ?? 0) > 0 && (p.frecuenciaKm ?? 0) <= 5000) && (
        <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">Mantenimiento Crítico Pendiente</p>
              <p className="text-sm text-red-700">Hay planes con frecuencia de mantenimiento muy cercana</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-900">Nombre</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Vehículo</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Tipo</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Frecuencia</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Descripción</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {planes.length > 0 ? (
              planes.map((plan) => (
              <tr key={plan.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-900">{plan.nombre}</td>
                <td className="px-6 py-3 text-slate-600">
                  {plan.vehiculo?.placa ?? vehiculos.find((vehiculo) => vehiculo.id === plan.vehiculoId)?.placa ?? `Vehículo ${plan.vehiculoId}`}
                </td>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${tipoColors[plan.tipoVehiculo]}`}>
                    <Wrench className="h-3 w-3" />
                    {plan.tipoVehiculo}
                  </span>
                </td>
                <td className="px-6 py-3 text-slate-600">
                  {plan.frecuenciaKm ? `${plan.frecuenciaKm} km` : "-"}
                  {plan.frecuenciaDias ? ` / ${plan.frecuenciaDias} días` : ""}
                </td>
                <td className="px-6 py-3 text-slate-600">{plan.descripcion ?? "-"}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditarPlan(plan)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleEliminarPlan(plan)}
                      className="text-red-600 hover:text-red-700"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No hay planes de mantenimiento registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PlanMantenimientoFormModal
        abierto={mostrarModal}
        vehiculos={vehiculos}
        plan={planEditar}
        onClose={() => {
          setMostrarModal(false);
          setPlanEditar(null);
        }}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
