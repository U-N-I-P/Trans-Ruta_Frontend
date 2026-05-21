import api from "./api";

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

export interface ConsumoCombustible {
  id: number;
  vehiculoId: number;
  kilometrajeInicial: number;
  kilometrajeFinal: number;
  litrosCargados: number;
  costoTotal: number;
  rendimiento?: number;
  distanciaRecorrida?: number;
  ordenDeDespachoId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConsumoCombustibleInput {
  vehiculoId: number;
  kilometrajeInicial: number;
  kilometrajeFinal: number;
  litrosCargados: number;
  costoTotal: number;
  ordenDeDespachoId?: number;
}


export async function obtenerConsumosCombustible() {
  const response = await api.get<ApiResponse<ConsumoCombustible[]>>("/consumos-combustible");
  return response.data.data;
}

export async function obtenerConsumoPorVehiculo(vehiculoId: number) {
  const response = await api.get<ApiResponse<ConsumoCombustible[]>>(`/consumos-combustible/vehiculo/${vehiculoId}`);
  return response.data.data;
}

export async function registrarConsumoCombustible(payload: ConsumoCombustibleInput) {
  const response = await api.post<ApiResponse<ConsumoCombustible>>("/consumos-combustible", payload);
  return response.data.data;
}
