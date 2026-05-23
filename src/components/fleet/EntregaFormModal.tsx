import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, PenLine, Trash2 } from "lucide-react";
import { EntregaInput, OrdenDespacho } from "../../types/domain";
import { Modal } from "../ui/Modal";

const entregaSchema = z.object({
  fechaEntrega: z.string().min(1, "La fecha de entrega es obligatoria"),
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
  const [firmaError, setFirmaError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [firmaVacia, setFirmaVacia] = useState(true);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EntregaFormData>({
    resolver: zodResolver(entregaSchema),
    defaultValues: {
      fechaEntrega: new Date().toISOString().split("T")[0],
      fotografia: "",
      observaciones: "",
      latitud: undefined,
      longitud: undefined
    }
  });

  // Inicializar canvas
  useEffect(() => {
    if (!abierto) return;
    reset({
      fechaEntrega: new Date().toISOString().split("T")[0],
      fotografia: "",
      observaciones: "",
      latitud: undefined,
      longitud: undefined
    });
    setFirmaVacia(true);
    setFirmaError(null);
    setTimeout(() => limpiarCanvas(), 50);
  }, [abierto, reset]);

  const limpiarCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    ctx.setLineDash([]);
    // Línea guía
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 30);
    ctx.lineTo(canvas.width - 20, canvas.height - 30);
    ctx.stroke();
    setFirmaVacia(true);
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    isDrawingRef.current = true;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setFirmaVacia(false);
  };

  const stopDraw = () => { isDrawingRef.current = false; };

  const obtenerFirmaBase64 = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL("image/png");
  };

  const submit = async (data: EntregaFormData) => {
    if (firmaVacia) {
      setFirmaError("Dibuja la firma del receptor antes de continuar.");
      return;
    }
    const firmaBase64 = obtenerFirmaBase64();
    if (!firmaBase64) {
      setFirmaError("No se pudo capturar la firma. Intenta de nuevo.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setFirmaError(null);
      await onSubmit({
        fechaEntrega: data.fechaEntrega,
        firmaDigital: firmaBase64,
        fotografia: data.fotografia?.trim() || null,
        observaciones: data.observaciones?.trim() || null,
        latitud: data.latitud ?? null,
        longitud: data.longitud ?? null
      });
      reset();
      limpiarCanvas();
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

        {/* Canvas de firma digital */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <PenLine className="h-4 w-4" />
              Firma digital del receptor
            </label>
            <button
              type="button"
              onClick={limpiarCanvas}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Limpiar
            </button>
          </div>
          <div className={`rounded-xl border-2 overflow-hidden ${firmaError ? "border-red-400" : firmaVacia ? "border-dashed border-slate-300" : "border-blue-400"}`}>
            <canvas
              ref={canvasRef}
              width={480}
              height={140}
              className="w-full touch-none cursor-crosshair"
              style={{ display: "block" }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
          </div>
          {firmaVacia && !firmaError && (
            <p className="mt-1 text-xs text-slate-400">Dibuja la firma del receptor en el recuadro de arriba</p>
          )}
          {firmaError && <p className="mt-1 text-sm text-red-600">{firmaError}</p>}
          {!firmaVacia && <p className="mt-1 text-xs text-green-600">✓ Firma capturada</p>}
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
              type="number" step="any"
              {...register("latitud", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Opcional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Longitud</label>
            <input
              type="number" step="any"
              {...register("longitud", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <CheckCircle className="h-4 w-4" />
            {loading ? "Registrando..." : "Registrar entrega"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
