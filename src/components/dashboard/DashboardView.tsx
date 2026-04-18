import { useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, Truck, Wrench } from "lucide-react";
import { Conductor, NuevaOrdenInput, OrdenDespacho, SolicitudCompra, Vehiculo } from "../../types/domain";
import { Badge } from "../ui/Badge";
import { ColumnaTabla, Table } from "../ui/Table";
import { KpiCard } from "./KpiCard";
import { CreateOrderModal } from "./CreateOrderModal";

interface DashboardViewProps {
  ordenes: OrdenDespacho[];
  vehiculos: Vehiculo[];
  conductores: Conductor[];
  solicitudesCompra: SolicitudCompra[];
  onCrearOrden: (payload: NuevaOrdenInput) => void;
}

const progresoEstado = {
  Despachado: 25,
  "En Ruta": 60,
  Entregado: 100,
  Incidente: 40
};

export function DashboardView({
  ordenes,
  vehiculos,
  conductores,
  solicitudesCompra,
  onCrearOrden
}: DashboardViewProps) {
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);

  const mapaVehiculos = useMemo(() => new Map(vehiculos.map((v) => [v.id, v])), [vehiculos]);
  const mapaConductores = useMemo(() => new Map(conductores.map((c) => [c.id, c])), [conductores]);

  const kpis = useMemo(() => {
    const viajesActivos = ordenes.filter((o) => o.estado === "Despachado" || o.estado === "En Ruta").length;
    const enMantenimiento = vehiculos.filter((v) => v.estado === "Mantenimiento").length;
    const conductoresDisponibles = conductores.filter((c) => c.disponible).length;
    const solicitudesPendientes = solicitudesCompra.filter((s) => s.estado === "Pendiente").length;

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
      const conductor = mapaConductores.get(orden.conductorId);
      const vehiculo = mapaVehiculos.get(orden.vehiculoId);

      const coincideEstado = filtroEstado === "Todos" || orden.estado === filtroEstado;
      const coincideBusqueda =
        termino.length === 0 ||
        orden.codigo.toLowerCase().includes(termino) ||
        orden.destino.toLowerCase().includes(termino) ||
        conductor?.nombre.toLowerCase().includes(termino) ||
        vehiculo?.placa.toLowerCase().includes(termino);

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
      celda: (orden) => mapaConductores.get(orden.conductorId)?.nombre ?? "Sin asignar"
    },
    {
      id: "vehiculo",
      encabezado: "Vehiculo",
      anchoMinimo: "180px",
      celda: (orden) => {
        const vehiculo = mapaVehiculos.get(orden.vehiculoId);
        return vehiculo ? `${vehiculo.placa} (${vehiculo.tipo})` : "No definido";
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
          <button className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600">
            Ver
          </button>
          <button className="rounded-lg bg-logistics-800 px-3 py-1 text-xs font-semibold text-white">Editar</button>
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

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
              <option>Todos</option>
              <option>Despachado</option>
              <option>En Ruta</option>
              <option>Entregado</option>
              <option>Incidente</option>
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
          claveFila={(orden) => orden.id}
          estadoVacio="No hay resultados con los filtros aplicados."
        />
      </section>

      <CreateOrderModal
        abierto={modalAbierto}
        vehiculos={vehiculos}
        conductores={conductores}
        onCerrar={() => setModalAbierto(false)}
        onCrearOrden={onCrearOrden}
      />
    </section>
  );
}
