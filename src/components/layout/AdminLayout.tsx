import { useEffect, useMemo, useState } from "react";
import { DashboardView } from "../dashboard/DashboardView";
import { FleetInventoryView } from "../fleet/FleetInventoryView";
import { Sidebar, VistaPrincipal } from "./Sidebar";
import { Topbar } from "./Topbar";
import { obtenerConductores } from "../../services/conductor.service";
import { obtenerClientes } from "../../services/cliente.service";
import { obtenerVehiculos } from "../../services/vehiculo.service";
import { crearOrdenDespacho, obtenerOrdenesDespacho } from "../../services/orden.service";
import { obtenerNotificaciones } from "../../services/notificacion.service";
import { obtenerRepuestos } from "../../services/repuesto.service";
import { obtenerSolicitudesCompra } from "../../services/mockServices";
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

interface AdminLayoutProps {
  onCerrarSesion: () => void;
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
  const [vistaActiva, setVistaActiva] = useState<VistaPrincipal>("panel");

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenDespacho[]>([]);
  const [notificacionesBackend, setNotificacionesBackend] = useState<Notificacion[]>([]);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [solicitudesCompra, setSolicitudesCompra] = useState<SolicitudCompra[]>([]);
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
      const [vehiculosData, conductoresData, clientesData, ordenesData, notificacionesData, repuestosData, solicitudesData] =
        await Promise.all([
          obtenerVehiculos(),
          obtenerConductores(),
          obtenerClientes(),
          obtenerOrdenesDespacho(),
          obtenerNotificaciones(),
          obtenerRepuestos(),
          obtenerSolicitudesCompra()
        ]);

      setVehiculos(vehiculosData);
      setConductores(conductoresData);
      setClientes(clientesData);
      setOrdenes(ordenesData);
      setNotificacionesBackend(notificacionesData);
      setRepuestos(repuestosData);
      setSolicitudesCompra(solicitudesData);
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
    if (colapsado) {
      return "lg:ml-[88px]";
    }

    return "lg:ml-72";
  }, [colapsado]);

  const crearOrden = async (payload: NuevaOrdenInput) => {
    await crearOrdenDespacho(payload);
    await cargarDatos();
  };

  return (
    <div className="min-h-screen">
      <Sidebar
        colapsado={colapsado}
        movilAbierto={movilAbierto}
        vistaActiva={vistaActiva}
        onCerrarMovil={() => setMovilAbierto(false)}
        onAlternarColapsado={() => setColapsado((prev) => !prev)}
        onCambiarVista={(vista) => {
          setVistaActiva(vista);
          setMovilAbierto(false);
        }}
      />

      <main className={`transition-all duration-300 ${margenContenido}`}>
        <Topbar
          notificaciones={notificaciones}
          onAbrirMovil={() => setMovilAbierto(true)}
          onCerrarSesion={onCerrarSesion}
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
            />
          ) : (
            <FleetInventoryView vehiculos={vehiculos} repuestos={repuestos} />
          )}
        </div>
      </main>
    </div>
  );
}
