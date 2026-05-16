export type EstadoVehiculo = "DISPONIBLE" | "EN_RUTA" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO";

export type EstadoOrden = "DESPACHADO" | "EN_RUTA" | "CERCA_DEL_DESTINO" | "ENTREGADO" | "CANCELADO";

export interface Coordenada {
  lat: number;
  lng: number;
}

export interface Vehiculo {
  id: number;
  placa: string;
  tipo: "CAMION_CARGA_PESADA" | "TURBO" | "CAMIONETA";
  capacidadCarga: number;
  restricciones: string | null;
  estado: EstadoVehiculo;
  createdAt: string;
  updatedAt: string;
}

export interface VehiculoInput {
  placa: string;
  tipo: "CAMION_CARGA_PESADA" | "TURBO" | "CAMIONETA";
  capacidadCarga: number;
  restricciones?: string | null;
  estado: "DISPONIBLE" | "EN_RUTA" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO";
}

export interface PlanMantenimiento {
  id: number;
  nombre: string;
  descripcion: string | null;
  frecuenciaKm: number | null;
  frecuenciaDias: number | null;
  tipoVehiculo: Vehiculo["tipo"];
  vehiculoId: number;
  createdAt: string;
  updatedAt: string;
  vehiculo?: {
    id: number;
    placa: string;
    tipo: Vehiculo["tipo"];
  };
}

export interface PlanMantenimientoInput {
  nombre: string;
  descripcion?: string | null;
  frecuenciaKm?: number | null;
  frecuenciaDias?: number | null;
  tipoVehiculo: Vehiculo["tipo"];
  vehiculoId: number;
}

export interface Cliente {
  id: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  direccion: string | null;
  tipoDocumento: "CC" | "NIT" | "CE" | "PASAPORTE";
  numeroDocumento: string;
  usuarioId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Conductor {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string | null;
  numeroLicencia: string;
  categoriaLicencia: string;
  fechaVencimientoLicencia: string;
  horasConducidas: number;
  usuarioId: number | null;
  createdAt: string;
  updatedAt: string;
  diasParaVencimiento: number;
  licenciaVencida: boolean;
  usuario?: {
    id: number;
    nombre: string;
    correo: string;
  };
}

export interface ConductorInput {
  nombre: string;
  apellido: string;
  cedula: string;
  telefono?: string | null;
  numeroLicencia: string;
  categoriaLicencia: string;
  fechaVencimientoLicencia: string;
  horasConducidas?: number;
  usuarioId?: number | null;
}

export interface ConductorConDisponibilidad extends Conductor {
  disponible: boolean;
}

export interface OrdenDespacho {
  id: number;
  codigo: string;
  fechaCreacion: string;
  fechaSalida: string | null;
  fechaEntregaEstimada: string | null;
  estado: EstadoOrden;
  origen: string;
  destino: string;
  pesoCarga: number;
  descripcionCarga: string | null;
  conductorId: number;
  vehiculoId: number;
  clienteId: number;
  createdAt: string;
  updatedAt: string;
  conductor?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  vehiculo?: {
    id: number;
    placa: string;
    tipo: Vehiculo["tipo"];
  };
  cliente?: {
    id: number;
    nombre: string;
  };
  entrega?: {
    id: number;
  } | null;
}

export interface Incidente {
  id: number;
  tipo: string;
  descripcion: string;
  fecha: string;
  latitud: number | null;
  longitud: number | null;
  protocoloActivado: boolean;
  ordenDeDespachoId: number;
  createdAt: string;
  updatedAt: string;
  ordenDeDespacho?: {
    id: number;
    codigo: string;
  };
}

export interface IncidenteInput {
  tipo: string;
  descripcion: string;
  fecha: string;
  latitud?: number | null;
  longitud?: number | null;
  protocoloActivado?: boolean;
}

export interface Entrega {
  id: number;
  fechaEntrega: string;
  firmaDigital: string | null;
  fotografia: string | null;
  observaciones: string | null;
  latitud: number | null;
  longitud: number | null;
  ordenDeDespachoId: number;
  createdAt: string;
  updatedAt: string;
  ordenDeDespacho?: {
    id: number;
    codigo: string;
    estado: EstadoOrden;
  };
}

export interface EntregaInput {
  fechaEntrega: string;
  firmaDigital?: string | null;
  fotografia?: string | null;
  observaciones?: string | null;
  latitud?: number | null;
  longitud?: number | null;
}

export type TipoNotificacion = "ESTADO_ENVIO" | "INCIDENTE" | "STOCK_BAJO" | "MANTENIMIENTO" | "SISTEMA";

export interface Notificacion {
  id: number;
  mensaje: string;
  fecha: string;
  tipo: TipoNotificacion;
  leida: boolean;
  destinatario: string;
  clienteId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tipo legacy para compatibilidad con componentes existentes
 * Se mapea desde Notificacion en el componente
 */
export interface NotificacionIncidente {
  id: string;
  titulo: string;
  descripcion: string;
  severidad: "Alta" | "Media" | "Baja";
  fecha: string;
}

export interface Repuesto {
  id: number;
  nombre: string;
  referencia: string | null;
  stockActual: number;
  stockMinimo: number;
  unidadMedida: string;
  precio: number;
  createdAt: string;
  updatedAt: string;
}

export interface SolicitudCompra {
  id: number;
  codigo: string;
  conceptoLibre: string | null;
  cantidad: number;
  costoEstimado: number | null;
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA" | "RECIBIDA";
  fechaSolicitud: string;
  repuesto?: {
    id: number;
    nombre: string;
  } | null;
  solicitante?: {
    id: number;
    nombre: string;
  };
  aprobador?: {
    id: number;
    nombre: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditoriaLog {
  id: number;
  usuarioId: number;
  accion: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT" | "ASSIGN" | "LOGIN" | "LOGOUT";
  entidad: string;
  entidadId: number | null;
  ipAddress: string | null;
  datosAnteriores: any | null;
  datosNuevos: any | null;
  createdAt: string;
  usuario?: {
    id: number;
    nombre: string;
    correo: string;
    rol: string;
  };
}

export interface EvaluacionConductor {
  id: number;
  conductorId: number;
  periodo: string;
  scoreTotal: number;
  scorePuntualidad: number;
  scoreIncidentes: number;
  scoreCombustible: number;
  scoreCalificacionClientes: number | null;
  scoreCumplimientoProtocolos: number;
  entregasTotales: number;
  entregasATiempo: number;
  incidentesTotales: number;
  rendimientoPromedio: number | null;
  comentariosAdmin: string | null;
  ranking?: number; // Calculado en backend
  createdAt: string;
  updatedAt: string;
  conductor?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export interface DocumentoVehicular {
  id: number;
  vehiculoId: number;
  tipo: "SOAT" | "TECNOMECANICA" | "REVISION_GASES" | "POLIZA" | "TARJETA_OPERACION";
  numero: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
  archivoAdjunto: string | null;
  vehiculo?: {
    id: number;
    placa: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentoVehicularInput {
  vehiculoId: number;
  tipo: "SOAT" | "TECNOMECANICA" | "REVISION_GASES" | "POLIZA" | "TARJETA_OPERACION";
  numero: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
  archivoAdjunto?: string | null;
}

export interface DocumentoVehicularAlerta {
  id: number;
  vehiculoId: number;
  placa: string;
  tipo: "SOAT" | "TECNOMECANICA" | "REVISION_GASES" | "POLIZA" | "TARJETA_OPERACION";
  fechaVencimiento: string;
  diasFaltantes: number;
  nivelAlerta: "INFO" | "ALERTA" | "CRITICO";
}

export interface NuevaOrdenInput {
  vehiculoId: number;
  conductorId: number;
  clienteId: number;
  origen: string;
  destino: string;
  pesoCarga: number;
  fechaSalida?: string | null;
  fechaEntregaEstimada?: string | null;
  descripcionCarga?: string | null;
}
