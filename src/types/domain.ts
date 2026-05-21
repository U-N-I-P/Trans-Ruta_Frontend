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
  fecha: string;
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA" | "RECIBIDA";
  descripcion: string | null;
  cantidad: number;
  costoEstimado: number | null;
  montoTotal: number;
  conceptoLibre: string | null;
  comentariosAprobacion?: string | null;
  fechaAprobacion?: string | null;
  fechaRecepcion?: string | null;
  repuestoId?: number | null;
  aprobadorId?: number | null;
  createdAt: string;
  updatedAt: string;
  codigo?: string;
  concepto?: string;
  solicitadoPor?: string;
  costo?: number;
}

export interface AuditoriaLog {
  id: number;
  usuarioId: number;
  accion: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT" | "ASSIGN" | "LOGIN" | "LOGOUT";
  entidad: string;
  entidadId: number | null;
  ipAddress: string | null;
  datosAnteriores?: unknown;
  datosNuevos?: unknown;
  createdAt: string;
}

export interface SugerenciaAsignacion {
  vehiculo: {
    id: number;
    placa: string;
    tipo: string;
    capacidadCarga: number;
  };
  conductor: {
    id: number;
    nombre: string;
    numeroLicencia: string;
    categoriaLicencia: string;
  };
  scoreCombinado: number;
  scoreVehiculo: number;
  scoreConductor: number;
  detallesVehiculo: string[];
  detallesConductor: string[];
  justificacion: string;
}

export interface EvaluacionRanking {
  posicion: number;
  conductor: {
    id: number;
    nombre: string;
    cedula: string;
    numeroLicencia: string;
  };
  scoreTotal: number;
  entregasTotales: number;
  entregasATiempo: number;
  incidentesTotales: number;
  rendimientoPromedio: number | null;
  porcentajePuntualidad: number;
}

export interface ReporteConsumoCombustible {
  vehiculo: {
    id: number;
    placa: string;
    tipo: string;
  };
  totalOrdenes: number;
  pesoTotal: number;
}

export interface ReporteRutaRentable {
  ruta: string;
  totalOrdenes: number;
  pesoTotal: number;
}

export interface ReporteCumplimientoEntregas {
  totalEntregas: number;
  aTiempo: number;
  tarde: number;
  porcentajeCumplimiento: string;
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
