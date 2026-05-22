import { useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, Truck, Wrench } from "lucide-react";
import {
  Cliente,
  ConductorConDisponibilidad,
  NuevaOrdenInput,
  OrdenDespacho,
  SolicitudCompra,
  Vehiculo
} from "../../types/domain";
import { Badge } from "../ui/Badge";
import { ColumnaTabla, Table } from "../ui/Table";
import { KpiCard } from "./KpiCard";
import { CreateOrderModal } from "./CreateOrderModal";

interface DashboardViewProps {
  ordenes: OrdenDespacho[];
  vehiculos: Vehiculo[];
  conductores: ConductorConDisponibilidad[];
  clientes: Cliente[];
  solicitudesCompra: SolicitudCompra[];
  onCrearOrden: (payload: NuevaOrdenInput) => Promise<OrdenDespacho>;
}

const progresoEstado: Record<OrdenDespacho["estado"], number> = {
  DESPACHADO: 25,
  EN_RUTA: 60,
  CERCA_DEL_DESTINO: 80,
  ENTREGADO: 100,
  CANCELADO: 0
};

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

export function DashboardView({
  ordenes,
  vehiculos,
  conductores,
  clientes,
  solicitudesCompra,
  onCrearOrden
}: DashboardViewProps) {
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);

  const mapaVehiculos = useMemo(() => new Map(vehiculos.map((v) => [String(v.id), v])), [vehiculos]);
  const mapaConductores = useMemo(() => new Map(conductores.map((c) => [String(c.id), c])), [conductores]);
  const mapaClientes = useMemo(() => new Map(clientes.map((cliente) => [String(cliente.id), cliente])), [clientes]);

  const kpis = useMemo(() => {
    const viajesActivos = ordenes.filter((o) => o.estado === "DESPACHADO" || o.estado === "EN_RUTA").length;
    const enMantenimiento = vehiculos.filter((v) => v.estado === "EN_MANTENIMIENTO").length;
    const conductoresDisponibles = conductores.filter((c) => c.disponible).length;
    const solicitudesPendientes = solicitudesCompra.filter((s) => s.estado === "PENDIENTE").length;

    return {
      viajesActivos,
      enMantenimiento,
      conductoresDisponibles,
      solicitudesPendientes
    };
  }, [conductores, ordenes, solicitudesCompra, vehiculos]);

  const ordenesFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return ordenes.filter((orden) => {
      const conductor = orden.conductor ?? mapaConductores.get(String(orden.conductorId));
      const vehiculo = orden.vehiculo ?? mapaVehiculos.get(String(orden.vehiculoId));
      const cliente = orden.cliente ?? mapaClientes.get(String(orden.clienteId));

      const coincideEstado = filtroEstado === "Todos" || orden.estado === filtroEstado;
      const coincideBusqueda =
        termino.length === 0 ||
        orden.codigo.toLowerCase().includes(termino) ||
        orden.destino.toLowerCase().includes(termino) ||
        String(orden.vehiculoId).toLowerCase().includes(termino) ||
        conductor?.nombre.toLowerCase().includes(termino) ||
        vehiculo?.placa.toLowerCase().includes(termino) ||
        cliente?.nombre.toLowerCase().includes(termino);

      return coincideEstado && coincideBusqueda;
    });
  }, [busqueda, filtroEstado, mapaConductores, mapaVehiculos, ordenes]);

  const columnas: ColumnaTabla<OrdenDespacho>[] = [
    {
      id: "codigo",
      encabezado: "ID",
      anchoMinimo: "150px",
      celda: (orden) => <span className="font-semibold text-slate-800">{orden.codigo}</span>
    },
    {
      id: "conductor",
      encabezado: "Conductor",
      anchoMinimo: "190px",
      celda: (orden) => {
        const conductor = orden.conductor ?? mapaConductores.get(String(orden.conductorId));
        return conductor ? `${conductor.nombre} ${conductor.apellido}`.trim() : "Sin asignar";
      }
    },
    {
      id: "vehiculo",
      encabezado: "Vehiculo",
      anchoMinimo: "180px",
      celda: (orden) => {
        const vehiculo = orden.vehiculo ?? mapaVehiculos.get(String(orden.vehiculoId));
        return vehiculo ? `${vehiculo.placa} (${formatearTipoVehiculo(vehiculo.tipo)})` : `Vehiculo ${orden.vehiculoId}`;
      }
    },
    {
      id: "destino",
      encabezado: "Destino",
      anchoMinimo: "150px",
      celda: (orden) => orden.destino
    },
    {
      id: "progreso",
      encabezado: "Progreso",
      anchoMinimo: "190px",
      celda: (orden) => (
        <div className="space-y-1">
          <div className="h-2.5 w-full rounded-full bg-slate-200">
            <div
              className="h-2.5 rounded-full bg-logistics-700"
              style={{ width: `${progresoEstado[orden.estado]}%` }}
            />
          </div>
          <Badge estado={orden.estado} />
        </div>
      )
    },
    {
      id: "acciones",
      encabezado: "Acciones",
      anchoMinimo: "140px",
      celda: () => (
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-transform duration-200 hover:scale-105 hover:bg-slate-50">
            Ver
          </button>
          <button className="rounded-lg bg-logistics-800 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-logistics-900 hover:shadow-md">
            Editar
          </button>
        </div>
      )
    }
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard titulo="Viajes activos" valor={kpis.viajesActivos} icono={Truck} tono="azul" />
        <KpiCard titulo="Vehiculos en mantenimiento" valor={kpis.enMantenimiento} icono={Wrench} tono="ambar" />
        <KpiCard titulo="Conductores disponibles" valor={kpis.conductoresDisponibles} icono={ClipboardCheck} tono="verde" />
        <KpiCard
          titulo="Solicitudes de compra pendientes"
          valor={kpis.solicitudesPendientes}
          icono={AlertTriangle}
          tono="rojo"
        />
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm hover:shadow-md transition-shadow duration-300 backdrop-blur-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-['Sora'] text-xl font-semibold text-slate-900">Gestion de Despachos</h2>
            <p className="text-sm text-slate-500">Monitorea y administra cada Orden de Despacho</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar..."
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="DESPACHADO">Despachado</option>
              <option value="EN_RUTA">En ruta</option>
              <option value="CERCA_DEL_DESTINO">Cerca del destino</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
            <button
              type="button"
              onClick={() => setModalAbierto(true)}
              className="rounded-xl bg-logistics-800 px-4 py-2 text-sm font-semibold text-white hover:bg-logistics-900"
            >
              Crear nueva orden
            </button>
          </div>
        </div>

        <Table
          columnas={columnas}
          datos={ordenesFiltradas}
          claveFila={(orden) => String(orden.id)}
          estadoVacio="No hay resultados con los filtros aplicados."
        />
      </section>

      <CreateOrderModal
        abierto={modalAbierto}
        vehiculos={vehiculos}
        conductores={conductores}
        clientes={clientes}
        onCerrar={() => setModalAbierto(false)}
        onCrearOrden={onCrearOrden}
      />
    </section>
  );
}
