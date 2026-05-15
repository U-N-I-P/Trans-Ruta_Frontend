import { api } from "./api";
import { DocumentoVehicular, DocumentoVehicularInput, DocumentoVehicularAlerta } from "../types/domain";

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

export async function obtenerDocumentosVehiculares() {
  const response = await api.get<ApiResponse<DocumentoVehicular[]>>("/documentos-vehiculares");
  return response.data.data;
}

export async function obtenerDocumentoVehicularPorId(id: number) {
  const response = await api.get<ApiResponse<DocumentoVehicular>>(`/documentos-vehiculares/${id}`);
  return response.data.data;
}

export async function obtenerAlertasDocumentosVehiculares() {
  const response = await api.get<ApiResponse<DocumentoVehicularAlerta[]>>("/documentos-vehiculares/alertas");
  return response.data.data;
}

export async function crearDocumentoVehicular(payload: DocumentoVehicularInput) {
  const response = await api.post<ApiResponse<DocumentoVehicular>>("/documentos-vehiculares", payload);
  return response.data.data;
}

export async function actualizarDocumentoVehicular(id: number, payload: Partial<DocumentoVehicularInput>) {
  const response = await api.put<ApiResponse<DocumentoVehicular>>(`/documentos-vehiculares/${id}`, payload);
  return response.data.data;
}

export async function eliminarDocumentoVehicular(id: number) {
  await api.delete<ApiResponse<null>>(`/documentos-vehiculares/${id}`);
}
