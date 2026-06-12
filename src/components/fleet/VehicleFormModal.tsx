import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Vehiculo, VehiculoInput } from "../../types/domain";
import { crearVehiculo, actualizarVehiculo } from "../../services/vehiculo.service";

// Validación con Zod
const vehiculoSchema = z.object({
  placa: z.string().min(3, "La placa debe tener al menos 3 caracteres"),
  tipo: z.enum(["CAMION_CARGA_PESADA", "TURBO", "CAMIONETA"]),
  capacidadCarga: z.number().min(100, "La capacidad debe ser mayor a 100 kg"),
  restricciones: z.string().optional().nullable(),
  estado: z.enum(["DISPONIBLE", "EN_RUTA", "EN_MANTENIMIENTO", "FUERA_DE_SERVICIO"])
});

type VehiculoFormData = z.infer<typeof vehiculoSchema>;

interface VehicleFormModalProps {
  vehiculo?: Vehiculo | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function VehicleFormModal({ vehiculo, onClose, onSuccess }: VehicleFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: vehiculo
      ? {
          placa: vehiculo.placa,
          tipo: vehiculo.tipo,
          capacidadCarga: vehiculo.capacidadCarga,
          restricciones: vehiculo.restricciones,
          estado: vehiculo.estado
        }
      : {
          tipo: "CAMION_CARGA_PESADA",
          estado: "DISPONIBLE"
        }
  });

  const onSubmit = async (data: VehiculoFormData) => {
    try {
      setLoading(true);
      setError(null);

      if (vehiculo) {
        await actualizarVehiculo(vehiculo.id, data as VehiculoInput);
      } else {
        await crearVehiculo(data as VehiculoInput);
      }

      reset();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar vehículo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 overflow-y-auto backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 shadow-panel my-8">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {vehiculo ? "Editar Vehículo" : "Nuevo Vehículo"}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-4 max-h-[60vh] overflow-y-auto">
          {/* Error global */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Placa */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Placa</label>
            <input
              type="text"
              {...register("placa")}
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ej: TRK-900"
            />
            {errors.placa && <p className="text-sm text-red-600 dark:text-red-400">{errors.placa.message}</p>}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Vehículo</label>
            <select
              {...register("tipo")}
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="CAMION_CARGA_PESADA">Camión Carga Pesada</option>
              <option value="TURBO">Turbo</option>
              <option value="CAMIONETA">Camioneta</option>
            </select>
            {errors.tipo && <p className="text-sm text-red-600 dark:text-red-400">{errors.tipo.message}</p>}
          </div>

          {/* Capacidad */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Capacidad de Carga (kg)</label>
            <input
              type="number"
              {...register("capacidadCarga", { valueAsNumber: true })}
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ej: 15000"
            />
            {errors.capacidadCarga && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.capacidadCarga.message}</p>
            )}
          </div>

          {/* Restricciones */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Restricciones (Opcional)</label>
            <textarea
              {...register("restricciones")}
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ej: No transportar productos químicos"
              rows={3}
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
            <select
              {...register("estado")}
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="DISPONIBLE">Disponible</option>
              <option value="EN_RUTA">En Ruta</option>
              <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
              <option value="FUERA_DE_SERVICIO">Fuera de Servicio</option>
            </select>
            {errors.estado && <p className="text-sm text-red-600 dark:text-red-400">{errors.estado.message}</p>}
          </div>
        </form>

        {/* Botones */}
        <div className="flex gap-3 border-t border-slate-200 dark:border-slate-800 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-750 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold py-2"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors font-semibold"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
