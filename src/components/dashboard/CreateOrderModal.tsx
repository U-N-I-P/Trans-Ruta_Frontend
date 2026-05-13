import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
import { Cliente, ConductorConDisponibilidad, Coordenada, NuevaOrdenInput, Vehiculo } from "../../types/domain";
import { Modal } from "../ui/Modal";

interface CreateOrderModalProps {
  abierto: boolean;
  vehiculos: Vehiculo[];
  conductores: ConductorConDisponibilidad[];
  clientes: Cliente[];
  onCerrar: () => void;
  onCrearOrden: (payload: NuevaOrdenInput) => Promise<void>;
}

type ModoMapa = "origen" | "destino";

const formatearTipoVehiculo = (tipo: Vehiculo["tipo"]) => {
  switch (tipo) {
    case "CAMION_CARGA_PESADA":
      return "Camion";
    case "TURBO":
      return "Turbo";
    case "CAMIONETA":
      return "Camioneta";
    default:
      return tipo;
  }
};

const crearEsquema = (vehiculos: Vehiculo[]) =>
  z
    .object({
      vehiculoId: z.string().min(1, "Seleccione un vehiculo"),
      conductorId: z.string().min(1, "Seleccione un conductor"),
      clienteId: z.string().min(1, "Seleccione un cliente"),
      origen: z.string().min(3, "Ingrese un origen valido"),
      destino: z.string().min(3, "Ingrese un destino valido"),
      pesoCarga: z.coerce.number().positive("El peso debe ser mayor a 0"),
      descripcionCarga: z.string().optional(),
      fechaSalida: z.string().optional(),
      fechaEntregaEstimada: z.string().optional()
    })
    .superRefine((data, ctx) => {
      const vehiculo = vehiculos.find((item) => String(item.id) === data.vehiculoId);
      if (!vehiculo) {
        return;
      }

      if (data.pesoCarga >= vehiculo.capacidadCarga) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El peso debe ser menor a ${vehiculo.capacidadCarga} kg para ${vehiculo.placa}`,
          path: ["pesoCarga"]
        });
      }
    });

export function CreateOrderModal({
  abierto,
  vehiculos,
  conductores,
  clientes,
  onCerrar,
  onCrearOrden
}: CreateOrderModalProps) {
  const [modoMapa, setModoMapa] = useState<ModoMapa>("origen");
  const [coordenadaOrigen, setCoordenadaOrigen] = useState<Coordenada | undefined>();
  const [coordenadaDestino, setCoordenadaDestino] = useState<Coordenada | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);

  const esquema = useMemo(() => crearEsquema(vehiculos), [vehiculos]);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<z.infer<typeof esquema>>({
    resolver: zodResolver(esquema),
    defaultValues: {
      vehiculoId: "",
      conductorId: "",
      clienteId: "",
      origen: "",
      destino: "",
      pesoCarga: 0,
      descripcionCarga: "",
      fechaSalida: "",
      fechaEntregaEstimada: ""
    }
  });

  const vehiculoSeleccionado = vehiculos.find((item) => String(item.id) === watch("vehiculoId"));

  const manejarClickMapa = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const coordenada = {
      lat: Number((4.5 + y * 8).toFixed(5)),
      lng: Number((-77 + x * 10).toFixed(5))
    };

    if (modoMapa === "origen") {
      setCoordenadaOrigen(coordenada);
    } else {
      setCoordenadaDestino(coordenada);
    }
  };

  const onSubmit = async (values: z.infer<typeof esquema>) => {
    setErrorSubmit(null);
    setIsSubmitting(true);

    try {
      await onCrearOrden({
        vehiculoId: Number(values.vehiculoId),
        conductorId: Number(values.conductorId),
        clienteId: Number(values.clienteId),
        origen: values.origen,
        destino: values.destino,
        pesoCarga: values.pesoCarga,
        descripcionCarga: values.descripcionCarga?.trim() || null,
        fechaSalida: values.fechaSalida || null,
        fechaEntregaEstimada: values.fechaEntregaEstimada || null
      });

      reset();
      setCoordenadaOrigen(undefined);
      setCoordenadaDestino(undefined);
      onCerrar();
    } catch (err) {
      console.error(err);
      setErrorSubmit("No se pudo crear la orden. Verifica la conexión con el backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal abierto={abierto} titulo="Crear Orden de Despacho" onCerrar={onCerrar}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-semibold">Vehiculo</span>
            <select className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register("vehiculoId")}>
              <option value="">Seleccione...</option>
              {vehiculos
                .filter((v) => v.estado === "DISPONIBLE")
                .map((vehiculo) => (
                  <option key={vehiculo.id} value={String(vehiculo.id)}>
                    {vehiculo.placa} - {formatearTipoVehiculo(vehiculo.tipo)} ({vehiculo.capacidadCarga} kg)
                  </option>
                ))}
            </select>
            {errors.vehiculoId && <p className="text-xs text-red-600">{errors.vehiculoId.message}</p>}
          </label>

          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-semibold">Conductor</span>
            <select className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register("conductorId")}>
              <option value="">Seleccione...</option>
              {conductores
                .filter((c) => c.disponible)
                .map((conductor) => (
                  <option key={conductor.id} value={String(conductor.id)}>
                    {conductor.nombre} {conductor.apellido} - Lic. {conductor.numeroLicencia}
                  </option>
                ))}
            </select>
            {errors.conductorId && <p className="text-xs text-red-600">{errors.conductorId.message}</p>}
          </label>

          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-semibold">Cliente</span>
            <select className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register("clienteId")}>
              <option value="">Seleccione...</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={String(cliente.id)}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
            {errors.clienteId && <p className="text-xs text-red-600">{errors.clienteId.message}</p>}
          </label>

          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-semibold">Origen</span>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Ciudad o centro logistico"
              {...register("origen")}
            />
            {errors.origen && <p className="text-xs text-red-600">{errors.origen.message}</p>}
          </label>

          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-semibold">Destino</span>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Ciudad o punto de entrega"
              {...register("destino")}
            />
            {errors.destino && <p className="text-xs text-red-600">{errors.destino.message}</p>}
          </label>

          <label className="space-y-1 text-sm text-slate-700 md:col-span-2">
            <span className="font-semibold">Descripcion de la carga</span>
            <textarea
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              rows={3}
              placeholder="Descripcion opcional de la carga"
              {...register("descripcionCarga")}
            />
          </label>

          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-semibold">Fecha de salida</span>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2" type="date" {...register("fechaSalida")} />
          </label>

          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-semibold">Fecha estimada de entrega</span>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              type="date"
              {...register("fechaEntregaEstimada")}
            />
          </label>
        </div>

        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-semibold">Peso Carga (kg)</span>
          <input
            type="number"
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            {...register("pesoCarga")}
          />
          {vehiculoSeleccionado && (
            <p className="text-xs text-slate-500">
              Capacidad maxima del vehiculo: {vehiculoSeleccionado.capacidadCarga} kg
            </p>
          )}
          {errors.pesoCarga && <p className="text-xs text-red-600">{errors.pesoCarga.message}</p>}
        </label>

        <section className="rounded-xl border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-slate-800">Placeholder react-leaflet</p>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                className={`rounded-lg px-3 py-1.5 ${
                  modoMapa === "origen" ? "bg-logistics-800 text-white" : "bg-slate-100 text-slate-600"
                }`}
                onClick={() => setModoMapa("origen")}
              >
                Seleccionar origen
              </button>
              <button
                type="button"
                className={`rounded-lg px-3 py-1.5 ${
                  modoMapa === "destino" ? "bg-logistics-800 text-white" : "bg-slate-100 text-slate-600"
                }`}
                onClick={() => setModoMapa("destino")}
              >
                Seleccionar destino
              </button>
            </div>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={manejarClickMapa}
            onKeyDown={() => undefined}
            className="flex h-44 cursor-crosshair items-center justify-center rounded-xl border border-dashed border-logistics-700/60 bg-gradient-to-br from-blue-50 to-cyan-50 text-center"
          >
            <div className="text-sm text-slate-700">
              <MapPin className="mx-auto mb-2 text-logistics-800" size={18} />
              <p>Haz clic para fijar coordenadas de {modoMapa}</p>
              <p className="text-xs text-slate-500">Integrable a react-leaflet reemplazando este contenedor</p>
            </div>
          </div>
          <div className="mt-2 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
            <p>
              Origen: {coordenadaOrigen ? `${coordenadaOrigen.lat}, ${coordenadaOrigen.lng}` : "No definido"}
            </p>
            <p>
              Destino: {coordenadaDestino ? `${coordenadaDestino.lat}, ${coordenadaDestino.lng}` : "No definido"}
            </p>
          </div>
        </section>

        {errorSubmit && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{errorSubmit}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
            onClick={onCerrar}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-logistics-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-logistics-900 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Guardando..." : "Guardar orden"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
