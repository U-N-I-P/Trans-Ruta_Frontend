import { useEffect, useState } from "react";
import { Login } from "./components/auth/Login";
import { AdminLayout } from "./components/layout/AdminLayout";
import { clearStoredSession, fetchMe, getStoredSession, UsuarioAutenticado } from "./services/auth.service";

interface DriverAppProps {
  onCerrarSesion: () => void;
}

function DriverApp({ onCerrarSesion }: DriverAppProps) {
  return <AdminLayout onCerrarSesion={onCerrarSesion} />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const stored = getStoredSession();
    if (!stored) {
      setAuthChecked(true);
      return;
    }

    fetchMe()
      .then((user) => {
        setUsuario(user);
        setIsAuthenticated(true);
      })
      .catch(() => {
        clearStoredSession();
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);

  const manejarLoginExitoso = (userData: UsuarioAutenticado) => {
    setUsuario(userData);
    setIsAuthenticated(true);
  };

  const manejarCierreSesion = () => {
    clearStoredSession();
    setUsuario(null);
    setIsAuthenticated(false);
  };

  if (!authChecked) {
    return null;
  }

  if (!isAuthenticated || !usuario) {
    return <Login onLoginSuccess={manejarLoginExitoso} />;
  }

  return <DriverApp onCerrarSesion={manejarCierreSesion} />;
}

export default App;
