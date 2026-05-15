import { useState } from "react";
import { Login, UsuarioAutenticado } from "./components/auth/Login";
import { AdminLayout } from "./components/layout/AdminLayout";
import { clearAuthToken, getAuthToken } from "./services/api";
import { logout } from "./services/auth.service";

const AUTH_USER_KEY = "trans_ruta_usuario";

function getInitialUser(): UsuarioAutenticado | null {
  const token = getAuthToken();
  const raw = localStorage.getItem(AUTH_USER_KEY);

  if (!token || !raw) {
    return null;
  }

  try {
    const user = JSON.parse(raw) as Omit<UsuarioAutenticado, "token">;
    return {
      ...user,
      token
    };
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    clearAuthToken();
    return null;
  }
}

interface DriverAppProps {
  onCerrarSesion: () => void;
}

function DriverApp({ onCerrarSesion }: DriverAppProps) {
  return <AdminLayout onCerrarSesion={onCerrarSesion} />;
}

function App() {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(() => getInitialUser());
  const isAuthenticated = Boolean(usuario);

  const manejarLoginExitoso = (userData: UsuarioAutenticado) => {
    localStorage.setItem(
      AUTH_USER_KEY,
      JSON.stringify({
        id: userData.id,
        nombre: userData.nombre,
        rol: userData.rol,
        correo: userData.correo
      })
    );
    setUsuario(userData);
  };

  const manejarCierreSesion = () => {
    void logout();
    localStorage.removeItem(AUTH_USER_KEY);
    clearAuthToken();
    setUsuario(null);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={manejarLoginExitoso} />;
  }

  if (!usuario) {
    return <Login onLoginSuccess={manejarLoginExitoso} />;
  }

  return <DriverApp onCerrarSesion={manejarCierreSesion} />;
}

export default App;
