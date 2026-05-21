import api from "./api";
import { Conductor } from "../types/domain";

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


export async function obtenerConductores(params?: Record<string, string | number | boolean | undefined>) {
  const response = await api.get<ApiResponse<Conductor[]>>("/conductores", { params });
  return response.data.data;
}

export async function obtenerConductorPorId(id: number) {
  const response = await api.get<ApiResponse<Conductor>>(`/conductores/${id}`);
  return response.data.data;
}

export async function crearConductor(payload: ConductorInput) {
  const response = await api.post<ApiResponse<Conductor>>("/conductores", payload);
  return response.data.data;
}

export async function actualizarConductor(id: number, payload: Partial<ConductorInput>) {
  const response = await api.put<ApiResponse<Conductor>>(`/conductores/${id}`, payload);
  return response.data.data;
}

export async function eliminarConductor(id: number) {
  await api.delete<ApiResponse<null>>(`/conductores/${id}`);
}

export async function obtenerLicenciasPorVencer() {
  const response = await api.get<ApiResponse<Conductor[]>>("/conductores/licencias-por-vencer");
  return response.data.data;
}