import { api } from "./api";
import { AuditoriaLog } from "../types/domain";

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

export async function obtenerAuditoriaLogs(params?: Record<string, string | number | boolean | undefined>) {
  const response = await api.get<ApiResponse<AuditoriaLog[]>>("/auditoria", { params });
  return response.data.data;
}
