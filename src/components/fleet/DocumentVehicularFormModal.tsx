import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DocumentoVehicular, DocumentoVehicularInput, Vehiculo } from "../../types/domain";
import { crearDocumentoVehicular, actualizarDocumentoVehicular } from "../../services/documentoVehicular.service";
import { Modal } from "../ui/Modal";

interface DocumentVehicularFormModalProps {
  documento?: DocumentoVehicular | null;
  vehiculos: Vehiculo[];
  onClose: () => void;
  onSuccess: () => void;
}

const documentoSchema = z.object({
  vehiculoId: z.number().min(1, "Debes seleccionar un vehículo"),
  tipo: z.enum(["SOAT", "TECNOMECANICA", "REVISION_GASES", "POLIZA", "TARJETA_OPERACION"]),
  numero: z.string().min(3, "El número debe tener al menos 3 caracteres"),
  fechaExpedicion: z.string().refine((value) => !!value, "La fecha de expedición es obligatoria"),
  fechaVencimiento: z.string().refine((value) => !!value, "La fecha de vencimiento es obligatoria"),
  archivoAdjunto: z.string().optional().nullable()
});

type DocumentoFormData = z.infer<typeof documentoSchema>;

export function DocumentVehicularFormModal({ documento, vehiculos, onClose, onSuccess }: DocumentVehicularFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<DocumentoFormData>({
    resolver: zodResolver(documentoSchema),
    defaultValues: documento
      ? {
          vehiculoId: documento.vehiculoId,
          tipo: documento.tipo,
          numero: documento.numero,
          fechaExpedicion: documento.fechaExpedicion,
          fechaVencimiento: documento.fechaVencimiento,
          archivoAdjunto: documento.archivoAdjunto
        }
      : {
          tipo: "SOAT"
        }
  });

  const onSubmit = async (data: DocumentoFormData) => {
    try {
      setLoading(true);
      setError(null);

      if (documento) {
        await actualizarDocumentoVehicular(documento.id, data as DocumentoVehicularInput);
      } else {
        await crearDocumentoVehicular(data as DocumentoVehicularInput);
      }

      reset();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar documento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal abierto={true} titulo={documento ? "Editar Documento Vehicular" : "Nuevo Documento Vehicular"} onCerrar={onClose}>
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Vehículo</label>
          <select
            {...register("vehiculoId", { valueAsNumber: true })}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Selecciona un vehículo</option>
            {vehiculos.map((vehiculo) => (
              <option key={vehiculo.id} value={vehiculo.id}>
                {vehiculo.placa} - {vehiculo.tipo}
              </option>
            ))}
          </select>
          {errors.vehiculoId && <p className="text-sm text-red-600">{errors.vehiculoId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Tipo de Documento</label>
          <select
            {...register("tipo")}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="SOAT">SOAT</option>
            <option value="TECNOMECANICA">Tecnomecánica</option>
            <option value="REVISION_GASES">Revisión de Gases</option>
            <option value="POLIZA">Póliza</option>
            <option value="TARJETA_OPERACION">Tarjeta de Operación</option>
          </select>
          {errors.tipo && <p className="text-sm text-red-600">{errors.tipo.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Número</label>
          <input
            type="text"
            {...register("numero")}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.numero && <p className="text-sm text-red-600">{errors.numero.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Fecha de Expedición</label>
            <input
              type="date"
              {...register("fechaExpedicion")}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.fechaExpedicion && <p className="text-sm text-red-600">{errors.fechaExpedicion.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Fecha de Vencimiento</label>
            <input
              type="date"
              {...register("fechaVencimiento")}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.fechaVencimiento && <p className="text-sm text-red-600">{errors.fechaVencimiento.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Archivo Adjuntado (URL o ruta)</label>
          <input
            type="text"
            {...register("archivoAdjunto")}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
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
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
