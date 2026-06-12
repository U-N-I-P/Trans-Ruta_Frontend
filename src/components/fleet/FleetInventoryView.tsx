import { useMemo, useState } from "react";
import { AlertTriangle, Activity, Filter, Search, Truck, Wrench } from "lucide-react";
import { Repuesto, Vehiculo } from "../../types/domain";
import { ColumnaTabla, Table } from "../ui/Table";

interface FleetInventoryViewProps {
  vehiculos: Vehiculo[];
  repuestos: Repuesto[];
}

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

const formatearEstadoVehiculo = (estado: Vehiculo["estado"]) => {
  switch (estado) {
    case "DISPONIBLE":
      return "Disponible";
    case "EN_RUTA":
      return "En ruta";
    case "EN_MANTENIMIENTO":
      return "Mantenimiento";
    case "FUERA_DE_SERVICIO":
      return "Fuera de servicio";
    default:
      return estado;
  }
};

export function FleetInventoryView({ vehiculos, repuestos }: FleetInventoryViewProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"TODOS" | Vehiculo["estado"]>("TODOS");

  const vehiculosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return vehiculos.filter((vehiculo) => {
      const coincideBusqueda =
        texto.length === 0 ||
        vehiculo.placa.toLowerCase().includes(texto) ||
        formatearTipoVehiculo(vehiculo.tipo).toLowerCase().includes(texto);

      const coincideEstado = filtroEstado === "TODOS" || vehiculo.estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [busqueda, filtroEstado, vehiculos]);

  const repuestosCriticos = useMemo(
    () => repuestos.filter((repuesto) => repuesto.stockActual <= repuesto.stockMinimo),
    [repuestos]
  );

  const resumenFlota = useMemo(() => {
    const disponibles = vehiculos.filter((vehiculo) => vehiculo.estado === "DISPONIBLE").length;
    const enRuta = vehiculos.filter((vehiculo) => vehiculo.estado === "EN_RUTA").length;
    const enMantenimiento = vehiculos.filter((vehiculo) => vehiculo.estado === "EN_MANTENIMIENTO").length;
    const fueraServicio = vehiculos.filter((vehiculo) => vehiculo.estado === "FUERA_DE_SERVICIO").length;

    return { disponibles, enRuta, enMantenimiento, fueraServicio };
  }, [vehiculos]);

  const columnasVehiculos: ColumnaTabla<Vehiculo>[] = [
    {
      id: "placa",
      encabezado: "Placa",
      celda: (vehiculo) => <span className="font-semibold text-slate-900 dark:text-slate-100">{vehiculo.placa}</span>
    },
    {
      id: "tipo",
      encabezado: "Tipo",
      celda: (vehiculo) => formatearTipoVehiculo(vehiculo.tipo)
    },
    {
      id: "capacidad",
      encabezado: "Capacidad (kg)",
      celda: (vehiculo) => vehiculo.capacidadCarga
    },
    {
      id: "estado",
      encabezado: "Estado Mantenimiento",
      celda: (vehiculo) => {
        const estiloEstado =
          vehiculo.estado === "EN_MANTENIMIENTO"
            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/30 dark:border-amber-500/10"
            : vehiculo.estado === "DISPONIBLE"
              ? "bg-green-50 text-green-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-green-200/30 dark:border-emerald-500/10"
              : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/30 dark:border-blue-500/10";

        return (
          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${estiloEstado}`}>
            {formatearEstadoVehiculo(vehiculo.estado)}
          </span>
        );
      }
    }
  ];

  const columnasRepuestos: ColumnaTabla<Repuesto>[] = [
    {
      id: "nombre",
      encabezado: "Repuesto",
      celda: (repuesto) => repuesto.nombre
    },
    {
      id: "stock",
      encabezado: "Stock Actual",
      celda: (repuesto) => repuesto.stockActual
    },
    {
      id: "minimo",
      encabezado: "Stock Minimo",
      celda: (repuesto) => repuesto.stockMinimo
    },
    {
      id: "referencia",
      encabezado: "Referencia",
      celda: (repuesto) => repuesto.referencia || "N/A"
    },
    {
      id: "precio",
      encabezado: "Precio",
      celda: (repuesto) => `$${repuesto.precio.toFixed(2)}`
    },
    {
      id: "alerta",
      encabezado: "Alerta",
      celda: (repuesto) =>
        repuesto.stockActual <= repuesto.stockMinimo ? (
          <div className="inline-flex items-center gap-1 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200/30 dark:border-red-500/10 px-2 py-1 text-xs font-semibold text-red-700 dark:text-red-400">
            <AlertTriangle size={12} />
            Reponer
          </div>
        ) : (
          <span className="text-xs text-emerald-700 dark:text-emerald-450 font-medium">Stock saludable</span>
        )
    }
  ];

  const estados = [
    { key: "TODOS" as const, label: "Todos", total: vehiculos.length },
    { key: "DISPONIBLE" as const, label: "Disponibles", total: resumenFlota.disponibles },
    { key: "EN_RUTA" as const, label: "En ruta", total: resumenFlota.enRuta },
    { key: "EN_MANTENIMIENTO" as const, label: "Mantenimiento", total: resumenFlota.enMantenimiento },
    { key: "FUERA_DE_SERVICIO" as const, label: "Fuera de servicio", total: resumenFlota.fueraServicio }
  ];

  return (
    <section className="space-y-6">
      {/* Header Panel */}
      <article className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 dark:text-slate-300">
              <Truck size={14} /> Gestión Flota
            </p>
            <h2 className="mt-3 font-['Sora'] text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">Inventario operativo de vehículos</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Revisa disponibilidad, mantenimiento y alertas de repuestos con una vista más rápida y dinámica.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[520px]">
            <StatCard titulo="Vehículos" valor={vehiculos.length} icono={Truck} />
            <StatCard titulo="Disponibles" valor={resumenFlota.disponibles} icono={Activity} />
            <StatCard titulo="En mantenimiento" valor={resumenFlota.enMantenimiento} icono={Wrench} />
            <StatCard titulo="Alertas repuestos" valor={repuestosCriticos.length} icono={AlertTriangle} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-3 text-slate-700 dark:text-slate-300">
            <Search size={18} className="shrink-0 text-slate-400 dark:text-slate-500" />
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por placa o tipo..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100"
            />
          </label>

          <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2">
            <Filter size={16} className="ml-1 shrink-0 text-slate-400 dark:text-slate-500" />
            {estados.map((estado) => {
              const activo = filtroEstado === estado.key;
              return (
                <button
                  key={estado.key}
                  type="button"
                  onClick={() => setFiltroEstado(estado.key)}
                  className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${activo ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                >
                  {estado.label} <span className="ml-1 opacity-70">{estado.total}</span>
                </button>
              );
            })}
          </div>
        </div>
      </article>

      {/* Vehiculos Table Panel */}
      <article className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-panel backdrop-blur-sm lg:p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-['Sora'] text-xl font-semibold text-slate-900 dark:text-slate-100">Vehículos</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {vehiculosFiltrados.length} resultado{vehiculosFiltrados.length === 1 ? "" : "s"} de {vehiculos.length}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1">Disponibles: {resumenFlota.disponibles}</span>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1">Ruta: {resumenFlota.enRuta}</span>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1">Mantenimiento: {resumenFlota.enMantenimiento}</span>
          </div>
        </div>
        <Table
          columnas={columnasVehiculos}
          datos={vehiculosFiltrados}
          claveFila={(vehiculo) => String(vehiculo.id)}
          estadoVacio="No hay vehiculos registrados."
        />
      </article>

      {/* Repuestos Table Panel */}
      <article className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-panel backdrop-blur-sm lg:p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-['Sora'] text-xl font-semibold text-slate-900 dark:text-slate-100">Inventario de repuestos</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Alertas visuales de stock mínimo y costos estimados</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="rounded-full bg-red-50 dark:bg-red-950/30 px-3 py-1 text-red-700 dark:text-red-400 border border-red-200/20 dark:border-red-500/10">Críticos: {repuestosCriticos.length}</span>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1">Total: {repuestos.length}</span>
          </div>
        </div>
        <Table
          columnas={columnasRepuestos}
          datos={repuestos}
          claveFila={(repuesto) => String(repuesto.id)}
          estadoVacio="No hay repuestos cargados."
        />
      </article>
    </section>
  );
}

function StatCard({
  titulo,
  valor,
  icono: Icono
}: {
  titulo: string;
  valor: number;
  icono: typeof Truck;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{titulo}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{valor}</p>
        </div>
        <Icono size={18} className="text-slate-700 dark:text-slate-300" />
      </div>
    </div>
  );
}
