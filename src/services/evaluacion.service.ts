import { api } from "./api";
import { EvaluacionConductor } from "../types/domain";

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

export async function obtenerRankingEvaluaciones(periodo?: string) {
  const params = periodo ? { periodo } : {};
  const response = await api.get<ApiResponse<EvaluacionConductor[]>>("/evaluaciones/ranking", { params });
  return response.data.data;
}
