import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Signature } from "lucide-react";
import { EntregaInput, OrdenDespacho } from "../../types/domain";
import { Modal } from "../ui/Modal";

const entregaSchema = z.object({
  fechaEntrega: z.string().min(1, "La fecha de entrega es obligatoria"),
  firmaDigital: z.string().min(3, "La firma digital es obligatoria"),
  fotografia: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  latitud: z.union([z.number(), z.undefined(), z.null()]).optional(),
  longitud: z.union([z.number(), z.undefined(), z.null()]).optional()
});

type EntregaFormData = z.infer<typeof entregaSchema>;

interface EntregaFormModalProps {
  abierto: boolean;
  orden: OrdenDespacho | null;
  onClose: () => void;
  onSubmit: (payload: EntregaInput) => Promise<void>;
}

export function EntregaFormModal({ abierto, orden, onClose, onSubmit }: EntregaFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<EntregaFormData>({
    resolver: zodResolver(entregaSchema),
    defaultValues: {
      fechaEntrega: new Date().toISOString().split("T")[0],
      firmaDigital: "",
      fotografia: "",
      observaciones: "",
      latitud: undefined,
      longitud: undefined
    }
  });

  useEffect(() => {
    if (!abierto) {
      return;
    }

    reset({
      fechaEntrega: new Date().toISOString().split("T")[0],
      firmaDigital: "",
      fotografia: "",
      observaciones: "",
      latitud: undefined,
      longitud: undefined
    });
  }, [abierto, reset]);

  const submit = async (data: EntregaFormData) => {
    try {
      setLoading(true);
      setError(null);

      await onSubmit({
        fechaEntrega: data.fechaEntrega,
        firmaDigital: data.firmaDigital.trim(),
        fotografia: data.fotografia?.trim() || null,
        observaciones: data.observaciones?.trim() || null,
        latitud: data.latitud ?? null,
        longitud: data.longitud ?? null
      });

      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar la entrega");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal abierto={abierto} titulo="Registrar Entrega" onCerrar={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(submit)}>
        {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Orden seleccionada</p>
          <p className="text-sm text-slate-600">{orden ? `${orden.codigo} - ${orden.origen} → ${orden.destino}` : "Sin orden seleccionada"}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Fecha de entrega</label>
          <input
            type="date"
            {...register("fechaEntrega")}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.fechaEntrega && <p className="text-sm text-red-600">{errors.fechaEntrega.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Firma digital</label>
          <input
            type="text"
            {...register("firmaDigital")}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Nombre o firma textual"
          />
          {errors.firmaDigital && <p className="text-sm text-red-600">{errors.firmaDigital.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Fotografía / evidencia</label>
          <input
            type="text"
            {...register("fotografia")}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="URL o ruta de imagen"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Observaciones</label>
          <textarea
            {...register("observaciones")}
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Comentarios opcionales"
          />
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
              placeholder="Opcional"
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
              placeholder="Opcional"
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
            <CheckCircle className="h-4 w-4" />
            {loading ? "Registrando..." : "Registrar entrega"}
          </button>
        </div>
      </form>
    </Modal>
  );
}