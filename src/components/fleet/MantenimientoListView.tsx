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
    CAMION_CARGA_PESADA: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/30 dark:border-blue-500/10",
    TURBO: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200/30 dark:border-indigo-500/10",
    CAMIONETA: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-green-200/30 dark:border-emerald-500/10"
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Cargando planes de mantenimiento...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-['Sora'] text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">Gestión de Mantenimiento</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Planifica y controla el mantenimiento de tu flota</p>
          </div>
          <button type="button" onClick={handleNuevoPlan} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-505 transition-all shadow-md shadow-blue-500/10">
            <Plus className="h-4 w-4" />
            Nuevo Plan
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-xs text-red-400">{error}</div>}

      {planes.length > 0 && planes.some((p) => (p.frecuenciaKm ?? 0) > 0 && (p.frecuenciaKm ?? 0) <= 5000) && (
        <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-950/20 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-650 dark:text-red-400" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-200">Mantenimiento Crítico Pendiente</p>
              <p className="text-sm text-red-700 dark:text-red-300">Hay planes con frecuencia de mantenimiento muy cercana</p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-panel backdrop-blur-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100">
            <tr>
              <th className="px-6 py-3 font-semibold">Nombre</th>
              <th className="px-6 py-3 font-semibold">Vehículo</th>
              <th className="px-6 py-3 font-semibold">Tipo</th>
              <th className="px-6 py-3 font-semibold">Frecuencia</th>
              <th className="px-6 py-3 font-semibold">Descripción</th>
              <th className="px-6 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {planes.length > 0 ? (
              planes.map((plan) => (
              <tr key={plan.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-3 font-semibold text-slate-900 dark:text-slate-100">{plan.nombre}</td>
                <td className="px-6 py-3">
                  {plan.vehiculo?.placa ?? vehiculos.find((vehiculo) => vehiculo.id === plan.vehiculoId)?.placa ?? `Vehículo ${plan.vehiculoId}`}
                </td>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${tipoColors[plan.tipoVehiculo]}`}>
                    <Wrench className="h-3 w-3" />
                    {plan.tipoVehiculo === "CAMION_CARGA_PESADA" ? "Carga Pesada" : plan.tipoVehiculo}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {plan.frecuenciaKm ? `${plan.frecuenciaKm} km` : "-"}
                  {plan.frecuenciaDias ? ` / ${plan.frecuenciaDias} días` : ""}
                </td>
                <td className="px-6 py-3">{plan.descripcion ?? "-"}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditarPlan(plan)}
                      className="rounded-lg bg-blue-600/10 border border-blue-500/20 px-2.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 transition hover:bg-blue-600/20"
                      title="Editar"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleEliminarPlan(plan)}
                      className="rounded-lg bg-red-600/10 border border-red-500/20 px-2.5 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-600/20"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
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
