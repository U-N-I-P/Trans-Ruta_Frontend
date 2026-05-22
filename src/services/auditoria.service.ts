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

export async function exportarAuditoriaLogs(
  formato: "csv" | "pdf",
  params?: Record<string, string | number | boolean | undefined>
) {
  const response = await api.get<Blob>("/auditoria/exportar", {
    params: { ...params, formato },
    responseType: "blob",
  });

  const contentDisposition = response.headers["content-disposition"] as string | undefined;
  const fileNameMatch = contentDisposition?.match(/filename="?([^\";]+)"?/i);
  const filename = fileNameMatch?.[1] ?? `auditoria.${formato}`;

  return {
    blob: response.data,
    filename,
    contentType: response.headers["content-type"] as string | undefined,
  };
}
