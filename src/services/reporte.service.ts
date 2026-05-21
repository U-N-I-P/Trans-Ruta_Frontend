import api from "./api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ReporteConsumoCombustible {
  vehiculo: {
    id: number;
    placa: string;
    tipo: string;
  };
  totalOrdenes: number;
  pesoTotal: number;
}

export interface ReporteRutaRentable {
  ruta: string;
  totalOrdenes: number;
  pesoTotal: number;
}

export interface ReporteCumplimientoEntregas {
  totalEntregas: number;
  aTiempo: number;
  tarde: number;
  porcentajeCumplimiento: string;
}


export async function obtenerReporteConsumoCombustible() {
  const response = await api.get<ApiResponse<ReporteConsumoCombustible[]>>("/reportes/combustible");
  return response.data.data;
}

export async function obtenerReporteRutasRentables() {
  const response = await api.get<ApiResponse<ReporteRutaRentable[]>>("/reportes/rutas-rentables");
  return response.data.data;
}

export async function obtenerReporteCumplimientoEntregas() {
  const response = await api.get<ApiResponse<ReporteCumplimientoEntregas>>("/reportes/cumplimiento-entregas");
  return response.data.data;
}
