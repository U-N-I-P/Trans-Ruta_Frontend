import { api } from "./api";
import { SolicitudCompra } from "../types/domain";

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

export async function obtenerSolicitudesCompra(params?: Record<string, string | number | boolean | undefined>) {
  const response = await api.get<ApiResponse<SolicitudCompra[]>>("/solicitudes-compra", { params });
  return response.data.data;
}
