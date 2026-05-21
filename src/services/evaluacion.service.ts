import axios from "axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface EvaluacionRanking {
  posicion: number;
  conductor: {
    id: number;
    nombre: string;
    cedula: string;
    numeroLicencia: string;
  };
  scoreTotal: number;
  entregasTotales: number;
  entregasATiempo: number;
  incidentesTotales: number;
  rendimientoPromedio: number | null;
  porcentajePuntualidad: number;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  headers: {
    "Content-Type": "application/json"
  }
});

export async function obtenerRankingEvaluacion(periodo: string) {
  const response = await api.get<ApiResponse<EvaluacionRanking[]>>("/evaluaciones/ranking", {
    params: { periodo }
  });
  return response.data.data;
}
