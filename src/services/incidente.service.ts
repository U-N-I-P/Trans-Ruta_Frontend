import { api } from "./api";
import { Incidente, IncidenteInput } from "../types/domain";

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

export async function obtenerIncidentes(params?: Record<string, string | number | boolean | undefined>) {
  const response = await api.get<ApiResponse<Incidente[]>>("/incidentes", { params });
  return response.data.data;
}

export async function obtenerIncidentePorId(id: number) {
  const response = await api.get<ApiResponse<Incidente>>(`/incidentes/${id}`);
  return response.data.data;
}

export async function reportarIncidente(ordenId: number, payload: IncidenteInput) {
  const response = await api.post<ApiResponse<Incidente>>(`/incidentes/${ordenId}/reportar`, payload);
  return response.data.data;
}

export async function eliminarIncidente(id: number) {
  await api.delete<ApiResponse<null>>(`/incidentes/${id}`);
}

export async function cambiarEstadoIncidente(id: number, estado: string) {
  const response = await api.patch<ApiResponse<Incidente>>(`/incidentes/${id}/estado`, { estado });
  return response.data.data;
}

export async function finalizarIncidente(id: number) {
  const response = await api.patch<ApiResponse<Incidente>>(`/incidentes/${id}/finalizar`);
  return response.data.data;
}