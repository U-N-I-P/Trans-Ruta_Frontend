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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-lg">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">
            {vehiculo ? "Editar Vehículo" : "Nuevo Vehículo"}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-4">
          {/* Error global */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Placa */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Placa</label>
            <input
              type="text"
              {...register("placa")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ej: TRK-900"
            />
            {errors.placa && <p className="text-sm text-red-600">{errors.placa.message}</p>}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Vehículo</label>
            <select
              {...register("tipo")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="CAMION_CARGA_PESADA">Camión Carga Pesada</option>
              <option value="TURBO">Turbo</option>
              <option value="CAMIONETA">Camioneta</option>
            </select>
            {errors.tipo && <p className="text-sm text-red-600">{errors.tipo.message}</p>}
          </div>

          {/* Capacidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Capacidad de Carga (kg)</label>
            <input
              type="number"
              {...register("capacidadCarga", { valueAsNumber: true })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ej: 15000"
            />
            {errors.capacidadCarga && (
              <p className="text-sm text-red-600">{errors.capacidadCarga.message}</p>
            )}
          </div>

          {/* Restricciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Restricciones (Opcional)</label>
            <textarea
              {...register("restricciones")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ej: No transportar productos químicos"
              rows={3}
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              {...register("estado")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="DISPONIBLE">Disponible</option>
              <option value="EN_RUTA">En Ruta</option>
              <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
              <option value="FUERA_DE_SERVICIO">Fuera de Servicio</option>
            </select>
            {errors.estado && <p className="text-sm text-red-600">{errors.estado.message}</p>}
          </div>
        </form>

        {/* Botones */}
        <div className="flex gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
