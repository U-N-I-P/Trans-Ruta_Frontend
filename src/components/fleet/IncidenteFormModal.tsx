import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import { Incidente, IncidenteInput, OrdenDespacho } from "../../types/domain";
import { Modal } from "../ui/Modal";

const incidenteSchema = z.object({
  ordenDeDespachoId: z.coerce.number().min(1, "Selecciona una orden"),
  tipo: z.string().min(3, "El tipo es requerido"),
  descripcion: z.string().min(5, "La descripción debe tener al menos 5 caracteres"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  latitud: z.union([z.number(), z.undefined(), z.null()]).optional(),
  longitud: z.union([z.number(), z.undefined(), z.null()]).optional(),
  protocoloActivado: z.boolean().optional().default(false)
});

type IncidenteFormData = z.infer<typeof incidenteSchema>;

interface IncidenteFormModalProps {
  abierto: boolean;
  ordenes: OrdenDespacho[];
  incidente?: Incidente | null;
  onClose: () => void;
  onSubmit: (ordenId: number, payload: IncidenteInput, incidenteId?: number) => Promise<void>;
}

export function IncidenteFormModal({ abierto, ordenes, incidente, onClose, onSubmit }: IncidenteFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<IncidenteFormData>({
    resolver: zodResolver(incidenteSchema),
    defaultValues: incidente
      ? {
          ordenDeDespachoId: incidente.ordenDeDespachoId,
          tipo: incidente.tipo,
          descripcion: incidente.descripcion,
          fecha: incidente.fecha,
          latitud: incidente.latitud ?? undefined,
          longitud: incidente.longitud ?? undefined,
          protocoloActivado: incidente.protocoloActivado
        }
      : {
          fecha: new Date().toISOString().split("T")[0],
          protocoloActivado: false
        }
  });

  useEffect(() => {
    if (!abierto) {
      return;
    }

    reset(
      incidente
        ? {
            ordenDeDespachoId: incidente.ordenDeDespachoId,
            tipo: incidente.tipo,
            descripcion: incidente.descripcion,
            fecha: incidente.fecha,
            latitud: incidente.latitud ?? undefined,
            longitud: incidente.longitud ?? undefined,
            protocoloActivado: incidente.protocoloActivado
          }
        : {
            ordenDeDespachoId: 0,
            tipo: "FALLA_MECANICA",
            descripcion: "",
            fecha: new Date().toISOString().split("T")[0],
            latitud: undefined,
            longitud: undefined,
            protocoloActivado: false
          }
    );
  }, [abierto, incidente, reset]);

  const submit = async (data: IncidenteFormData) => {
    try {
      setLoading(true);
      setError(null);

      await onSubmit(
        data.ordenDeDespachoId,
        {
          tipo: data.tipo,
          descripcion: data.descripcion,
          fecha: data.fecha,
          latitud: data.latitud ?? null,
          longitud: data.longitud ?? null,
          protocoloActivado: Boolean(data.protocoloActivado)
        },
        incidente?.id
      );

      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar incidente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal abierto={abierto} titulo={incidente ? "Editar Incidente" : "Nuevo Incidente"} onCerrar={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(submit)}>
        {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-slate-700">Orden de despacho</label>
          <select
            {...register("ordenDeDespachoId", { valueAsNumber: true })}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={0}>Selecciona una orden</option>
            {ordenes.map((orden) => (
              <option key={orden.id} value={orden.id}>
                {orden.codigo} - {orden.origen} → {orden.destino}
              </option>
            ))}
          </select>
          {errors.ordenDeDespachoId && <p className="text-sm text-red-600">{errors.ordenDeDespachoId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Tipo de incidente</label>
          <select
            {...register("tipo")}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="FALLA_MECANICA">Falla mecánica</option>
            <option value="RETRASO">Retraso</option>
            <option value="ACCIDENTE">Accidente</option>
            <option value="OTRO">Otro</option>
          </select>
          {errors.tipo && <p className="text-sm text-red-600">{errors.tipo.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Descripción</label>
          <textarea
            {...register("descripcion")}
            rows={4}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Describe el incidente"
          />
          {errors.descripcion && <p className="text-sm text-red-600">{errors.descripcion.message}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Fecha</label>
            <input
              type="date"
              {...register("fecha")}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.fecha && <p className="text-sm text-red-600">{errors.fecha.message}</p>}
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input type="checkbox" {...register("protocoloActivado")} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
            <label className="text-sm text-slate-700">Activar protocolo</label>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Latitud</label>
            <input
              type="number"
              step="any"
              {...register("latitud", {
                setValueAs: (value) => (value === "" ? undefined : Number(value))
              })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Longitud</label>
            <input
              type="number"
              step="any"
              {...register("longitud", {
                setValueAs: (value) => (value === "" ? undefined : Number(value))
              })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
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
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            disabled={loading}
          >
            <AlertTriangle className="h-4 w-4" />
            {loading ? "Guardando..." : incidente ? "Guardar cambios" : "Registrar incidente"}
          </button>
        </div>
      </form>
    </Modal>
  );
}