import api from "./api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
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
}


export async function obtenerSolicitudesCompra(pendientes = false) {
  const ruta = pendientes ? "/solicitudes-compra/pendientes" : "/solicitudes-compra";
  const response = await api.get<ApiResponse<SolicitudCompra[]>>(ruta);
  return response.data.data;
}

export async function aprobarSolicitudCompra(id: number, comentarios = "") {
  const response = await api.patch<ApiResponse<SolicitudCompra>>(`/solicitudes-compra/${id}/aprobar`, { comentarios });
  return response.data.data;
}

export async function rechazarSolicitudCompra(id: number, comentarios = "") {
  const response = await api.patch<ApiResponse<SolicitudCompra>>(`/solicitudes-compra/${id}/rechazar`, { comentarios });
  return response.data.data;
}

export async function recibirSolicitudCompra(id: number) {
  const response = await api.patch<ApiResponse<SolicitudCompra>>(`/solicitudes-compra/${id}/recibir`, {});
  return response.data.data;
}
