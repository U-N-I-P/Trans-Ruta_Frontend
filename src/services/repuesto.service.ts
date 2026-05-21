import api from "./api";
import { Repuesto } from "../types/domain";

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

export interface RepuestoInput {
  nombre: string;
  referencia?: string | null;
  stockActual: number;
  stockMinimo: number;
  unidadMedida: string;
  precio: number;
}


export async function obtenerRepuestos(params?: Record<string, string | number | boolean | undefined>) {
  const response = await api.get<ApiResponse<Repuesto[]>>("/repuestos", { params });
  return response.data.data;
}

export async function obtenerRepuestoPorId(id: number) {
  const response = await api.get<ApiResponse<Repuesto>>(`/repuestos/${id}`);
  return response.data.data;
}

export async function obtenerRepuestosConStockBajo() {
  const response = await api.get<ApiResponse<Repuesto[]>>("/repuestos/stock-bajo");
  return response.data.data;
}

export async function crearRepuesto(payload: RepuestoInput) {
  const response = await api.post<ApiResponse<Repuesto>>("/repuestos", payload);
  return response.data.data;
}

export async function actualizarRepuesto(id: number, payload: Partial<RepuestoInput>) {
  const response = await api.put<ApiResponse<Repuesto>>(`/repuestos/${id}`, payload);
  return response.data.data;
}

export async function eliminarRepuesto(id: number) {
  await api.delete<ApiResponse<null>>(`/repuestos/${id}`);
}
