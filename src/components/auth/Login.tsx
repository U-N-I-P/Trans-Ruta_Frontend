import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { Truck } from "lucide-react";
import { login } from "../../services/auth.service";

interface LoginFormValues {
  correo: string;
  contrasena: string;
}

export interface UsuarioAutenticado {
  id: number;
  nombre: string;
  rol: string;
  correo: string;
  token: string;
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

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setErrorLogin(null);
    setVerificando(true);

    try {
      const data = await login({
        correo: values.correo.trim(),
        contrasena: values.contrasena.trim()
      });

      onLoginSuccess({
        id: data.usuario.id,
        nombre: data.usuario.nombre,
        rol: data.usuario.rol,
        correo: data.usuario.correo,
        token: data.token
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorLogin(error.response?.data?.message ?? "No fue posible iniciar sesión. Verifica correo, contraseña y conexión con el backend.");
      } else {
        setErrorLogin("No fue posible iniciar sesión. Verifica correo, contraseña y conexión con el backend.");
      }
    } finally {
      setVerificando(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 px-4 py-8 flex items-center justify-center relative overflow-hidden">
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25"></div>
      
      {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]"></div>
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]"></div>

      <section className="relative z-10 w-full max-w-md">
        <div className="w-full rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 backdrop-blur-xl shadow-2xl">
          <header className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 shadow-inner">
              <Truck size={28} />
            </div>
            <h1 className="font-['Sora'] text-2xl font-bold tracking-tight text-white">Trans-Ruta</h1>
            <p className="mt-2 text-xs font-medium text-slate-400">
              Fleet Operations Control Center
            </p>
          </header>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Correo electrónico</span>
              <input
                type="email"
                autoComplete="username"
                placeholder="usuario@transruta.com"
                className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                {...register("correo", { required: "Este campo es obligatorio" })}
              />
              {errors.correo && <p className="text-xs font-medium text-red-500">{errors.correo.message}</p>}
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Contraseña</span>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                {...register("contrasena", { required: "Este campo es obligatorio" })}
              />
              {errors.contrasena && <p className="text-xs font-medium text-red-500">{errors.contrasena.message}</p>}
            </div>

            {errorLogin && (
              <p className="rounded-xl border border-red-500/20 bg-red-950/30 px-3.5 py-2.5 text-xs text-red-400 leading-relaxed">
                {errorLogin}
              </p>
            )}

            <button
              type="submit"
              disabled={verificando}
              className="mt-2 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-blue-600/20"
            >
              {verificando ? "Autenticando..." : "Iniciar Sesión"}
            </button>
          </form>
        </div>
        
        <p className="mt-6 text-center text-[10px] text-slate-500 font-medium tracking-wide">
          SISTEMA DE CONTROL DE FLOTA • PROTEGIDO CON SSL
        </p>
      </section>
    </main>
  );
}
