import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Conductor, ConductorInput } from "../../types/domain";
import { crearConductor, actualizarConductor } from "../../services/conductor.service";

// Validación con Zod
const conductorSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  cedula: z.string().min(6, "La cédula debe tener al menos 6 caracteres"),
  telefono: z.string().optional().nullable(),
  numeroLicencia: z.string().min(5, "El número de licencia debe tener al menos 5 caracteres"),
  categoriaLicencia: z.enum(["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"]),
  fechaVencimientoLicencia: z.string(),
  horasConducidas: z.number().min(0, "Las horas no pueden ser negativas").optional().nullable()
});

type ConductorFormData = z.infer<typeof conductorSchema>;

interface ConductorFormModalProps {
  conductor?: Conductor | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConductorFormModal({ conductor, onClose, onSuccess }: ConductorFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ConductorFormData>({
    resolver: zodResolver(conductorSchema),
    defaultValues: conductor
      ? {
          nombre: conductor.nombre,
          apellido: conductor.apellido,
          cedula: conductor.cedula,
          telefono: conductor.telefono,
          numeroLicencia: conductor.numeroLicencia,
          categoriaLicencia: conductor.categoriaLicencia as any,
          fechaVencimientoLicencia: conductor.fechaVencimientoLicencia,
          horasConducidas: conductor.horasConducidas
        }
      : {
          categoriaLicencia: "C3"
        }
  });

  const onSubmit = async (data: ConductorFormData) => {
    try {
      setLoading(true);
      setError(null);

      const payload: ConductorInput = {
        nombre: data.nombre,
        apellido: data.apellido,
        cedula: data.cedula,
        telefono: data.telefono,
        numeroLicencia: data.numeroLicencia,
        categoriaLicencia: data.categoriaLicencia,
        fechaVencimientoLicencia: data.fechaVencimientoLicencia,
        horasConducidas: data.horasConducidas ?? undefined
      };

      if (conductor) {
        await actualizarConductor(conductor.id, payload);
      } else {
        await crearConductor(payload);
      }

      reset();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar conductor");
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
            {conductor ? "Editar Conductor" : "Nuevo Conductor"}
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

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
            <input
              type="text"
              {...register("nombre")}
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ej: Juan"
            />
            {errors.nombre && <p className="text-sm text-red-650">{errors.nombre.message}</p>}
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Apellido</label>
            <input
              type="text"
              {...register("apellido")}
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ej: Pérez"
            />
            {errors.apellido && <p className="text-sm text-red-655">{errors.apellido.message}</p>}
          </div>

          {/* Cédula */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cédula</label>
            <input
              type="text"
              {...register("cedula")}
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ej: 1234567890"
            />
            {errors.cedula && <p className="text-sm text-red-655">{errors.cedula.message}</p>}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono (Opcional)</label>
            <input
              type="tel"
              {...register("telefono")}
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ej: 3001234567"
            />
          </div>

          {/* Número de Licencia */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Número de Licencia</label>
            <input
              type="text"
              {...register("numeroLicencia")}
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ej: ABC123456"
            />
            {errors.numeroLicencia && <p className="text-sm text-red-655">{errors.numeroLicencia.message}</p>}
          </div>

          {/* Categoría de Licencia */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Categoría de Licencia</label>
            <select
              {...register("categoriaLicencia")}
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="B3">B3</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
              <option value="C3">C3 (Camiones)</option>
            </select>
            {errors.categoriaLicencia && <p className="text-sm text-red-655">{errors.categoriaLicencia.message}</p>}
          </div>

          {/* Fecha Vencimiento */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha Vencimiento Licencia</label>
            <input
              type="date"
              {...register("fechaVencimientoLicencia")}
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.fechaVencimientoLicencia && (
              <p className="text-sm text-red-655">{errors.fechaVencimientoLicencia.message}</p>
            )}
          </div>

          {/* Horas Conducidas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Horas Conducidas (Opcional)</label>
            <input
              type="number"
              {...register("horasConducidas", { valueAsNumber: true })}
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ej: 5000"
            />
            {errors.horasConducidas && <p className="text-sm text-red-655">{errors.horasConducidas.message}</p>}
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
