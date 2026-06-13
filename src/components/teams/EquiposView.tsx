import { useEffect, useState } from "react";
import axios from "axios";
import { Users, UserPlus, KeyRound, Copy, Search, PlusCircle } from "lucide-react";
import {
  Estudiante,
  Equipo,
  crearEstudiante,
  crearEquipo,
  listarEstudiantesEquipo,
  unirEstudianteAEquipo
} from "../../services/equipo.service";
import { Modal } from "../ui/Modal";
import { useToast } from "../ui/ToastProvider";

/** Fila "fantasma" usada mientras se carga la lista de estudiantes */
function EstudianteFilaSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700" />
      </td>
    </tr>
  );
}

/** Placeholder animado para el encabezado del equipo mientras carga */
function EquipoHeaderSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 shadow-sm animate-pulse">
      <div className="h-7 w-56 rounded bg-slate-200 dark:bg-slate-700 mb-3" />
      <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

export function EquiposView() {
  const { addToast } = useToast();

  // --- Generar estudiante / PIN ---
  const [nombreNuevoEstudiante, setNombreNuevoEstudiante] = useState("");
  const [generandoPin, setGenerandoPin] = useState(false);
  const [ultimoEstudianteGenerado, setUltimoEstudianteGenerado] = useState<Estudiante | null>(null);

  // --- Equipo activo ---
  const [equipoId, setEquipoId] = useState<number | null>(null);
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [cargandoEquipo, setCargandoEquipo] = useState(false);
  const [errorEquipo, setErrorEquipo] = useState<string | null>(null);

  // --- Crear equipo ---
  const [nombreNuevoEquipo, setNombreNuevoEquipo] = useState("");
  const [creandoEquipo, setCreandoEquipo] = useState(false);

  // --- Buscar equipo existente por id ---
  const [busquedaEquipoId, setBusquedaEquipoId] = useState("");

  // --- Modal "Unirse con PIN" ---
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pinIngresado, setPinIngresado] = useState("");
  const [errorPin, setErrorPin] = useState<string | null>(null);
  const [uniendo, setUniendo] = useState(false);

  const cargarEstudiantes = async (id: number) => {
    setCargandoEquipo(true);
    setErrorEquipo(null);
    try {
      const data = await listarEstudiantesEquipo(id);
      setEstudiantes(data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setErrorEquipo("No se encontró un equipo con ese ID.");
      } else {
        setErrorEquipo("No se pudo cargar la información del equipo.");
      }
      setEstudiantes([]);
    } finally {
      setCargandoEquipo(false);
    }
  };

  useEffect(() => {
    if (equipoId !== null) {
      cargarEstudiantes(equipoId);
    }
  }, [equipoId]);

  const handleGenerarPin = async () => {
    if (!nombreNuevoEstudiante.trim()) {
      addToast({ message: "Escribe el nombre del estudiante", type: "error" });
      return;
    }
    setGenerandoPin(true);
    try {
      const estudiante = await crearEstudiante(nombreNuevoEstudiante.trim());
      setUltimoEstudianteGenerado(estudiante);
      setNombreNuevoEstudiante("");
      addToast({ message: `PIN generado para ${estudiante.nombre}`, type: "success" });
    } catch {
      addToast({ message: "No se pudo generar el PIN", type: "error" });
    } finally {
      setGenerandoPin(false);
    }
  };

  const handleCopiarPin = async (pin: string) => {
    try {
      await navigator.clipboard.writeText(pin);
      addToast({ message: "PIN copiado al portapapeles", type: "success" });
    } catch {
      addToast({ message: "No se pudo copiar el PIN", type: "error" });
    }
  };

  const handleCrearEquipo = async () => {
    if (!nombreNuevoEquipo.trim()) {
      addToast({ message: "Escribe el nombre del equipo", type: "error" });
      return;
    }
    setCreandoEquipo(true);
    try {
      const nuevo = await crearEquipo(nombreNuevoEquipo.trim());
      setEquipo(nuevo);
      setEquipoId(nuevo.id);
      setEstudiantes([]);
      setNombreNuevoEquipo("");
      addToast({ message: `Equipo "${nuevo.name}" creado`, type: "success" });
    } catch {
      addToast({ message: "No se pudo crear el equipo", type: "error" });
    } finally {
      setCreandoEquipo(false);
    }
  };

  const handleBuscarEquipo = () => {
    const id = Number(busquedaEquipoId);
    if (!id || id <= 0) {
      addToast({ message: "Escribe un ID de equipo válido", type: "error" });
      return;
    }
    setEquipo({ id, name: `Equipo #${id}`, createdAt: "", updatedAt: "" });
    setEquipoId(id);
  };

  const handleUnirConPin = async () => {
    if (!equipoId) return;
    if (!pinIngresado.trim()) {
      setErrorPin("Ingresa el PIN del estudiante");
      return;
    }
    setUniendo(true);
    setErrorPin(null);
    try {
      await unirEstudianteAEquipo(equipoId, pinIngresado.trim().toUpperCase());
      addToast({ message: "Estudiante agregado al equipo", type: "success" });
      setModalAbierto(false);
      setPinIngresado("");
      await cargarEstudiantes(equipoId);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const mensaje = (err.response?.data as { error?: string } | undefined)?.error;

        if (status === 404) {
          setErrorPin(mensaje || "No existe ningún estudiante con ese PIN.");
        } else if (status === 400) {
          setErrorPin(mensaje || "Ese PIN ya fue utilizado por otro equipo.");
        } else {
          setErrorPin("Ocurrió un error al unir al estudiante. Intenta nuevamente.");
        }
      } else {
        setErrorPin("Ocurrió un error al unir al estudiante. Intenta nuevamente.");
      }
    } finally {
      setUniendo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generar PIN para un nuevo estudiante */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <UserPlus size={20} className="text-blue-600" />
          <h2 className="font-['Sora'] text-xl font-bold sm:text-2xl">Registrar Estudiante</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Crea un nuevo estudiante y obtén su PIN para que pueda unirse a un equipo.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del estudiante</label>
            <input
              type="text"
              value={nombreNuevoEstudiante}
              onChange={(e) => setNombreNuevoEstudiante(e.target.value)}
              placeholder="Ej. Matias Gómez"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleGenerarPin}
            disabled={generandoPin}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-500/10 disabled:opacity-50"
          >
            <KeyRound size={18} />
            {generandoPin ? "Generando..." : "Generar PIN"}
          </button>
        </div>

        {ultimoEstudianteGenerado && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                PIN para <span className="font-semibold">{ultimoEstudianteGenerado.nombre}</span>:
              </p>
              <p className="font-['Sora'] text-2xl font-bold tracking-widest text-emerald-700 dark:text-emerald-400">
                {ultimoEstudianteGenerado.pin}
              </p>
            </div>
            <button
              onClick={() => handleCopiarPin(ultimoEstudianteGenerado.pin)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              <Copy size={14} />
              Copiar
            </button>
          </div>
        )}
      </div>

      {/* Equipo */}
      {!equipoId ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users size={20} className="text-blue-600" />
            <h2 className="font-['Sora'] text-xl font-bold sm:text-2xl">Equipo</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Crea un nuevo equipo o ingresa el ID de uno existente para ver sus participantes.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Crear nuevo equipo</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nombreNuevoEquipo}
                  onChange={(e) => setNombreNuevoEquipo(e.target.value)}
                  placeholder="Nombre del equipo"
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCrearEquipo}
                  disabled={creandoEquipo}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all disabled:opacity-50"
                >
                  <PlusCircle size={16} />
                  Crear
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ver equipo existente</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={busquedaEquipoId}
                  onChange={(e) => setBusquedaEquipoId(e.target.value)}
                  placeholder="ID del equipo"
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleBuscarEquipo}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
                >
                  <Search size={16} />
                  Cargar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : cargandoEquipo && estudiantes.length === 0 ? (
        <EquipoHeaderSkeleton />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-['Sora'] text-2xl font-bold sm:text-3xl">{equipo?.name ?? `Equipo #${equipoId}`}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {estudiantes.length} estudiante{estudiantes.length === 1 ? "" : "s"} en este equipo
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEquipoId(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                Cambiar equipo
              </button>
              <button
                onClick={() => {
                  setPinIngresado("");
                  setErrorPin(null);
                  setModalAbierto(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-500/10"
              >
                <KeyRound size={18} />
                Unirse con PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de estudiantes */}
      {equipoId && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-panel">
          {errorEquipo ? (
            <div className="flex h-40 items-center justify-center text-slate-500 dark:text-slate-400">{errorEquipo}</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold">Nombre</th>
                  <th className="px-6 py-3 text-sm font-semibold">PIN</th>
                  <th className="px-6 py-3 text-sm font-semibold">Se unió</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {cargandoEquipo ? (
                  <>
                    <EstudianteFilaSkeleton />
                    <EstudianteFilaSkeleton />
                    <EstudianteFilaSkeleton />
                  </>
                ) : estudiantes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                      Aún no hay estudiantes en este equipo. Usa &quot;Unirse con PIN&quot; para agregar el primero.
                    </td>
                  </tr>
                ) : (
                  estudiantes.map((est) => (
                    <tr key={est.id}>
                      <td className="px-6 py-4 font-medium">{est.nombre}</td>
                      <td className="px-6 py-4 font-mono tracking-widest">{est.pin}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {est.updatedAt ? new Date(est.updatedAt).toLocaleString("es-CO") : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal: Unirse con PIN */}
      <Modal abierto={modalAbierto} titulo="Unirse al equipo con PIN" onCerrar={() => setModalAbierto(false)}>
        <div className="space-y-4">
          {errorPin && (
            <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {errorPin}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">PIN del estudiante</label>
            <input
              type="text"
              value={pinIngresado}
              onChange={(e) => setPinIngresado(e.target.value)}
              placeholder="Ej. W5WZ96"
              maxLength={6}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 px-3 py-2 text-sm font-mono tracking-widest uppercase outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setModalAbierto(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              Cancelar
            </button>
            <button
              onClick={handleUnirConPin}
              disabled={uniendo}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all disabled:opacity-50"
            >
              {uniendo ? "Uniendo..." : "Unirse"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
