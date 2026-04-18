import {
  conductoresMock,
  notificacionesIncidentesMock,
  ordenesDespachoMock,
  repuestosMock,
  solicitudesCompraMock,
  vehiculosMock
} from "../data/mockData";
import {
  Conductor,
  NotificacionIncidente,
  OrdenDespacho,
  Repuesto,
  SolicitudCompra,
  Vehiculo
} from "../types/domain";

const LATENCIA = 500;

const simularPeticion = <T>(data: T): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(data), LATENCIA);
  });

export const obtenerVehiculos = (): Promise<Vehiculo[]> => simularPeticion(vehiculosMock);

export const obtenerConductores = (): Promise<Conductor[]> => simularPeticion(conductoresMock);

export const obtenerOrdenesDespacho = (): Promise<OrdenDespacho[]> => simularPeticion(ordenesDespachoMock);

export const obtenerNotificacionesIncidentes = (): Promise<NotificacionIncidente[]> =>
  simularPeticion(notificacionesIncidentesMock);

export const obtenerRepuestos = (): Promise<Repuesto[]> => simularPeticion(repuestosMock);

export const obtenerSolicitudesCompra = (): Promise<SolicitudCompra[]> => simularPeticion(solicitudesCompraMock);
