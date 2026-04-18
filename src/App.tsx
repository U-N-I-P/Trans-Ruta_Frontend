import { useState } from "react";
import { Login, UsuarioAutenticado } from "./components/auth/Login";
import { AdminLayout } from "./components/layout/AdminLayout";

interface DriverAppProps {
  onCerrarSesion: () => void;
}

function DriverApp({ onCerrarSesion }: DriverAppProps) {
  return <AdminLayout onCerrarSesion={onCerrarSesion} />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);

  const manejarLoginExitoso = (userData: UsuarioAutenticado) => {
    setUsuario(userData);
    setIsAuthenticated(true);
  };

  const manejarCierreSesion = () => {
    setUsuario(null);
    setIsAuthenticated(false);
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
