import axios from "axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SugerenciaAsignacion {
  vehiculo: {
    id: number;
    placa: string;
    tipo: string;
    capacidadCarga: number;
  };
  conductor: {
    id: number;
    nombre: string;
    numeroLicencia: string;
    categoriaLicencia: string;
  };
  scoreCombinado: number;
  scoreVehiculo: number;
  scoreConductor: number;
  detallesVehiculo: string[];
  detallesConductor: string[];
  justificacion: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  headers: {
    "Content-Type": "application/json"
  }
});

export async function obtenerSugerencias(pesoCarga: number, origen: string, destino: string, limite = 5) {
  const response = await api.get<ApiResponse<SugerenciaAsignacion[]>>("/sugerencias", {
    params: { pesoCarga, origen, destino, limite }
  });
  return response.data.data;
}
