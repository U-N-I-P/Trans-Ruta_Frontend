import { AlertTriangle } from "lucide-react";
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
  const columnasVehiculos: ColumnaTabla<Vehiculo>[] = [
    {
      id: "placa",
      encabezado: "Placa",
      celda: (vehiculo) => <span className="font-semibold text-slate-800">{vehiculo.placa}</span>
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
            ? "bg-amber-100 text-amber-700"
            : vehiculo.estado === "DISPONIBLE"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-blue-100 text-blue-700";

        return (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${estiloEstado}`}>
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
          <div className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
            <AlertTriangle size={12} />
            Reponer
          </div>
        ) : (
          <span className="text-xs text-emerald-700">Stock saludable</span>
        )
    }
  ];

  return (
    <section className="space-y-6">
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
        <div className="mb-4">
          <h2 className="font-['Sora'] text-xl font-semibold text-slate-900">Inventario de Vehiculos</h2>
          <p className="text-sm text-slate-500">Control de flota para RF1 a RF4</p>
        </div>
        <Table
          columnas={columnasVehiculos}
          datos={vehiculos}
          claveFila={(vehiculo) => String(vehiculo.id)}
          estadoVacio="No hay vehiculos registrados."
        />
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
        <div className="mb-4">
          <h2 className="font-['Sora'] text-xl font-semibold text-slate-900">Inventario de Repuestos</h2>
          <p className="text-sm text-slate-500">Alertas visuales de stock minimo (RF20)</p>
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
