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

const VISTAS_POR_ROL: Record<string, VistaPrincipal[]> = {
  ADMINISTRADOR: [
    "panel", "gps", "asignacion", "operativo", "entregas", "incidentes", "manifiestos",
    "flota", "vehiculos", "conductores", "documentos",
    "mantenimiento", "inventario",
    "viaticos", "combustible", "compras",
    "reportes", "clientes", "evaluacion", "auditoria"
  ],
  DESPACHADOR: [
    "panel", "gps", "asignacion", "operativo", "entregas", "incidentes", "manifiestos",
    "flota", "vehiculos", "conductores", "documentos",
    "reportes", "clientes", "evaluacion"
  ],
  CONDUCTOR: [
    "entregas", "incidentes", "viaticos", "combustible"
  ],
  JEFE_TALLER: [
    "mantenimiento", "inventario", "vehiculos", "documentos", "combustible", "compras", "incidentes"
  ],
  GESTOR_INVENTARIO: [
    "inventario", "compras"
  ],
  AUDITOR: [
    "auditoria", "panel", "gps", "manifiestos", "incidentes", "viaticos", "combustible", "reportes"
  ],
  CLIENTE: [
    "clientes"
  ]
};

export function AdminLayout({ onCerrarSesion }: AdminLayoutProps) {
  const [colapsado, setColapsado] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const STORAGE_KEY = "transruta:vistaActiva";

  const [vistaActiva, setVistaActiva] = useState<VistaPrincipal>(() => {
    let userRol = "ADMINISTRADOR";
    try {
      const raw = localStorage.getItem("trans_ruta_usuario");
      if (raw) {
        userRol = JSON.parse(raw).rol || "ADMINISTRADOR";
      }
    } catch {}

    const vistasPermitidas = VISTAS_POR_ROL[userRol] || VISTAS_POR_ROL["ADMINISTRADOR"];

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && vistasPermitidas.includes(saved as VistaPrincipal)) {
        return saved as VistaPrincipal;
      }
    } catch {}

    return vistasPermitidas[0] || "panel";
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

    let userRol = "ADMINISTRADOR";
    try {
      const raw = localStorage.getItem("trans_ruta_usuario");
      console.log("DEBUG: raw user storage:", raw);
      if (raw) {
        userRol = JSON.parse(raw).rol || "ADMINISTRADOR";
      }
    } catch (e) {
      console.error("DEBUG: failed to parse user storage:", e);
    }
    console.log("DEBUG: resolved role:", userRol);

    const canFetchVehiculos = ["ADMINISTRADOR", "DESPACHADOR", "JEFE_TALLER"].includes(userRol);
    const canFetchConductores = ["ADMINISTRADOR", "DESPACHADOR"].includes(userRol);
    const canFetchClientes = ["ADMINISTRADOR", "DESPACHADOR", "CLIENTE"].includes(userRol);
    const canFetchOrdenes = ["ADMINISTRADOR", "DESPACHADOR", "CONDUCTOR", "AUDITOR"].includes(userRol);
    const canFetchNotificaciones = ["ADMINISTRADOR", "CLIENTE"].includes(userRol);
    const canFetchViaticos = ["ADMINISTRADOR", "DESPACHADOR", "CONDUCTOR"].includes(userRol);
    const canFetchRepuestos = ["ADMINISTRADOR", "JEFE_TALLER", "GESTOR_INVENTARIO"].includes(userRol);
    const canFetchSolicitudes = ["ADMINISTRADOR", "GESTOR_INVENTARIO", "JEFE_TALLER"].includes(userRol);

    try {
      const results = await Promise.allSettled([
        canFetchVehiculos ? withTimeout(obtenerVehiculos(), "vehiculos") : Promise.resolve([]),
        canFetchConductores ? withTimeout(obtenerConductores(), "conductores") : Promise.resolve([]),
        canFetchClientes ? withTimeout(obtenerClientes(), "clientes") : Promise.resolve([]),
        canFetchOrdenes ? withTimeout(obtenerOrdenesDespacho(), "ordenes-despacho") : Promise.resolve([]),
        canFetchNotificaciones ? withTimeout(obtenerNotificaciones(), "notificaciones") : Promise.resolve([]),
        canFetchViaticos ? withTimeout(obtenerViaticos(), "viaticos") : Promise.resolve([]),
        canFetchRepuestos ? withTimeout(obtenerRepuestos(), "repuestos") : Promise.resolve([]),
        canFetchSolicitudes ? withTimeout(obtenerSolicitudesCompra(), "solicitudes-compra") : Promise.resolve([])
      ]);

      const fallos: string[] = [];

      if (results[0].status === "fulfilled") {
        setVehiculos(results[0].value);
      } else {
        setVehiculos([]);
        if (canFetchVehiculos) fallos.push("vehiculos");
      }

      if (results[1].status === "fulfilled") {
        setConductores(results[1].value);
      } else {
        setConductores([]);
        if (canFetchConductores) fallos.push("conductores");
      }

      if (results[2].status === "fulfilled") {
        setClientes(results[2].value);
      } else {
        setClientes([]);
        if (canFetchClientes) fallos.push("clientes");
      }

      if (results[3].status === "fulfilled") {
        setOrdenes(results[3].value);
      } else {
        setOrdenes([]);
        if (canFetchOrdenes) fallos.push("ordenes-despacho");
      }

      if (results[4].status === "fulfilled") {
        setNotificacionesBackend(results[4].value);
      } else {
        setNotificacionesBackend([]);
        if (canFetchNotificaciones) fallos.push("notificaciones");
      }

      if (results[5].status === "fulfilled") {
        setViaticos(results[5].value);
      } else {
        setViaticos([]);
        if (canFetchViaticos) fallos.push("viaticos");
      }

      if (results[6].status === "fulfilled") {
        setRepuestos(results[6].value);
      } else {
        setRepuestos([]);
        if (canFetchRepuestos) fallos.push("repuestos");
      }

      if (results[7].status === "fulfilled") {
        setSolicitudesCompra(results[7].value);
      } else {
        setSolicitudesCompra([]);
        if (canFetchSolicitudes) fallos.push("solicitudes-compra");
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

  const handleCambiarVista = (vista: VistaPrincipal) => {
    let userRol = "ADMINISTRADOR";
    try {
      const raw = localStorage.getItem("trans_ruta_usuario");
      if (raw) {
        userRol = JSON.parse(raw).rol || "ADMINISTRADOR";
      }
    } catch {}

    const vistasPermitidas = VISTAS_POR_ROL[userRol] || VISTAS_POR_ROL["ADMINISTRADOR"];
    if (!vistasPermitidas.includes(vista)) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, vista);
    } catch (err) {
      // ignore
    }
    setVistaActiva(vista);
    setMovilAbierto(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-200/70 via-blue-100/50 to-indigo-200/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <Sidebar
        colapsado={colapsado}
        movilAbierto={movilAbierto}
        vistaActiva={vistaActiva}
        onCerrarMovil={() => setMovilAbierto(false)}
        onAlternarColapsado={() => setColapsado((prev) => !prev)}
        onCambiarVista={handleCambiarVista}
      />

      <main className={`transition-all duration-300 ${margenContenido} max-w-full overflow-x-hidden`}>
        <Topbar
          notificaciones={notificaciones}
          onAbrirMovil={() => setMovilAbierto(true)}
          onCerrarSesion={onCerrarSesion}
          busquedaGlobal={busquedaGlobal}
          onBusquedaGlobalChange={setBusquedaGlobal}
          vehiculos={vehiculos}
          conductores={conductores}
          ordenes={ordenes}
          onCambiarVista={handleCambiarVista}
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
              onBusquedaExternaChange={setBusquedaGlobal}
            />
          ) : vistaActiva === "vehiculos" ? (
            <VehicleListView onActualizar={cargarDatos} busquedaGlobal={busquedaGlobal} />
          ) : vistaActiva === "conductores" ? (
            <ConductorListView onActualizar={cargarDatos} busquedaGlobal={busquedaGlobal} />
          ) : vistaActiva === "documentos" ? (
            <DocumentVehicularListView busquedaGlobal={busquedaGlobal} />
          ) : vistaActiva === "ordenes" ? (
            <OrdenesListView
              ordenes={ordenes}
              vehiculos={vehiculos}
              conductores={conductoresConDisponibilidad}
              clientes={clientes}
              viaticos={viaticos}
              onCrearOrden={crearOrden}
              onActualizar={cargarDatos}
              busquedaGlobal={busquedaGlobal}
            />
          ) : vistaActiva === "mantenimiento" ? (
            <MantenimientoListView vehiculos={vehiculos} />
          ) : vistaActiva === "entregas" ? (
            <EntregasListView ordenes={ordenes} onActualizar={cargarDatos} busquedaGlobal={busquedaGlobal} />
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
              onBusquedaExternaChange={setBusquedaGlobal}
            />
          )}
        </div>
      </main>
    </div>
  );
}
