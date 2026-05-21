import api from "./api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuditoriaLog {
  id: number;
  usuarioId: number;
  accion: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT" | "ASSIGN" | "LOGIN" | "LOGOUT";
  entidad: string;
  entidadId: number | null;
  ipAddress: string | null;
  datosAnteriores?: unknown;
  datosNuevos?: unknown;
  createdAt: string;
}


export async function obtenerLogsAuditoria() {
  const response = await api.get<ApiResponse<AuditoriaLog[]>>("/auditoria");
  return response.data.data;
}
