import api from "./api";
import { NuevaOrdenInput, OrdenDespacho } from "../types/domain";

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

export interface OrdenEstadoInput {
  estado: OrdenDespacho["estado"];
}


export async function obtenerOrdenesDespacho(params?: Record<string, string | number | boolean | undefined>) {
  const response = await api.get<ApiResponse<OrdenDespacho[]>>("/ordenes-despacho", { params });
  return response.data.data;
}

export async function obtenerOrdenDespachoPorId(id: number) {
  const response = await api.get<ApiResponse<OrdenDespacho>>(`/ordenes-despacho/${id}`);
  return response.data.data;
}

export async function obtenerOrdenesPorConductor(conductorId: number) {
  const response = await api.get<ApiResponse<OrdenDespacho[]>>(`/ordenes-despacho/conductor/${conductorId}`);
  return response.data.data;
}

export async function crearOrdenDespacho(payload: NuevaOrdenInput) {
  const response = await api.post<ApiResponse<OrdenDespacho>>("/ordenes-despacho", payload);
  return response.data.data;
}

export async function actualizarOrdenDespacho(id: number, payload: Partial<NuevaOrdenInput>) {
  const response = await api.put<ApiResponse<OrdenDespacho>>(`/ordenes-despacho/${id}`, payload);
  return response.data.data;
}

export async function cambiarEstadoOrdenDespacho(id: number, estado: OrdenDespacho["estado"]) {
  const response = await api.patch<ApiResponse<OrdenDespacho>>(`/ordenes-despacho/${id}/estado`, { estado });
  return response.data.data;
}

export async function eliminarOrdenDespacho(id: number) {
  await api.delete<ApiResponse<null>>(`/ordenes-despacho/${id}`);
}