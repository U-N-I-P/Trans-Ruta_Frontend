import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
import { Conductor, Coordenada, NuevaOrdenInput, Vehiculo } from "../../types/domain";
import { Modal } from "../ui/Modal";

interface CreateOrderModalProps {
  abierto: boolean;
  vehiculos: Vehiculo[];
  conductores: Conductor[];
  onCerrar: () => void;
  onCrearOrden: (payload: NuevaOrdenInput) => void;
}

type ModoMapa = "origen" | "destino";

const crearEsquema = (vehiculos: Vehiculo[]) =>
  z
    .object({
      vehiculoId: z.string().min(1, "Seleccione un vehiculo"),
      conductorId: z.string().min(1, "Seleccione un conductor"),
      origen: z.string().min(3, "Ingrese un origen valido"),
      destino: z.string().min(3, "Ingrese un destino valido"),
      pesoCargaKg: z.coerce.number().positive("El peso debe ser mayor a 0")
    })
    .superRefine((data, ctx) => {
      const vehiculo = vehiculos.find((item) => item.id === data.vehiculoId);
      if (!vehiculo) {
        return;
      }

      if (data.pesoCargaKg >= vehiculo.capacidadKg) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El peso debe ser menor a ${vehiculo.capacidadKg} kg para ${vehiculo.placa}`,
          path: ["pesoCargaKg"]
        });
      }
    });

export function CreateOrderModal({
  abierto,
  vehiculos,
  conductores,
  onCerrar,
  onCrearOrden
}: CreateOrderModalProps) {
  const [modoMapa, setModoMapa] = useState<ModoMapa>("origen");
  const [coordenadaOrigen, setCoordenadaOrigen] = useState<Coordenada | undefined>();
  const [coordenadaDestino, setCoordenadaDestino] = useState<Coordenada | undefined>();

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
      origen: "",
      destino: "",
      pesoCargaKg: 0
    }
  });

  const vehiculoSeleccionado = vehiculos.find((item) => item.id === watch("vehiculoId"));

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

  const onSubmit = (values: z.infer<typeof esquema>) => {
    onCrearOrden({
      ...values,
      coordenadasOrigen: coordenadaOrigen,
      coordenadasDestino: coordenadaDestino
    });

    reset();
    setCoordenadaOrigen(undefined);
    setCoordenadaDestino(undefined);
    onCerrar();
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
                .filter((v) => v.estado === "Disponible")
                .map((vehiculo) => (
                  <option key={vehiculo.id} value={vehiculo.id}>
                    {vehiculo.placa} - {vehiculo.tipo} ({vehiculo.capacidadKg} kg)
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
                  <option key={conductor.id} value={conductor.id}>
                    {conductor.nombre} - Lic. {conductor.licencia}
                  </option>
                ))}
            </select>
            {errors.conductorId && <p className="text-xs text-red-600">{errors.conductorId.message}</p>}
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
        </div>

        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-semibold">Peso Carga (kg)</span>
          <input
            type="number"
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            {...register("pesoCargaKg")}
          />
          {vehiculoSeleccionado && (
            <p className="text-xs text-slate-500">Capacidad maxima del vehiculo: {vehiculoSeleccionado.capacidadKg} kg</p>
          )}
          {errors.pesoCargaKg && <p className="text-xs text-red-600">{errors.pesoCargaKg.message}</p>}
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

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
            onClick={onCerrar}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-xl bg-logistics-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-logistics-900"
          >
            Guardar orden
          </button>
        </div>
      </form>
    </Modal>
  );
}
