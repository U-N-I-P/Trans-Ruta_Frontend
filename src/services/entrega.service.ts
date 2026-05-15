import { api } from "./api";
import { Entrega, EntregaInput } from "../types/domain";

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

export async function obtenerEntregas(params?: Record<string, string | number | boolean | undefined>) {
  const response = await api.get<ApiResponse<Entrega[]>>("/entregas", { params });
  return response.data.data;
}

export async function obtenerEntregaPorId(id: number) {
  const response = await api.get<ApiResponse<Entrega>>(`/entregas/${id}`);
  return response.data.data;
}

export async function registrarEntrega(ordenId: number, payload: EntregaInput) {
  const response = await api.post<ApiResponse<Entrega>>(`/entregas/${ordenId}/registrar`, payload);
  return response.data.data;
}

export async function eliminarEntrega(id: number) {
  await api.delete<ApiResponse<null>>(`/entregas/${id}`);
}