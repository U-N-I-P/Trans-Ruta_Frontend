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

export interface GastoViatico {
  id: number;
  viaticoId: number;
  monto: number;
  categoria: "COMBUSTIBLE" | "PEAJES" | "ALIMENTACION" | "HOSPEDAJE" | "OTROS";
  descripcion: string;
  evidenciaFotografica?: string;
  fechaHora?: string;
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
  fechaHora?: string;
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