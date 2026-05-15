import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { PlanMantenimiento, PlanMantenimientoInput, Vehiculo } from "../../types/domain";
import { crearPlanMantenimiento, actualizarPlanMantenimiento } from "../../services/planDeMantenimiento.service";
import { Modal } from "../ui/Modal";

const planSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional().nullable(),
  frecuenciaKm: z.coerce.number().min(1, "La frecuencia en km debe ser mayor a 0").optional().nullable(),
  frecuenciaDias: z.coerce.number().min(1, "La frecuencia en días debe ser mayor a 0").optional().nullable(),
  tipoVehiculo: z.enum(["CAMION_CARGA_PESADA", "TURBO", "CAMIONETA"]),
  vehiculoId: z.coerce.number().min(1, "Seleccione un vehículo")
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanMantenimientoFormModalProps {
  abierto: boolean;
  vehiculos: Vehiculo[];
  plan?: PlanMantenimiento | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PlanMantenimientoFormModal({ abierto, vehiculos, plan, onClose, onSuccess }: PlanMantenimientoFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: plan
      ? {
          nombre: plan.nombre,
          descripcion: plan.descripcion ?? "",
          frecuenciaKm: plan.frecuenciaKm ?? undefined,
          frecuenciaDias: plan.frecuenciaDias ?? undefined,
          tipoVehiculo: plan.tipoVehiculo,
          vehiculoId: plan.vehiculoId
        }
      : {
          tipoVehiculo: "CAMION_CARGA_PESADA"
        }
  });

  useEffect(() => {
    if (!abierto) {
      return;
    }

    reset(
      plan
        ? {
            nombre: plan.nombre,
            descripcion: plan.descripcion ?? "",
            frecuenciaKm: plan.frecuenciaKm ?? undefined,
            frecuenciaDias: plan.frecuenciaDias ?? undefined,
            tipoVehiculo: plan.tipoVehiculo,
            vehiculoId: plan.vehiculoId
          }
        : {
            nombre: "",
            descripcion: "",
            frecuenciaKm: undefined,
            frecuenciaDias: undefined,
            tipoVehiculo: "CAMION_CARGA_PESADA",
            vehiculoId: 0
          }
    );
  }, [abierto, plan, reset]);

  const onSubmit = async (data: PlanFormData) => {
    try {
      setLoading(true);
      setError(null);

      const payload: PlanMantenimientoInput = {
        nombre: data.nombre,
        descripcion: data.descripcion?.trim() || null,
        frecuenciaKm: data.frecuenciaKm ?? null,
        frecuenciaDias: data.frecuenciaDias ?? null,
        tipoVehiculo: data.tipoVehiculo,
        vehiculoId: data.vehiculoId
      };

      if (plan) {
        await actualizarPlanMantenimiento(plan.id, payload);
      } else {
        await crearPlanMantenimiento(payload);
      }

      reset();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar plan de mantenimiento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal abierto={abierto} titulo={plan ? "Editar Plan de Mantenimiento" : "Nuevo Plan de Mantenimiento"} onCerrar={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-slate-700">Nombre</label>
          <input
            type="text"
            {...register("nombre")}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="ej: Cambio de aceite preventivo"
          />
          {errors.nombre && <p className="text-sm text-red-600">{errors.nombre.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Descripción</label>
          <textarea
            {...register("descripcion")}
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Detalles del plan"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Frecuencia (km)</label>
            <input
              type="number"
              {...register("frecuenciaKm")}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ej: 10000"
            />
            {errors.frecuenciaKm && <p className="text-sm text-red-600">{errors.frecuenciaKm.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Frecuencia (días)</label>
            <input
              type="number"
              {...register("frecuenciaDias")}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ej: 90"
            />
            {errors.frecuenciaDias && <p className="text-sm text-red-600">{errors.frecuenciaDias.message}</p>}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Tipo de Vehículo</label>
            <select
              {...register("tipoVehiculo")}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="CAMION_CARGA_PESADA">Camión Carga Pesada</option>
              <option value="TURBO">Turbo</option>
              <option value="CAMIONETA">Camioneta</option>
            </select>
            {errors.tipoVehiculo && <p className="text-sm text-red-600">{errors.tipoVehiculo.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Vehículo</label>
            <select
              {...register("vehiculoId", { valueAsNumber: true })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={0}>Selecciona un vehículo</option>
              {vehiculos
                .filter((vehiculo) => vehiculo.tipo === (plan?.tipoVehiculo ?? undefined) || vehiculo.tipo === planSchema.shape.tipoVehiculo._def.values[0])
                .map((vehiculo) => (
                  <option key={vehiculo.id} value={vehiculo.id}>
                    {vehiculo.placa} - {vehiculo.tipo}
                  </option>
                ))}
            </select>
            {errors.vehiculoId && <p className="text-sm text-red-600">{errors.vehiculoId.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Guardando..." : plan ? "Guardar cambios" : "Guardar plan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}