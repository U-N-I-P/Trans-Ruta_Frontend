import { useEffect, useState } from "react";
import { CheckCircle, Calendar, Clock, Image, FileText } from "lucide-react";
import { Entrega } from "../../types/domain";
import { obtenerEntregaPorId } from "../../services/entrega.service";
import { Modal } from "../ui/Modal";

interface EntregaDetalleModalProps {
  abierto: boolean;
  onCerrar: () => void;
  entregaId: number | null;
  ordenCodigo?: string;
}

export function EntregaDetalleModal({ abierto, onCerrar, entregaId, ordenCodigo }: EntregaDetalleModalProps) {
  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto || !entregaId) {
      setEntrega(null);
      return;
    }

    const cargarDetalle = async () => {
      try {
        setLoading(true);
        setError(null);
        const datos = await obtenerEntregaPorId(entregaId);
        setEntrega(datos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al obtener detalles de la entrega");
      } finally {
        setLoading(false);
      }
    };

    void cargarDetalle();
  }, [abierto, entregaId]);

  return (
    <Modal abierto={abierto} titulo={`Detalle de Entrega: ${ordenCodigo || ""}`} onCerrar={onCerrar}>
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando detalles de entrega...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-750 dark:text-red-400">
          {error}
        </div>
      ) : entrega ? (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/30 dark:border-emerald-500/10 p-5 text-emerald-900 dark:text-emerald-300">
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-450 shrink-0" />
            <div>
              <h4 className="text-lg font-bold">¡Entrega Exitosa!</h4>
              <p className="text-sm opacity-90">Los detalles y la firma digital del receptor fueron registrados con éxito.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Detalles generales */}
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-3">
                <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200">
                  <Calendar className="h-4.5 w-4.5 text-blue-500" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Fecha de entrega física</p>
                    <p className="text-sm font-medium">{new Date(entrega.fechaEntrega).toLocaleDateString("es-CO", { dateStyle: "long" })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200">
                  <Clock className="h-4.5 w-4.5 text-sky-500" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Hora de Registro</p>
                    <p className="text-sm font-medium">
                      {new Date(entrega.createdAt).toLocaleTimeString("es-CO", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>

                {entrega.observaciones && (
                  <div className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200">
                    <FileText className="h-4.5 w-4.5 text-indigo-500 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Observaciones</p>
                      <p className="text-sm font-medium whitespace-pre-wrap">{entrega.observaciones}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Firma digital */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Firma digital del receptor</p>
              {entrega.firmaDigital ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={entrega.firmaDigital}
                    alt="Firma del receptor"
                    className="max-h-28 object-contain bg-white rounded border border-slate-100 p-1"
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">Sin firma registrada</p>
              )}
            </div>
          </div>

          {/* Fotografía de evidencia */}
          {entrega.fotografia && (
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <Image className="h-4 w-4 text-emerald-500" />
                <span>Fotografía / evidencia</span>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden max-w-md bg-slate-950">
                <img
                  src={entrega.fotografia}
                  alt="Evidencia fotográfica"
                  className="w-full max-h-56 object-cover"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-xl bg-slate-900 dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-850 dark:hover:bg-slate-700 transition-colors focus:outline-none"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-slate-500">No se encontraron detalles para esta entrega.</p>
      )}
    </Modal>
  );
}
