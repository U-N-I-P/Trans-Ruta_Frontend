import api, { setAuthToken } from "./api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const TOKEN_STORAGE_KEY = "transruta_auth_token";
const USER_STORAGE_KEY = "transruta_auth_user";

export interface UsuarioAutenticado {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
}

export function getStoredSession() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const user = localStorage.getItem(USER_STORAGE_KEY);

  if (!token || !user) return null;

  try {
    const usuario = JSON.parse(user) as UsuarioAutenticado;
    setAuthToken(token);

    return {
      token,
      usuario
    };
  } catch {
    clearStoredSession();
    return null;
  }
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  setAuthToken(null);
}

export async function login(correo: string, contrasena: string) {
  const response = await api.post<ApiResponse<{ token: string; usuario: UsuarioAutenticado }>>(
    "/auth/login",
    { correo, contrasena }
  );

  const { token, usuario } = response.data.data;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuario));
  setAuthToken(token);

  return { token, usuario };
}

export async function fetchMe() {
  const response = await api.get<ApiResponse<UsuarioAutenticado>>("/auth/me");
  return response.data.data;
}
