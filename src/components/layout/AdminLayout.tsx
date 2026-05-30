import { useEffect, useMemo, useState } from "react";
import { DashboardView } from "../dashboard/DashboardView";
import { FleetInventoryView } from "../fleet/FleetInventoryView";
import { VehicleListView } from "../fleet/VehicleListView";
import { ConductorListView } from "../fleet/ConductorListView";
import { DocumentVehicularListView } from "../fleet/DocumentVehicularListView";
import { CombustibleListView } from "../fleet/CombustibleListView";
import { ViaticosListView } from "../fleet/ViaticosListView";
import { IncidentesListView } from "../fleet/IncidentesListView";
import { ReportesListView } from "../fleet/ReportesListView";
import { AuditoriaListView } from "../fleet/AuditoriaListView";
import { MantenimientoListView } from "../fleet/MantenimientoListView";
import { EntregasListView } from "../fleet/EntregasListView";
import { AsignacionInteligenteView } from "../fleet/AsignacionInteligenteView";
import { EvaluacionConductoresView } from "../fleet/EvaluacionConductoresView";
import { OrdenesListView } from "../fleet/OrdenesListView";
import { ComprasListView } from "../fleet/ComprasListView";
import { GPSTrackingView } from "../fleet/GPSTrackingView";
import { ManifiestosListView } from "../fleet/ManifiestosListView";
import { ControlOperativoView } from "../fleet/ControlOperativoView";
import { InventarioRepuestosView } from "../fleet/InventarioRepuestosView";
import { PortalClienteView } from "../fleet/PortalClienteView";
import { Sidebar, VistaPrincipal } from "./Sidebar";
import { Topbar } from "./Topbar";
import { obtenerConductores } from "../../services/conductor.service";
import { obtenerClientes } from "../../services/cliente.service";
import { obtenerVehiculos } from "../../services/vehiculo.service";
import { crearOrdenDespacho, obtenerOrdenesDespacho } from "../../services/orden.service";
import { obtenerNotificaciones } from "../../services/notificacion.service";
import { crearViatico, obtenerViaticos } from "../../services/viatico.service";
import { obtenerRepuestos } from "../../services/repuesto.service";
import { obtenerSolicitudesCompra } from "../../services/solicitudCompra.service";
import {
  Cliente,
  Conductor,
  Notificacion,
  NotificacionIncidente,
  NuevaOrdenInput,
  OrdenDespacho,
  Repuesto,
  SolicitudCompra,
  Vehiculo
} from "../../types/domain";
import { Viatico } from "../../services/viatico.service";

interface AdminLayoutProps {
  onCerrarSesion: () => void;
}

const REQUEST_TIMEOUT_MS = 10000;

function withTimeout<T>(promise: Promise<T>, label: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_resolve, reject) => {
      setTimeout(() => reject(new Error(`Tiempo de espera agotado para ${label}`)), timeoutMs);
    })
  ]);
}

/**
 * Adaptador: Convierte Notificacion (backend) a NotificacionIncidente (formato legacy para Topbar)
 */
function adaptarNotificacionesParaTopbar(notificaciones: Notificacion[]): NotificacionIncidente[] {
  const mapeoTipoASeveridad = {
    ESTADO_ENVIO: "Media" as const,
    INCIDENTE: "Alta" as const,
    STOCK_BAJO: "Media" as const,
    MANTENIMIENTO: "Media" as const,
    SISTEMA: "Baja" as const
  };

  const mapeoTitulos = {
    ESTADO_ENVIO: "Cambio de estado",
    INCIDENTE: "Incidente reportado",
    STOCK_BAJO: "Stock bajo",
    MANTENIMIENTO: "Mantenimiento requerido",
    SISTEMA: "Notificación del sistema"
  };

  return notificaciones.map((notif) => ({
    id: String(notif.id),
    titulo: mapeoTitulos[notif.tipo],
    descripcion: notif.mensaje,
    severidad: mapeoTipoASeveridad[notif.tipo],
    fecha: notif.fecha
  }));
}

export function AdminLayout({ onCerrarSesion }: AdminLayoutProps) {
  const [colapsado, setColapsado] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const STORAGE_KEY = "transruta:vistaActiva";

  const validarVista = (v: string | null): VistaPrincipal => {
    const opciones: VistaPrincipal[] = [
      "panel",
      "flota",
      "vehiculos",
      "conductores",
      "documentos",
      "mantenimiento",
      "entregas",
      "ordenes",
      "incidentes",
      "viaticos",
      "combustible",
      "asignacion",
      "evaluacion",
      "compras",
      "gps",
      "manifiestos",
      "operativo",
      "inventario",
      "clientes",
      "reportes",
      "auditoria"
    ];

    if (!v) return "panel";
    return opciones.includes(v as VistaPrincipal) ? (v as VistaPrincipal) : "panel";
  };

  const [vistaActiva, setVistaActiva] = useState<VistaPrincipal>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return validarVista(saved);
    } catch (err) {
      return "panel";
    }
  });

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenDespacho[]>([]);
  const [notificacionesBackend, setNotificacionesBackend] = useState<Notificacion[]>([]);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [solicitudesCompra, setSolicitudesCompra] = useState<SolicitudCompra[]>([]);
  const [viaticos, setViaticos] = useState<Viatico[]>([]);
  const [busquedaGlobal, setBusquedaGlobal] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Adaptador de notificaciones para Topbar (formato legacy)
  const notificaciones = useMemo(
    () => adaptarNotificacionesParaTopbar(notificacionesBackend),
    [notificacionesBackend]
  );

  const cargarDatos = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled([
        withTimeout(obtenerVehiculos(), "vehiculos"),
        withTimeout(obtenerConductores(), "conductores"),
        withTimeout(obtenerClientes(), "clientes"),
        withTimeout(obtenerOrdenesDespacho(), "ordenes-despacho"),
        withTimeout(obtenerNotificaciones(), "notificaciones"),
        withTimeout(obtenerViaticos(), "viaticos"),
        withTimeout(obtenerRepuestos(), "repuestos"),
        withTimeout(obtenerSolicitudesCompra(), "solicitudes-compra")
      ]);

      const fallos: string[] = [];

      if (results[0].status === "fulfilled") {
        setVehiculos(results[0].value);
      } else {
        setVehiculos([]);
        fallos.push("vehiculos");
      }

      if (results[1].status === "fulfilled") {
        setConductores(results[1].value);
      } else {
        setConductores([]);
        fallos.push("conductores");
      }

      if (results[2].status === "fulfilled") {
        setClientes(results[2].value);
      } else {
        setClientes([]);
        fallos.push("clientes");
      }

      if (results[3].status === "fulfilled") {
        setOrdenes(results[3].value);
      } else {
        setOrdenes([]);
        fallos.push("ordenes-despacho");
      }

      if (results[4].status === "fulfilled") {
        setNotificacionesBackend(results[4].value);
      } else {
        setNotificacionesBackend([]);
        fallos.push("notificaciones");
      }

      if (results[5].status === "fulfilled") {
        setViaticos(results[5].value);
      } else {
        setViaticos([]);
        fallos.push("viaticos");
      }

      if (results[6].status === "fulfilled") {
        setRepuestos(results[6].value);
      } else {
        setRepuestos([]);
        fallos.push("repuestos");
      }

      if (results[7].status === "fulfilled") {
        setSolicitudesCompra(results[7].value);
      } else {
        setSolicitudesCompra([]);
        fallos.push("solicitudes-compra");
      }

      if (fallos.length > 0) {
        setError(
          `Algunos datos no cargaron (${fallos.join(", ")}). Verifica VITE_API_URL, backend y token de autenticación.`
        );
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los datos del panel. Verifica que el backend esté disponible.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void cargarDatos();
  }, []);

  // Escuchar eventos globales para refrescar datos desde otros componentes (p.ej. crear notificación)
  useEffect(() => {
    const handler = (ev: Event) => {
      try {
        const ce = ev as CustomEvent;
        const scope = ce?.detail?.scope as string | undefined;
        if (!scope || scope === "notificaciones") {
          void cargarDatos();
        }
      } catch (err) {
        void cargarDatos();
      }
    };

    window.addEventListener("transruta:refreshData", handler as EventListener);
    return () => window.removeEventListener("transruta:refreshData", handler as EventListener);
  }, []);

  const conductoresConDisponibilidad = useMemo(
    () =>
      conductores.map((conductor) => {
        const tieneOrdenActiva = ordenes.some(
          (orden) =>
            String(orden.conductorId) === String(conductor.id) &&
            (orden.estado === "DESPACHADO" || orden.estado === "EN_RUTA")
        );

        return {
          ...conductor,
          disponible: !tieneOrdenActiva
        };
      }),
    [conductores, ordenes]
  );

  const margenContenido = useMemo(() => {
    return "lg:ml-[112px]"; // 16px margin + 80px width + 16px padding
  }, [colapsado]);

  const crearOrden = async (payload: NuevaOrdenInput) => {
    const orden = await crearOrdenDespacho(payload);

    if (payload.viaticoMonto && payload.viaticoMonto > 0) {
      await crearViatico({
        conductorId: payload.conductorId,
        ordenDeDespachoId: orden.id,
        monto: payload.viaticoMonto,
        saldo: payload.viaticoMonto,
        estado: "APROBADO",
        fecha: payload.fechaSalida ?? new Date().toISOString().split("T")[0],
        descripcion: `Viático asignado para la orden ${orden.codigo}`
      });
    }

    await cargarDatos();
    return orden;
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-white to-blue-50/30">
      <Sidebar
        colapsado={colapsado}
        movilAbierto={movilAbierto}
        vistaActiva={vistaActiva}
        onCerrarMovil={() => setMovilAbierto(false)}
        onAlternarColapsado={() => setColapsado((prev) => !prev)}
        onCambiarVista={(vista) => {
          try {
            localStorage.setItem(STORAGE_KEY, vista);
          } catch (err) {
            // ignore
          }
          setVistaActiva(vista);
          setMovilAbierto(false);
        }}
      />

      <main className={`transition-all duration-300 ${margenContenido}`}>
        <Topbar
          notificaciones={notificaciones}
          onAbrirMovil={() => setMovilAbierto(true)}
          onCerrarSesion={onCerrarSesion}
          busquedaGlobal={busquedaGlobal}
          onBusquedaGlobalChange={setBusquedaGlobal}
        />
        <div className="p-4 lg:p-8">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-panel">
              <h2 className="text-lg font-semibold">No se pudo cargar el panel</h2>
              <p className="mt-2 text-sm text-red-800">{error}</p>
              <button
                type="button"
                onClick={() => void cargarDatos()}
                className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          ) : isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-panel">
              Cargando datos reales del backend...
            </div>
          ) : vistaActiva === "panel" ? (
            <DashboardView
              ordenes={ordenes}
              vehiculos={vehiculos}
              conductores={conductoresConDisponibilidad}
              clientes={clientes}
              solicitudesCompra={solicitudesCompra}
              onCrearOrden={crearOrden}
              onActualizar={cargarDatos}
              busquedaExterna={busquedaGlobal}
            />
          ) : vistaActiva === "vehiculos" ? (
            <VehicleListView onActualizar={cargarDatos} />
          ) : vistaActiva === "conductores" ? (
            <ConductorListView onActualizar={cargarDatos} />
          ) : vistaActiva === "documentos" ? (
            <DocumentVehicularListView />
          ) : vistaActiva === "ordenes" ? (
            <OrdenesListView
              ordenes={ordenes}
              vehiculos={vehiculos}
              conductores={conductoresConDisponibilidad}
              clientes={clientes}
              viaticos={viaticos}
              onCrearOrden={crearOrden}
              onActualizar={cargarDatos}
            />
          ) : vistaActiva === "mantenimiento" ? (
            <MantenimientoListView vehiculos={vehiculos} />
          ) : vistaActiva === "entregas" ? (
            <EntregasListView ordenes={ordenes} onActualizar={cargarDatos} />
          ) : vistaActiva === "combustible" ? (
            <CombustibleListView vehiculos={vehiculos} ordenes={ordenes} />
          ) : vistaActiva === "viaticos" ? (
            <ViaticosListView conductores={conductores} ordenes={ordenes} />
          ) : vistaActiva === "asignacion" ? (
            <AsignacionInteligenteView ordenes={ordenes} vehiculos={vehiculos} conductores={conductores} />
          ) : vistaActiva === "evaluacion" ? (
            <EvaluacionConductoresView conductores={conductores} />
          ) : vistaActiva === "compras" ? (
            <ComprasListView />
          ) : vistaActiva === "gps" ? (
            <GPSTrackingView vehiculos={vehiculos} ordenes={ordenes} />
          ) : vistaActiva === "manifiestos" ? (
            <ManifiestosListView ordenes={ordenes} />
          ) : vistaActiva === "operativo" ? (
            <ControlOperativoView conductores={conductoresConDisponibilidad} />
          ) : vistaActiva === "inventario" ? (
            <InventarioRepuestosView />
          ) : vistaActiva === "clientes" ? (
            <PortalClienteView clientes={clientes} ordenes={ordenes} notificaciones={notificacionesBackend} />
          ) : vistaActiva === "incidentes" ? (
            <IncidentesListView ordenes={ordenes} />
          ) : vistaActiva === "reportes" ? (
            <ReportesListView />
          ) : vistaActiva === "auditoria" ? (
            <AuditoriaListView />
          ) : vistaActiva === "flota" ? (
            <FleetInventoryView vehiculos={vehiculos} repuestos={repuestos} />
          ) : (
            <DashboardView
              ordenes={ordenes}
              vehiculos={vehiculos}
              conductores={conductoresConDisponibilidad}
              clientes={clientes}
              solicitudesCompra={solicitudesCompra}
              onCrearOrden={crearOrden}
              onActualizar={cargarDatos}
              busquedaExterna={busquedaGlobal}
            />
          )}
        </div>
      </main>
    </div>
  );
}
