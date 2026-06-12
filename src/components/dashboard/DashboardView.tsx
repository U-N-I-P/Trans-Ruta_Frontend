import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, Truck, Wrench, Edit2, Bell, Clock, Activity, ShieldAlert, Plus, ShieldCheck, MapPin } from "lucide-react";
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
import { actualizarOrdenDespacho } from "../../services/orden.service";

interface DashboardViewProps {
  ordenes: OrdenDespacho[];
  vehiculos: Vehiculo[];
  conductores: ConductorConDisponibilidad[];
  clientes: Cliente[];
  solicitudesCompra: SolicitudCompra[];
  onCrearOrden: (payload: NuevaOrdenInput) => Promise<OrdenDespacho>;
  busquedaExterna?: string;
}

interface SimulatedVehicle extends Vehiculo {
  lat: number;
  lng: number;
  velocidad: number;
  ultima_actualizacion: string;
  progreso: number;
  ordenCodigo?: string;
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
      return "Camión";
    case "TURBO":
      return "Turbo";
    case "CAMIONETA":
      return "Camioneta";
    default:
      return tipo;
  }
};

function parseCoordenadas(valor?: string | null) {
  if (!valor) return null;
  const partes = valor.split(",").map((item) => Number(item.trim()));
  if (partes.length !== 2 || partes.some((item) => Number.isNaN(item))) return null;
  return { lat: partes[0], lng: partes[1] };
}

function interpolarPunto(origen: { lat: number; lng: number }, destino: { lat: number; lng: number }, progreso: number) {
  const factor = Math.max(0, Math.min(1, progreso / 100));
  return {
    lat: origen.lat + (destino.lat - origen.lat) * factor,
    lng: origen.lng + (destino.lng - origen.lng) * factor,
  };
}

export function DashboardView({
  ordenes,
  vehiculos,
  conductores,
  clientes,
  solicitudesCompra,
  onCrearOrden,
  onActualizar,
  busquedaExterna
}: DashboardViewProps & { onActualizar?: () => Promise<void> }) {
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ordenEnEdicion, setOrdenEnEdicion] = useState<OrdenDespacho | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('edit');
  const [simulatedVehicles, setSimulatedVehicles] = useState<SimulatedVehicle[]>([]);

  const mapaVehiculos = useMemo(() => new Map(vehiculos.map((v) => [String(v.id), v])), [vehiculos]);
  const mapaConductores = useMemo(() => new Map(conductores.map((c) => [String(c.id), c])), [conductores]);
  const mapaClientes = useMemo(() => new Map(clientes.map((cliente) => [String(cliente.id), cliente])), [clientes]);
  const busquedaActiva = busquedaExterna ?? busqueda;

  // Cargar datos simulados de GPS para el mapa central
  useEffect(() => {
    const ordenesActivas = ordenes.filter((orden) => orden.estado === "DESPACHADO" || orden.estado === "EN_RUTA" || orden.estado === "CERCA_DEL_DESTINO");
    const vehiculosEnCalle = vehiculos.filter((vehiculo) => vehiculo.estado === "EN_RUTA" || vehiculo.estado === "DISPONIBLE");

    const initialData = vehiculosEnCalle.map((vehiculo, index) => {
      const orden = ordenesActivas[index % Math.max(ordenesActivas.length, 1)];
      const origen = parseCoordenadas(orden?.origen);
      const destino = parseCoordenadas(orden?.destino);
      const progreso = orden ? progresoEstado[orden.estado] : 0;
      const punto = origen && destino ? interpolarPunto(origen, destino, progreso) : { lat: 4.65 + Math.random() * 0.1, lng: -74.15 + Math.random() * 0.1 };

      return {
        ...vehiculo,
        lat: punto.lat,
        lng: punto.lng,
        velocidad: vehiculo.estado === "EN_RUTA" ? Math.floor(Math.random() * 30) + 50 : 0,
        ultima_actualizacion: new Date().toLocaleTimeString("es-CO"),
        progreso,
        ordenCodigo: orden?.codigo,
      };
    });

    setSimulatedVehicles(initialData);

    const interval = setInterval(() => {
      setSimulatedVehicles((prevData) =>
        prevData.map((v) => {
          if (v.estado !== "EN_RUTA") {
            return { ...v, ultima_actualizacion: new Date().toLocaleTimeString("es-CO") };
          }
          
          const moveLat = (Math.random() - 0.5) * 0.003;
          const moveLng = (Math.random() - 0.5) * 0.003;
          const newVel = Math.floor(Math.random() * 35) + 50; 

          return {
            ...v,
            lat: v.lat + moveLat,
            lng: v.lng + moveLng,
            velocidad: newVel,
            ultima_actualizacion: new Date().toLocaleTimeString("es-CO"),
            progreso: Math.min(100, v.progreso + 2),
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [vehiculos, ordenes]);

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

  // Generar alertas inteligentes basadas en estado operacional
  const alertasInteligentes = useMemo(() => {
    const alerts: { id: string; tipo: "danger" | "warning" | "info"; mensaje: string; tiempo: string }[] = [];
    
    // Alertas de mantenimiento
    vehiculos.forEach(v => {
      if (v.estado === "EN_MANTENIMIENTO") {
        alerts.push({
          id: `mant-${v.id}`,
          tipo: "warning",
          mensaje: `Vehículo ${v.placa} ingresó a mantenimiento preventivo.`,
          tiempo: "Hace 10 min"
        });
      }
    });

    // Alertas de exceso de velocidad simulado
    simulatedVehicles.forEach(v => {
      if (v.velocidad > 80) {
        alerts.push({
          id: `speed-${v.id}`,
          tipo: "danger",
          mensaje: `Exceso de velocidad: ${v.placa} circula a ${v.velocidad} km/h.`,
          tiempo: "En tiempo real"
        });
      }
    });

    // Solicitudes pendientes
    solicitudesCompra.forEach(s => {
      if (s.estado === "PENDIENTE") {
        alerts.push({
          id: `sol-${s.id}`,
          tipo: "info",
          mensaje: `Nueva solicitud de repuesto pendiente de aprobación.`,
          tiempo: "Hace 1 hora"
        });
      }
    });

    return alerts.slice(0, 5); // Tomar las 5 más importantes
  }, [vehiculos, simulatedVehicles, solicitudesCompra]);

  // Cronología operacional (Timeline)
  const cronologiaEventos = useMemo(() => {
    const timeline: { id: string; titulo: string; descripcion: string; hora: string; icono: any }[] = [];

    ordenes.forEach(o => {
      if (o.estado === "ENTREGADO") {
        timeline.push({
          id: `timeline-ent-${o.id}`,
          titulo: `Entrega Exitosa: ${o.codigo}`,
          descripcion: `Despacho entregado en ${o.destino}.`,
          hora: "Hace 12 min",
          icono: ShieldCheck
        });
      } else if (o.estado === "EN_RUTA") {
        timeline.push({
          id: `timeline-rut-${o.id}`,
          titulo: `Tránsito Activo: ${o.codigo}`,
          descripcion: `Vehículo en ruta hacia destino.`,
          hora: "Hace 30 min",
          icono: Activity
        });
      } else if (o.estado === "CERCA_DEL_DESTINO") {
        timeline.push({
          id: `timeline-cerca-${o.id}`,
          titulo: `Notificación de Cercanía: ${o.codigo}`,
          descripcion: `Aproximación detectada a destino final.`,
          hora: "En progreso",
          icono: MapPin
        });
      }
    });

    // Si está vacío, agregar default events
    if (timeline.length === 0) {
      timeline.push({
        id: "default-1",
        titulo: "Operaciones Iniciadas",
        descripcion: "Sincronización de satélites GPS completada.",
        hora: "06:00 AM",
        icono: ShieldCheck
      });
    }

    return timeline.slice(0, 4);
  }, [ordenes]);

  const ordenesFiltradas = useMemo(() => {
    const termino = busquedaActiva.trim().toLowerCase();

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
  }, [busquedaActiva, filtroEstado, mapaConductores, mapaVehiculos, ordenes, mapaClientes]);

  useEffect(() => {
    if (busquedaExterna !== undefined) {
      setBusqueda(busquedaExterna);
    }
  }, [busquedaExterna]);

  const columnas: ColumnaTabla<OrdenDespacho>[] = [
    {
      id: "codigo",
      encabezado: "ID",
      anchoMinimo: "120px",
      celda: (orden) => <span className="font-semibold text-slate-800 dark:text-slate-200">{orden.codigo}</span>
    },
    {
      id: "conductor",
      encabezado: "Conductor",
      anchoMinimo: "180px",
      celda: (orden) => {
        const conductor = orden.conductor ?? mapaConductores.get(String(orden.conductorId));
        return conductor ? `${conductor.nombre} ${conductor.apellido}`.trim() : "Sin asignar";
      }
    },
    {
      id: "vehiculo",
      encabezado: "Vehículo",
      anchoMinimo: "160px",
      celda: (orden) => {
        const vehiculo = orden.vehiculo ?? mapaVehiculos.get(String(orden.vehiculoId));
        return vehiculo ? `${vehiculo.placa} (${formatearTipoVehiculo(vehiculo.tipo)})` : `Vehículo ${orden.vehiculoId}`;
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
      anchoMinimo: "180px",
      celda: (orden) => (
        <div className="space-y-1.5 w-full">
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-500"
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
      anchoMinimo: "120px",
      celda: (orden) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setOrdenEnEdicion(orden);
              setViewMode('edit');
              setModalAbierto(true);
            }}
            className="rounded-lg bg-blue-600/10 border border-blue-500/20 px-2.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 transition hover:bg-blue-600/20"
            title="Editar"
            aria-label="Editar orden"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setOrdenEnEdicion(orden);
              setViewMode('view');
              setModalAbierto(true);
            }}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Ver detalles"
            aria-label="Ver orden"
          >
            <span role="img" aria-hidden="false" aria-label="ojito">👁️</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <section className="space-y-6">
      {/* 4 KPI Widgets Top Row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard titulo="Viajes activos" valor={kpis.viajesActivos} icono={Truck} tono="azul" />
        <KpiCard titulo="Vehículos en mantenimiento" valor={kpis.enMantenimiento} icono={Wrench} tono="ambar" />
        <KpiCard titulo="Conductores disponibles" valor={kpis.conductoresDisponibles} icono={ClipboardCheck} tono="verde" />
        <KpiCard titulo="Solicitudes de compra" valor={kpis.solicitudesPendientes} icono={AlertTriangle} tono="rojo" />
      </div>

      {/* Middle Operations Center Row: Alerts Center (Left) & Timeline of Activity (Right) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Smart Alert Center */}
        <div className="rounded-2xl border border-slate-100/85 bg-white/80 dark:border-slate-800/80 dark:bg-slate-800/80 p-5 shadow-sm backdrop-blur-sm flex flex-col min-h-[300px]">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Bell className="h-4 w-4 text-red-500" />
            <h3 className="font-['Sora'] font-semibold text-slate-900 dark:text-slate-100 text-sm">Centro Inteligente de Alertas</h3>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[260px]">
            {alertasInteligentes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 py-8">
                <ShieldCheck className="h-8 w-8 text-emerald-500 mb-2" />
                <p className="text-xs font-semibold">Todo marcha en orden</p>
                <p className="text-[10px] text-slate-400">Sin novedades críticas registradas</p>
              </div>
            ) : (
              alertasInteligentes.map((alerta) => (
                <div key={alerta.id} className="flex gap-3 items-start border-b border-slate-100 dark:border-slate-800/60 pb-2.5 last:border-b-0">
                  <span className={`p-1.5 rounded-lg mt-0.5 ${
                    alerta.tipo === "danger" 
                      ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400" 
                      : alerta.tipo === "warning"
                        ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400"
                        : "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                  }`}>
                    <ShieldAlert className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">{alerta.mensaje}</p>
                    <span className="text-[9px] text-slate-400 font-medium">{alerta.tiempo}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Timeline of Activity */}
        <div className="rounded-2xl border border-slate-100/85 bg-white/80 dark:border-slate-800/80 dark:bg-slate-800/80 p-5 shadow-sm backdrop-blur-sm flex flex-col min-h-[300px]">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Clock className="h-4 w-4 text-blue-500" />
            <h3 className="font-['Sora'] font-semibold text-slate-900 dark:text-slate-100 text-sm">Actividad Operacional Reciente</h3>
          </div>

          <div className="relative pl-4 space-y-4 border-l border-slate-200 dark:border-slate-800 ml-1.5 flex-1 overflow-y-auto max-h-[260px]">
            {cronologiaEventos.map((evento) => {
              const IconoEvento = evento.icono;
              return (
                <div key={evento.id} className="relative">
                  <span className="absolute -left-[23px] top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-blue-500">
                    <IconoEvento className="h-2.5 w-2.5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{evento.titulo}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{evento.descripcion}</p>
                    <span className="text-[9px] text-slate-400 block mt-1">{evento.hora}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* High-density active orders table bottom row */}
      <section className="rounded-2xl border border-slate-100 bg-white/80 dark:border-slate-800/80 dark:bg-slate-800/80 p-5 shadow-sm backdrop-blur-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-['Sora'] text-lg font-semibold text-slate-900 dark:text-slate-100">Gestión de Despachos</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Monitorea y administra cada Orden de Despacho activa</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar placa, conductor o código..."
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500"
            />
            <select
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="Todos">Todos los Estados</option>
              <option value="DESPACHADO">Despachado</option>
              <option value="EN_RUTA">En ruta</option>
              <option value="CERCA_DEL_DESTINO">Cerca del destino</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
            <button
              type="button"
              onClick={() => setModalAbierto(true)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition shadow-md shadow-blue-500/10 flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva Orden
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
        ordenInicial={ordenEnEdicion}
        onCerrar={() => {
          setModalAbierto(false);
          setOrdenEnEdicion(null);
        }}
        readOnly={viewMode === 'view'}
        onCrearOrden={async (payload) => {
          if (ordenEnEdicion) {
            await actualizarOrdenDespacho(ordenEnEdicion.id, payload as any);
            await onActualizar?.();
            return ordenEnEdicion as OrdenDespacho;
          }

          return await onCrearOrden(payload);
        }}
      />
    </section>
  );
}
