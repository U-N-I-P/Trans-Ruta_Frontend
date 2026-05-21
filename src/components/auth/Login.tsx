import { useState } from "react";
import { useForm } from "react-hook-form";
import { Truck } from "lucide-react";
import { login, UsuarioAutenticado } from "../../services/auth.service";

interface LoginFormValues {
  correo: string;
  contrasena: string;
}

interface LoginProps {
  onLoginSuccess: (userData: UsuarioAutenticado) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [verificando, setVerificando] = useState(false);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    defaultValues: {
      correo: "",
      contrasena: ""
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorLogin(null);
    setVerificando(true);

    try {
      const { usuario } = await login(values.correo.trim(), values.contrasena.trim());
      onLoginSuccess(usuario);
    } catch (error) {
      setErrorLogin("Credenciales inválidas o error de conexión.");
    } finally {
      setVerificando(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-logistics-900 to-logistics-800 px-4 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-3xl bg-white p-6 shadow-panel">
          <header className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-logistics-100 text-logistics-800">
              <Truck size={34} />
            </div>
            <h1 className="font-['Sora'] text-3xl font-bold text-logistics-900">Trans-Ruta</h1>
            <p className="mt-2 text-sm font-medium text-slate-600">
              Bienvenido a Trans-Ruta - Portal de Conductores
            </p>
          </header>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700">Correo</span>
              <input
                type="email"
                autoComplete="username"
                placeholder="Ingresa tu correo"
                className="h-12 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-800 outline-none transition focus:border-logistics-700 focus:ring-2 focus:ring-logistics-100"
                {...register("correo", { required: "Este campo es obligatorio" })}
              />
              {errors.correo && <p className="text-xs font-medium text-red-600">{errors.correo.message}</p>}
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700">Contraseña</span>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Ingresa tu contraseña"
                className="h-12 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-800 outline-none transition focus:border-logistics-700 focus:ring-2 focus:ring-logistics-100"
                {...register("contrasena", { required: "Este campo es obligatorio" })}
              />
              {errors.contrasena && <p className="text-xs font-medium text-red-600">{errors.contrasena.message}</p>}
            </label>

            {errorLogin && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{errorLogin}</p>}

            <button
              type="submit"
              disabled={verificando}
              className="h-12 w-full rounded-xl bg-logistics-800 text-base font-semibold text-white transition hover:bg-logistics-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {verificando ? "Verificando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
