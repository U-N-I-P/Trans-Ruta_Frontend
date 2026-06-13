import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  UserPlus,
  KeyRound,
  Copy,
  Check,
  Search,
  PlusCircle,
  RefreshCw,
  UserCheck,
  ShieldAlert,
  Loader2
} from "lucide-react";
import {
  Estudiante,
  Equipo,
  generarPin,
  registrarEstudiante,
  crearEquipo,
  listarEquipos,
  listarEstudiantesEquipo,
  unirEstudianteAEquipo,
  listarEstudiantes
} from "../../services/equipo.service";
import { Modal } from "../ui/Modal";
import { useToast } from "../ui/ToastProvider";

export function EquiposView() {
  const { addToast } = useToast();

  // Lists
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [teams, setTeams] = useState<Equipo[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Equipo | null>(null);
  const [selectedTeamStudents, setSelectedTeamStudents] = useState<Estudiante[]>([]);

  // Inputs
  const [regStudentName, setRegStudentName] = useState("");
  const [regStudentPin, setRegStudentPin] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pinIngresado, setPinIngresado] = useState("");
  const [errorPin, setErrorPin] = useState<string | null>(null);
  const [uniendo, setUniendo] = useState(false);

  // Status/Loading States
  const [loading, setLoading] = useState(false);
  const [generatingPin, setGeneratingPin] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [loadingTeamStudents, setLoadingTeamStudents] = useState(false);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [lastPinGenerated, setLastPinGenerated] = useState<string | null>(null);

  // Initial data loading
  const fetchData = async () => {
    setLoading(true);
    try {
      const [allEstudiantes, allTeams] = await Promise.all([
        listarEstudiantes(),
        listarEquipos()
      ]);
      setEstudiantes(allEstudiantes || []);
      setTeams(allTeams || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      addToast({
        message: "Error al sincronizar datos del servidor.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  // Load active team roster
  const loadRoster = async (teamId: number) => {
    setLoadingTeamStudents(true);
    try {
      const roster = await listarEstudiantesEquipo(teamId);
      setSelectedTeamStudents(roster || []);
    } catch (error) {
      console.error("Error al cargar integrantes:", error);
      addToast({ message: "No se pudieron obtener los integrantes del equipo.", type: "error" });
    } finally {
      setLoadingTeamStudents(false);
    }
  };

  useEffect(() => {
    if (selectedTeam) {
      void loadRoster(selectedTeam.id);
    } else {
      setSelectedTeamStudents([]);
    }
  }, [selectedTeam]);

  // Step 1: Admin generates a new empty PIN
  const handleGeneratePin = async () => {
    setGeneratingPin(true);
    setLastPinGenerated(null);
    try {
      const pin = await generarPin();
      setLastPinGenerated(pin);
      addToast({ message: `¡PIN ${pin} generado exitosamente!`, type: "success" });
      
      // Refresh students to show the new pending PIN
      const allEstudiantes = await listarEstudiantes();
      setEstudiantes(allEstudiantes || []);
    } catch (error) {
      console.error(error);
      addToast({ message: "Error al generar un PIN de registro", type: "error" });
    } finally {
      setGeneratingPin(false);
    }
  };

  // Step 2: Student completes registration using a PIN
  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regStudentName.trim() || !regStudentPin.trim()) {
      addToast({ message: "El nombre y el PIN son requeridos", type: "error" });
      return;
    }

    setRegistering(true);
    try {
      const pinUpper = regStudentPin.trim().toUpperCase();
      const student = await registrarEstudiante(regStudentName.trim(), pinUpper);
      addToast({ message: `Estudiante ${student.nombre} registrado con éxito`, type: "success" });
      
      setRegStudentName("");
      setRegStudentPin("");
      
      // If we just consumed the last generated PIN, hide the box
      if (lastPinGenerated === pinUpper) {
        setLastPinGenerated(null);
      }

      // Refresh list
      const allEstudiantes = await listarEstudiantes();
      setEstudiantes(allEstudiantes || []);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data?.error || "PIN inválido o ya utilizado.";
      addToast({ message: msg, type: "error" });
    } finally {
      setRegistering(false);
    }
  };

  // Team creation
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setCreatingTeam(true);
    try {
      const team = await crearEquipo(newTeamName.trim());
      addToast({ message: `Equipo "${team.name}" creado con éxito`, type: "success" });
      setNewTeamName("");
      
      // Refresh teams
      const allTeams = await listarEquipos();
      setTeams(allTeams || []);
      // Auto-select the newly created team
      setSelectedTeam(team);
    } catch (error) {
      console.error(error);
      addToast({ message: "Error al crear el equipo", type: "error" });
    } finally {
      setCreatingTeam(false);
    }
  };

  // Join a student using their PIN to selected team
  const handleUnirConPin = async () => {
    if (!selectedTeam) return;
    if (!pinIngresado.trim()) {
      setErrorPin("Ingresa el PIN del estudiante");
      return;
    }

    setUniendo(true);
    setErrorPin(null);
    try {
      const pinUpper = pinIngresado.trim().toUpperCase();
      await unirEstudianteAEquipo(selectedTeam.id, pinUpper);
      addToast({ message: "Estudiante agregado al equipo exitosamente", type: "success" });
      
      setModalAbierto(false);
      setPinIngresado("");
      
      // Refresh roster & global list
      await Promise.all([
        loadRoster(selectedTeam.id),
        listarEstudiantes().then(data => setEstudiantes(data || []))
      ]);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const mensaje = (err.response?.data as { error?: string } | undefined)?.error;

        if (status === 404) {
          setErrorPin(mensaje || "No existe ningún estudiante con ese PIN.");
        } else if (status === 400) {
          setErrorPin(mensaje || "El estudiante ya pertenece a un equipo.");
        } else {
          setErrorPin("Ocurrió un error al unir al estudiante.");
        }
      } else {
        setErrorPin("Ocurrió un error al unir al estudiante.");
      }
    } finally {
      setUniendo(false);
    }
  };

  const handleCopyPin = (pin: string) => {
    void navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    addToast({ message: "PIN copiado al portapapeles", type: "success" });
    setTimeout(() => setCopiedPin(null), 2000);
  };

  // Map team ID to Name for catalog view
  const getTeamName = (teamId: number | null) => {
    if (!teamId) return null;
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : `Equipo #${teamId}`;
  };

  // Filter student catalog
  const filteredEstudiantes = estudiantes.filter(est => {
    const query = searchQuery.toLowerCase();
    const nameMatch = est.nombre ? est.nombre.toLowerCase().includes(query) : "pendiente".includes(query);
    const pinMatch = est.pin.toLowerCase().includes(query);
    return nameMatch || pinMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="text-blue-600" /> Módulo de Equipos y Estudiantes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Genera PINs de registro, inscribe estudiantes y agrégalos a sus respectivos equipos de trabajo.
          </p>
        </div>
        <button
          onClick={() => void fetchData()}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Sincronizar
        </button>
      </div>

      {loading && estudiantes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-slate-100/50 dark:bg-slate-900/20 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="animate-spin text-blue-500 mb-3" size={32} />
          <span className="text-sm text-slate-500 dark:text-slate-400">Cargando base de datos...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Registro e Identidad */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Paso 1: Generador de PINs */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                <KeyRound className="text-blue-600" /> 1. Generar PIN de Acceso
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                El Administrador genera un PIN seguro y vacío en el sistema. Los estudiantes se registrarán usando este PIN.
              </p>
              
              <button
                onClick={handleGeneratePin}
                disabled={generatingPin}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-sm font-semibold text-white rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition active:scale-[0.99]"
              >
                {generatingPin ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <KeyRound size={16} />
                )}
                Generar PIN Único
              </button>

              {lastPinGenerated && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 flex flex-col items-center justify-center text-center animate-fade-in">
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">PIN Generado</span>
                  <div className="mt-2.5 flex items-center justify-between gap-3 w-full bg-white dark:bg-slate-950 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="font-mono text-xl font-bold tracking-widest text-blue-700 dark:text-blue-400 select-all">
                      {lastPinGenerated}
                    </span>
                    <button
                      onClick={() => handleCopyPin(lastPinGenerated)}
                      className="p-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-md transition"
                      title="Copiar PIN"
                    >
                      {copiedPin === lastPinGenerated ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                    Copia este PIN y entrégalo al estudiante para que complete su registro.
                  </p>
                </div>
              )}
            </div>

            {/* Paso 2: Registro de Estudiantes */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                <UserPlus className="text-blue-600" /> 2. Registrar Estudiante
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                El estudiante ingresa su nombre y consume uno de los PINs generados previamente por el administrador.
              </p>
              
              <form onSubmit={handleRegisterStudent} className="space-y-3.5">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Nombre del Estudiante</label>
                  <input
                    type="text"
                    required
                    value={regStudentName}
                    onChange={(e) => setRegStudentName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">PIN de Registro</label>
                  <input
                    type="text"
                    required
                    value={regStudentPin}
                    onChange={(e) => setRegStudentPin(e.target.value)}
                    placeholder="Ej. W5WZ96"
                    maxLength={6}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 px-3.5 py-2.5 text-sm font-mono tracking-widest uppercase outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={registering || !regStudentName.trim() || !regStudentPin.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-sm font-semibold text-white rounded-xl shadow-lg shadow-blue-500/10 transition active:scale-[0.99]"
                >
                  {registering ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  Completar Registro
                </button>
              </form>
            </div>

            {/* Crear Equipo */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                <Users className="text-blue-600" /> Crear Equipo
              </h2>
              <form onSubmit={handleCreateTeam} className="space-y-3">
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Nombre del nuevo equipo"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={creatingTeam || !newTeamName.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-sm font-semibold text-white rounded-xl shadow-lg shadow-blue-500/10 transition active:scale-[0.99]"
                >
                  {creatingTeam ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <PlusCircle size={16} />
                  )}
                  Crear Equipo de Trabajo
                </button>
              </form>
            </div>

          </div>

          {/* Columna Derecha/Central: Gestión de Equipos e Integrantes */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Listado de Equipos Activos */}
              <div className="bg-white dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[380px]">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-3 text-slate-900 dark:text-slate-100">
                  <Users size={18} className="text-blue-600" /> Equipos Activos ({teams.length})
                </h2>
                <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                  {teams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                      <Users size={32} className="opacity-20 mb-2" />
                      <span>No hay equipos registrados</span>
                    </div>
                  ) : (
                    teams.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTeam(t)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition ${
                          selectedTeam?.id === t.id
                            ? "bg-blue-550/15 dark:bg-blue-600/20 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-100 font-semibold"
                            : "bg-slate-50/45 dark:bg-slate-950/35 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="text-sm truncate font-medium">{t.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {t.id}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          selectedTeam?.id === t.id
                            ? "bg-blue-100 dark:bg-blue-550/30 text-blue-700 dark:text-blue-300"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}>
                          Roster
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Roster e Integrantes */}
              <div className="bg-white dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[380px]">
                {selectedTeam ? (
                  <>
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex justify-between items-start gap-2">
                      <div className="truncate">
                        <span className="text-[9px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">Equipo</span>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{selectedTeam.name}</h2>
                      </div>
                      <button
                        onClick={() => {
                          setPinIngresado("");
                          setErrorPin(null);
                          setModalAbierto(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition shrink-0"
                      >
                        <UserPlus size={14} />
                        Unir Integrante
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                      {loadingTeamStudents ? (
                        <div className="flex items-center justify-center py-12 text-slate-400 text-xs gap-2">
                          <Loader2 className="animate-spin text-blue-500" size={14} />
                          Cargando roster...
                        </div>
                      ) : selectedTeamStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs py-8 text-center">
                          <ShieldAlert size={24} className="opacity-20 mb-1.5" />
                          <span>Sin estudiantes en este equipo</span>
                          <span className="text-[10px] text-slate-500 mt-1">Usa &quot;Unir Integrante&quot; para agregarlos con su PIN</span>
                        </div>
                      ) : (
                        selectedTeamStudents.map((st) => (
                          <div
                            key={st.id}
                            className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-800/80"
                          >
                            <div className="truncate pr-2">
                              <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">{st.nombre}</p>
                              <p className="font-mono text-[9px] text-slate-400 mt-0.5">PIN: {st.pin}</p>
                            </div>
                            <span className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                              <UserCheck size={10} /> Integrante
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm text-center">
                    <Users size={48} className="opacity-15 mb-3" />
                    <p className="font-medium text-slate-500">Selecciona un Equipo</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                      Elige un equipo activo de la izquierda para ver y gestionar su roster de estudiantes.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Listado General de Estudiantes */}
            <div className="bg-white dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[400px]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users size={18} className="text-blue-600" /> Estudiantes en el Sistema ({estudiantes.length})
                </h2>
                
                {/* Filtro buscador */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar por nombre o PIN..."
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl pl-8.5 pr-4 py-2 text-xs outline-none transition"
                  />
                </div>
              </div>

              {/* Renders Tabular catalog */}
              <div className="flex-1 overflow-auto">
                {filteredEstudiantes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                    <Search size={32} className="opacity-20 mb-2" />
                    <span>No se encontraron estudiantes</span>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">ID</th>
                        <th className="py-2.5 px-3">Nombre</th>
                        <th className="py-2.5 px-3">PIN Único</th>
                        <th className="py-2.5 px-3">Lobby / Equipo</th>
                        <th className="py-2.5 px-3 text-right">Copiar PIN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-600 dark:text-slate-300">
                      {filteredEstudiantes.map((est) => {
                        const teamNameMapped = getTeamName(est.equipoId);
                        const isPending = est.nombre === null;
                        return (
                          <tr key={est.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                            <td className="py-3 px-3 font-mono text-[10px] text-slate-400">#{est.id}</td>
                            <td className="py-3 px-3">
                              {isPending ? (
                                <span className="text-amber-600 dark:text-amber-400 font-medium italic">
                                  [PIN Libre / Pendiente de Registro]
                                </span>
                              ) : (
                                <span className="font-semibold text-slate-900 dark:text-slate-100">{est.nombre}</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-mono bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-850 text-blue-600 dark:text-blue-400 font-bold select-all">
                                {est.pin}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              {teamNameMapped ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                                  {teamNameMapped}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full">
                                  Sin Equipo
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => handleCopyPin(est.pin)}
                                className="text-slate-400 hover:text-blue-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                                title="Copiar PIN"
                              >
                                {copiedPin === est.pin ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Modal para Unir a un equipo */}
      {selectedTeam && (
        <Modal
          abierto={modalAbierto}
          titulo={`Unir Estudiante a ${selectedTeam.name}`}
          onCerrar={() => setModalAbierto(false)}
        >
          <div className="space-y-4">
            {errorPin && (
              <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {errorPin}
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Ingresa el PIN único del estudiante para asociarlo formalmente al roster de este equipo.
              </p>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">PIN del estudiante</label>
              <input
                type="text"
                value={pinIngresado}
                onChange={(e) => setPinIngresado(e.target.value)}
                placeholder="Ej. W5WZ96"
                maxLength={6}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 px-3 py-2.5 text-sm font-mono tracking-widest uppercase outline-none focus:ring-2 focus:ring-blue-500"
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
                disabled={uniendo || !pinIngresado.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all disabled:opacity-50"
              >
                {uniendo ? "Uniendo..." : "Unir al Equipo"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
