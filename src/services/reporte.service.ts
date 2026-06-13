import { api } from "./api";

export interface ReporteItem {
  id: number;
  tipo: string;
  fechaGeneracion: string;
  formato: string;
  parametros?: string | null;
  contenido?: string | null;
  usuarioId?: number;
}

export async function listarReportes(params?: Record<string, any>) {
  const resp = await api.get('/reportes', { params });
  return resp.data; // { success, message, data, pagination }
}

export async function obtenerReporte(id: number) {
  const resp = await api.get(`/reportes/${id}`);
  return resp.data;
}

export async function generarReporte(body: { tipo: string; formato?: string; parametros?: any }) {
  const resp = await api.post('/reportes/generar', body);
  return resp.data;
}

export async function reporteCombustible(params?: Record<string, any>) {
  const resp = await api.get('/reportes/combustible', { params });
  return resp.data;
}

export async function reporteRutasRentables() {
  const resp = await api.get('/reportes/rutas-rentables');
  return resp.data;
}

export async function reporteCumplimientoEntregas() {
  const resp = await api.get('/reportes/cumplimiento-entregas');
  return resp.data;
}

export async function exportarReporte(id: number, formato: "pdf" | "csv" = "pdf") {
  const resp = await api.get(`/reportes/${id}/exportar`, {
    params: { formato },
    responseType: "blob"
  });
  return resp.data as Blob;
}

export default { listarReportes, obtenerReporte, generarReporte, reporteCombustible, reporteRutasRentables, reporteCumplimientoEntregas, exportarReporte };
