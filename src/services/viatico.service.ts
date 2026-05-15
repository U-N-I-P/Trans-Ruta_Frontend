import { api } from "./api";

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

export interface Viatico {
  id: number;
  conductorId: number;
  ordenDeDespachoId: number;
  monto: number;
  saldo: number;
  estado: "PENDIENTE" | "APROBADO" | "LIQUIDADO";
  fecha: string;
  createdAt: string;
  updatedAt: string;
}

export interface ViaticoInput {
  conductorId: number;
  ordenDeDespachoId: number;
  monto: number;
  estado: "PENDIENTE" | "APROBADO" | "LIQUIDADO";
  fecha?: string;
}

export interface GastoViatico {
  id: number;
  viaticoId: number;
  monto: number;
  categoria: "COMBUSTIBLE" | "PEAJES" | "ALIMENTACION" | "HOSPEDAJE" | "OTROS";
  descripcion: string;
  evidenciaFotografica?: string;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  comentariosAdmin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GastoViaticInput {
  viaticoId: number;
  monto: number;
  categoria: "COMBUSTIBLE" | "PEAJES" | "ALIMENTACION" | "HOSPEDAJE" | "OTROS";
  descripcion: string;
  evidenciaFotografica?: string;
}

export async function obtenerViaticos() {
  const response = await api.get<ApiResponse<Viatico[]>>("/viaticos");
  return response.data.data;
}

export async function crearViatico(payload: ViaticoInput) {
  const response = await api.post<ApiResponse<Viatico>>("/viaticos", payload);
  return response.data.data;
}

export async function actualizarViatico(id: number, payload: Partial<ViaticoInput>) {
  const response = await api.put<ApiResponse<Viatico>>(`/viaticos/${id}`, payload);
  return response.data.data;
}

export async function obtenerGastosViatico(viaticoId: number) {
  const response = await api.get<ApiResponse<GastoViatico[]>>(`/gastos-viaticos/viatico/${viaticoId}`);
  return response.data.data;
}

export async function registrarGastoViatico(payload: GastoViaticInput) {
  const response = await api.post<ApiResponse<GastoViatico>>("/gastos-viaticos", payload);
  return response.data.data;
}

export async function aprobarGastoViatico(gastoId: number, comentarios: string) {
  const response = await api.patch<ApiResponse<GastoViatico>>(`/gastos-viaticos/${gastoId}/aprobar`, { comentariosAdmin: comentarios });
  return response.data.data;
}

export async function rechazarGastoViatico(gastoId: number, comentarios: string) {
  const response = await api.patch<ApiResponse<GastoViatico>>(`/gastos-viaticos/${gastoId}/rechazar`, { comentariosAdmin: comentarios });
  return response.data.data;
}
