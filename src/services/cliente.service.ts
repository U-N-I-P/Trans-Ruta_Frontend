import api from "./api";
import { Cliente } from "../types/domain";

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


export async function obtenerClientes(params?: Record<string, string | number | boolean | undefined>) {
  const response = await api.get<ApiResponse<Cliente[]>>("/clientes", { params });
  return response.data.data;
}

export async function obtenerClientePorId(id: number) {
  const response = await api.get<ApiResponse<Cliente>>(`/clientes/${id}`);
  return response.data.data;
}