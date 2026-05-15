import { api } from "./api";
import { PlanMantenimiento, PlanMantenimientoInput } from "../types/domain";

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

export async function obtenerPlanesMantenimiento(params?: Record<string, string | number | boolean | undefined>) {
  const response = await api.get<ApiResponse<PlanMantenimiento[]>>("/planes-mantenimiento", { params });
  return response.data.data;
}

export async function obtenerPlanMantenimientoPorId(id: number) {
  const response = await api.get<ApiResponse<PlanMantenimiento>>(`/planes-mantenimiento/${id}`);
  return response.data.data;
}

export async function crearPlanMantenimiento(payload: PlanMantenimientoInput) {
  const response = await api.post<ApiResponse<PlanMantenimiento>>("/planes-mantenimiento", payload);
  return response.data.data;
}

export async function actualizarPlanMantenimiento(id: number, payload: Partial<PlanMantenimientoInput>) {
  const response = await api.put<ApiResponse<PlanMantenimiento>>(`/planes-mantenimiento/${id}`, payload);
  return response.data.data;
}

export async function eliminarPlanMantenimiento(id: number) {
  await api.delete<ApiResponse<null>>(`/planes-mantenimiento/${id}`);
}