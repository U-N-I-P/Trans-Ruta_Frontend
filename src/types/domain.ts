export type EstadoVehiculo = "Disponible" | "Mantenimiento" | "En Ruta";

export type EstadoOrden = "Despachado" | "En Ruta" | "Entregado" | "Incidente";

export interface Coordenada {
  lat: number;
  lng: number;
}

export interface Vehiculo {
  id: string;
  placa: string;
  tipo: "Camion" | "Turbo" | "Furgon" | "Tractomula" | "Van";
  capacidadKg: number;
  estado: EstadoVehiculo;
}

export interface Conductor {
  id: string;
  nombre: string;
  licencia: string;
  telefono: string;
  disponible: boolean;
}

export interface OrdenDespacho {
  id: string;
  codigo: string;
  vehiculoId: string;
  conductorId: string;
  origen: string;
  destino: string;
  pesoCargaKg: number;
  estado: EstadoOrden;
  fechaProgramada: string;
  coordenadasOrigen?: Coordenada;
  coordenadasDestino?: Coordenada;
}

export interface NotificacionIncidente {
  id: string;
  titulo: string;
  descripcion: string;
  severidad: "Alta" | "Media" | "Baja";
  fecha: string;
}

export interface Repuesto {
  id: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  ubicacion: string;
}

export interface SolicitudCompra {
  id: string;
  repuesto: string;
  cantidad: number;
  estado: "Pendiente" | "Aprobada" | "Rechazada";
}

export interface NuevaOrdenInput {
  vehiculoId: string;
  conductorId: string;
  origen: string;
  destino: string;
  pesoCargaKg: number;
  coordenadasOrigen?: Coordenada;
  coordenadasDestino?: Coordenada;
}
