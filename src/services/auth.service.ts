import { api, clearAuthToken, setAuthToken } from "./api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginPayload {
  correo: string;
  contrasena: string;
}

export interface UsuarioSesion {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioSesion;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<ApiResponse<LoginResponse>>("/auth/login", payload);
  const data = response.data.data;

  setAuthToken(data.token);

  return data;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    clearAuthToken();
  }
}
