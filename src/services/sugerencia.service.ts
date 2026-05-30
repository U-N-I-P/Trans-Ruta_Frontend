import { api } from "./api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SugerenciaVehiculo {
  id: number;
  placa: string;
  tipo: string;
  capacidadCarga: number;
}

export interface SugerenciaConductor {
  id: number;
  nombre: string;
  numeroLicencia: string;
  categoriaLicencia: string;
}

export interface SugerenciaAsignacion {
  vehiculo: SugerenciaVehiculo;
  conductor: SugerenciaConductor;
  scoreVehiculo: number;
  scoreConductor: number;
  scoreCombinado: number;
  detallesVehiculo: string[];
  detallesConductor: string[];
  justificacion: string;
}

export interface SugerenciaQueryParams {
  pesoCarga: number;
  origen: string;
  destino: string;
  limite?: number;
}

export async function obtenerSugerencias(params: SugerenciaQueryParams) {
  const response = await api.get<ApiResponse<SugerenciaAsignacion[]>>("/sugerencias", {
    params,
  });

  return response.data.data;
}