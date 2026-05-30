import { api } from "./api";

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

export type RolUsuario =
  | "ADMINISTRADOR"
  | "DESPACHADOR"
  | "CONDUCTOR"
  | "CLIENTE"
  | "JEFE_TALLER"
  | "GESTOR_INVENTARIO"
  | "AUDITOR";

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  createdAt: string;
  updatedAt: string;
}

export interface UsuarioInput {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: RolUsuario;
}

export type UsuarioUpdateInput = Partial<UsuarioInput>;

export async function obtenerUsuarios(params?: Record<string, string | number | boolean | undefined>) {
  const response = await api.get<ApiResponse<Usuario[]>>("/usuarios", { params });
  return response.data.data;
}

export async function obtenerUsuarioPorId(id: number) {
  const response = await api.get<ApiResponse<Usuario>>(`/usuarios/${id}`);
  return response.data.data;
}

export async function crearUsuario(payload: UsuarioInput) {
  const response = await api.post<ApiResponse<Usuario>>("/usuarios", payload);
  return response.data.data;
}

export async function actualizarUsuario(id: number, payload: UsuarioUpdateInput) {
  const response = await api.put<ApiResponse<Usuario>>(`/usuarios/${id}`, payload);
  return response.data.data;
}

export async function eliminarUsuario(id: number) {
  await api.delete<ApiResponse<null>>(`/usuarios/${id}`);
}