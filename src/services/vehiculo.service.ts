import axios from "axios";
import { Vehiculo } from "../types/domain";

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

export interface VehiculoInput {
  placa: string;
  tipo: "CAMION_CARGA_PESADA" | "TURBO" | "CAMIONETA";
  capacidadCarga: number;
  restricciones?: string | null;
  estado: "DISPONIBLE" | "EN_RUTA" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO";
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  headers: {
    "Content-Type": "application/json"
  }
});

export async function obtenerVehiculos(params?: Record<string, string | number | boolean | undefined>) {
  const response = await api.get<ApiResponse<Vehiculo[]>>("/vehiculos", { params });
  return response.data.data;
}

export async function obtenerVehiculoPorId(id: number) {
  const response = await api.get<ApiResponse<Vehiculo>>(`/vehiculos/${id}`);
  return response.data.data;
}

export async function crearVehiculo(payload: VehiculoInput) {
  const response = await api.post<ApiResponse<Vehiculo>>("/vehiculos", payload);
  return response.data.data;
}

export async function actualizarVehiculo(id: number, payload: Partial<VehiculoInput>) {
  const response = await api.put<ApiResponse<Vehiculo>>(`/vehiculos/${id}`, payload);
  return response.data.data;
}

export async function eliminarVehiculo(id: number) {
  await api.delete<ApiResponse<null>>(`/vehiculos/${id}`);
}