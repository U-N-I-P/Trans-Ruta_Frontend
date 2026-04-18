import { useEffect, useMemo, useState } from "react";
import { DashboardView } from "../dashboard/DashboardView";
import { FleetInventoryView } from "../fleet/FleetInventoryView";
import { Sidebar, VistaPrincipal } from "./Sidebar";
import { Topbar } from "./Topbar";
import {
  obtenerConductores,
  obtenerNotificacionesIncidentes,
  obtenerOrdenesDespacho,
  obtenerRepuestos,
  obtenerSolicitudesCompra,
  obtenerVehiculos
} from "../../services/mockServices";
import {
  Conductor,
  NotificacionIncidente,
  NuevaOrdenInput,
  OrdenDespacho,
  Repuesto,
  SolicitudCompra,
  Vehiculo
} from "../../types/domain";

export function AdminLayout() {
  const [colapsado, setColapsado] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [vistaActiva, setVistaActiva] = useState<VistaPrincipal>("panel");

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenDespacho[]>([]);
  const [notificaciones, setNotificaciones] = useState<NotificacionIncidente[]>([]);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [solicitudesCompra, setSolicitudesCompra] = useState<SolicitudCompra[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      const [
        vehiculosData,
        conductoresData,
        ordenesData,
        notificacionesData,
        repuestosData,
        solicitudesData
      ] = await Promise.all([
        obtenerVehiculos(),
        obtenerConductores(),
        obtenerOrdenesDespacho(),
        obtenerNotificacionesIncidentes(),
        obtenerRepuestos(),
        obtenerSolicitudesCompra()
      ]);

      setVehiculos(vehiculosData);
      setConductores(conductoresData);
      setOrdenes(ordenesData);
      setNotificaciones(notificacionesData);
      setRepuestos(repuestosData);
      setSolicitudesCompra(solicitudesData);
      setCargando(false);
    };

    void cargarDatos();
  }, []);

  const margenContenido = useMemo(() => {
    if (colapsado) {
      return "lg:ml-[88px]";
    }

    return "lg:ml-72";
  }, [colapsado]);

  const crearOrden = (payload: NuevaOrdenInput) => {
    const idConsecutivo = ordenes.length + 1;
    const nuevaOrden: OrdenDespacho = {
      id: `ord-local-${idConsecutivo}`,
      codigo: `OD-2026-${String(2000 + idConsecutivo).padStart(4, "0")}`,
      estado: "Despachado",
      fechaProgramada: new Date().toISOString(),
      ...payload
    };

    setOrdenes((prev) => [nuevaOrden, ...prev]);

    setConductores((prev) =>
      prev.map((conductor) =>
        conductor.id === payload.conductorId ? { ...conductor, disponible: false } : conductor
      )
    );

    setVehiculos((prev) =>
      prev.map((vehiculo) =>
        vehiculo.id === payload.vehiculoId ? { ...vehiculo, estado: "En Ruta" } : vehiculo
      )
    );
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
        <Topbar notificaciones={notificaciones} onAbrirMovil={() => setMovilAbierto(true)} />
        <div className="p-4 lg:p-8">
          {cargando ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-panel">
              Cargando datos del mockup...
            </div>
          ) : vistaActiva === "panel" ? (
            <DashboardView
              ordenes={ordenes}
              vehiculos={vehiculos}
              conductores={conductores}
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
