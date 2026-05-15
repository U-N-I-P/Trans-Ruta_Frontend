import { api } from "./api";
import { Notificacion } from "../types/domain";

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

export interface NotificacionInput {
  mensaje: string;
  fecha: string;
  tipo: "ESTADO_ENVIO" | "INCIDENTE" | "STOCK_BAJO" | "MANTENIMIENTO" | "SISTEMA";
  destinatario: string;
  clienteId: number;
}

export async function obtenerNotificaciones(params?: Record<string, string | number | boolean | undefined>) {
  const response = await api.get<ApiResponse<Notificacion[]>>("/notificaciones", { params });
  return response.data.data;
}

export async function obtenerNotificacionPorId(id: number) {
  const response = await api.get<ApiResponse<Notificacion>>(`/notificaciones/${id}`);
  return response.data.data;
}

export async function crearNotificacion(payload: NotificacionInput) {
  const response = await api.post<ApiResponse<Notificacion>>("/notificaciones", payload);
  return response.data.data;
}

export async function marcarNotificacionLeida(id: number) {
  const response = await api.patch<ApiResponse<Notificacion>>(`/notificaciones/${id}/leida`);
  return response.data.data;
}

export async function eliminarNotificacion(id: number) {
  await api.delete<ApiResponse<null>>(`/notificaciones/${id}`);
}
