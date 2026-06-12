import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle, DollarSign, Edit3, FileText, Plus } from "lucide-react";
import { Conductor, OrdenDespacho } from "../../types/domain";
import {
  actualizarViatico,
  crearViatico,
  obtenerViaticos,
  Viatico,
  ViaticoInput
} from "../../services/viatico.service";
import {
  aprobarGastoViatico,
  GastoViatico,
  GastoViaticInput,
  obtenerGastosViatico,
  registrarGastoViatico,
  rechazarGastoViatico,
} from "../../services/gastoViatico.service";

interface ViaticosListViewProps {
  conductores: Conductor[];
  ordenes: OrdenDespacho[];
}

type FormMode = "CREAR" | "EDITAR";

const categoriasValidas: GastoViaticInput["categoria"][] = ["COMBUSTIBLE", "PEAJES", "ALIMENTACION", "HOSPEDAJE", "OTROS"];

function money(value: number) {
  return `$${value.toLocaleString("es-CO")}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowLocalInput() {
  return new Date().toISOString().slice(0, 16);
}

export function ViaticosListView({ conductores, ordenes }: ViaticosListViewProps) {
  const [viaticos, setViaticos] = useState<Viatico[]>([]);
  const [gastosByViatico, setGastosByViatico] = useState<Record<number, GastoViatico[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showViaticoForm, setShowViaticoForm] = useState(false);
  const [showGastoForm, setShowGastoForm] = useState(false);
  const [mode, setMode] = useState<FormMode>("CREAR");
  const [editingViaticoId, setEditingViaticoId] = useState<number | null>(null);

  const [viaticoForm, setViaticoForm] = useState<ViaticoInput>({
    conductorId: conductores[0]?.id || 0,
    ordenDeDespachoId: ordenes[0]?.id || 0,
    monto: 0,
    estado: "APROBADO",
    fecha: today(),
    descripcion: ""
  });

  const [gastoForm, setGastoForm] = useState<GastoViaticInput>({
    viaticoId: 0,
    monto: 0,
    categoria: "COMBUSTIBLE",
    descripcion: "",
    evidenciaFotografica: "",
    fechaHora: nowLocalInput()
  });

  const conductorById = useMemo(() => new Map(conductores.map((item) => [item.id, item])), [conductores]);
  const ordenById = useMemo(() => new Map(ordenes.map((item) => [item.id, item])), [ordenes]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const viaticosList = await obtenerViaticos();
      setViaticos(viaticosList);

      const gastMap: Record<number, GastoViatico[]> = {};
      await Promise.all(
        viaticosList.map(async (viatico) => {
          gastMap[viatico.id] = await obtenerGastosViatico(viatico.id);
        })
      );
      setGastosByViatico(gastMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar viáticos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarDatos();
  }, []);

  const gastoAprobado = (viaticoId: number) =>
    (gastosByViatico[viaticoId] ?? [])
      .filter((gasto) => gasto.estado === "APROBADO")
      .reduce((acc, gasto) => acc + Number(gasto.monto), 0);

  const resumen = useMemo(() => {
    const asignado = viaticos.reduce((acc, viatico) => acc + Number(viatico.monto), 0);
    const aprobado = viaticos.reduce((acc, viatico) => acc + gastoAprobado(viatico.id), 0);
    const saldo = viaticos.reduce((acc, viatico) => acc + Math.max(0, Number(viatico.monto) - gastoAprobado(viatico.id)), 0);
    const alertas = viaticos.filter((viatico) => {
      const uso = viatico.monto > 0 ? (gastoAprobado(viatico.id) / viatico.monto) * 100 : 0;
      return uso >= 90;
    }).length;
    return { asignado, aprobado, saldo, alertas };
  }, [viaticos, gastosByViatico]);

  const resetViaticoForm = () => {
    setViaticoForm({
      conductorId: conductores[0]?.id || 0,
      ordenDeDespachoId: ordenes[0]?.id || 0,
      monto: 0,
      estado: "APROBADO",
      fecha: today(),
      descripcion: ""
    });
    setMode("CREAR");
    setEditingViaticoId(null);
  };

  const resetGastoForm = (viaticoId?: number) => {
    setGastoForm({
      viaticoId: viaticoId ?? viaticos[0]?.id ?? 0,
      monto: 0,
      categoria: "COMBUSTIBLE",
      descripcion: "",
      evidenciaFotografica: "",
      fechaHora: nowLocalInput()
    });
  };

  const startEdit = (viatico: Viatico) => {
    setMode("EDITAR");
    setEditingViaticoId(viatico.id);
    setViaticoForm({
      conductorId: viatico.conductorId,
      ordenDeDespachoId: viatico.ordenDeDespachoId,
      monto: Number(viatico.monto),
      estado: viatico.estado,
      fecha: viatico.fecha,
      descripcion: viatico.descripcion ?? ""
    });
    setShowViaticoForm(true);
  };

  const guardarViatico = async () => {
    try {
      const aprobadoPrevio = editingViaticoId ? gastoAprobado(editingViaticoId) : 0;
      const saldoCalculado = Math.max(0, Number(viaticoForm.monto) - aprobadoPrevio);

      if (mode === "EDITAR" && editingViaticoId) {
        await actualizarViatico(editingViaticoId, {
          ...viaticoForm,
          saldo: saldoCalculado,
          fecha: viaticoForm.fecha ?? today()
        });
      } else {
        await crearViatico({
          ...viaticoForm,
          saldo: Number(viaticoForm.monto),
          fecha: viaticoForm.fecha ?? today()
        });
      }

      setShowViaticoForm(false);
      resetViaticoForm();
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el viático");
    }
  };

  const guardarGasto = async () => {
    try {
      await registrarGastoViatico({
        ...gastoForm,
        monto: Number(gastoForm.monto),
        descripcion: gastoForm.descripcion.trim(),
        evidenciaFotografica: gastoForm.evidenciaFotografica?.trim() || undefined,
        fechaHora: gastoForm.fechaHora || nowLocalInput()
      });
      setShowGastoForm(false);
      resetGastoForm();
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el gasto");
    }
  };

  const cambiarEstadoGasto = async (gastoId: number, accion: "aprobar" | "rechazar") => {
    const comentarios = window.prompt("Comentarios para la decisión:") ?? "";
    if (!comentarios.trim()) return;

    try {
      if (accion === "aprobar") {
        await aprobarGastoViatico(gastoId, comentarios);
      } else {
        await rechazarGastoViatico(gastoId, comentarios);
      }
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el gasto");
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Gestión de Viáticos</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Asigna presupuestos, registra gastos y liquida cada viaje</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              resetViaticoForm();
              setMode("CREAR");
              setShowViaticoForm((prev) => !prev);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 transition-colors font-semibold shadow-md shadow-blue-500/10"
          >
            <Plus size={18} />
            Nuevo Viático
          </button>
          <button
            type="button"
            onClick={() => {
              resetGastoForm();
              setShowGastoForm((prev) => !prev);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-4 py-2 text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold transition-colors shadow-sm"
          >
            <DollarSign size={18} />
            Registrar Gasto
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-xs text-red-400">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">Asignado</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{money(resumen.asignado)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">Aprobado</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{money(resumen.aprobado)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">Saldo restante</p>
          <p className="text-2xl font-bold text-green-600 dark:text-emerald-400">{money(resumen.saldo)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">Alertas &gt; 90%</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{resumen.alertas}</p>
        </div>
      </div>

      {showViaticoForm && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <Edit3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            {mode === "EDITAR" ? "Editar viático" : "Asignar viático a orden"}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Conductor</span>
              <select
                value={viaticoForm.conductorId}
                onChange={(e) => setViaticoForm((prev) => ({ ...prev, conductorId: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {conductores.map((conductor) => (
                  <option key={conductor.id} value={conductor.id}>
                    {conductor.nombre} {conductor.apellido}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Orden de despacho</span>
              <select
                value={viaticoForm.ordenDeDespachoId}
                onChange={(e) => setViaticoForm((prev) => ({ ...prev, ordenDeDespachoId: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {ordenes.map((orden) => (
                  <option key={orden.id} value={orden.id}>
                    {orden.codigo} - {orden.estado}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Monto</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={viaticoForm.monto}
                onChange={(e) => setViaticoForm((prev) => ({ ...prev, monto: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </label>

            <label className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Fecha</span>
              <input
                type="date"
                value={viaticoForm.fecha ?? today()}
                onChange={(e) => setViaticoForm((prev) => ({ ...prev, fecha: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </label>

            <label className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Estado</span>
              <select
                value={viaticoForm.estado}
                onChange={(e) => setViaticoForm((prev) => ({ ...prev, estado: e.target.value as ViaticoInput["estado"] }))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="APROBADO">APROBADO</option>
                <option value="LIQUIDADO">LIQUIDADO</option>
                <option value="PAGADO">PAGADO</option>
              </select>
            </label>

            <label className="space-y-1 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
              <span className="font-semibold">Descripción</span>
              <textarea
                value={viaticoForm.descripcion ?? ""}
                onChange={(e) => setViaticoForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Motivo o detalle del viático"
              />
            </label>
          </div>

          <div className="mt-4 flex gap-3">
            <button type="button" onClick={() => void guardarViatico()} className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 transition-colors font-semibold shadow-md shadow-blue-500/10">
              Guardar
            </button>
            <button type="button" onClick={() => setShowViaticoForm(false)} className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showGastoForm && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Registrar gasto con evidencia
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Viático</span>
              <select
                value={gastoForm.viaticoId}
                onChange={(e) => setGastoForm((prev) => ({ ...prev, viaticoId: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {viaticos.map((viatico) => (
                  <option key={viatico.id} value={viatico.id}>
                    {conductorById.get(viatico.conductorId)?.nombre ?? `Conductor ${viatico.conductorId}`} - {ordenById.get(viatico.ordenDeDespachoId)?.codigo ?? `Orden ${viatico.ordenDeDespachoId}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Monto</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={gastoForm.monto}
                onChange={(e) => setGastoForm((prev) => ({ ...prev, monto: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </label>

            <label className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Categoría</span>
              <select
                value={gastoForm.categoria}
                onChange={(e) => setGastoForm((prev) => ({ ...prev, categoria: e.target.value as GastoViaticInput["categoria"] }))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {categoriasValidas.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Fecha y hora</span>
              <input
                type="datetime-local"
                value={gastoForm.fechaHora ?? nowLocalInput()}
                onChange={(e) => setGastoForm((prev) => ({ ...prev, fechaHora: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </label>

            <label className="space-y-1 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
              <span className="font-semibold">Descripción</span>
              <textarea
                value={gastoForm.descripcion}
                onChange={(e) => setGastoForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </label>

            <label className="space-y-1 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
              <span className="font-semibold">Evidencia fotográfica</span>
              <input
                type="text"
                value={gastoForm.evidenciaFotografica ?? ""}
                onChange={(e) => setGastoForm((prev) => ({ ...prev, evidenciaFotografica: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="URL o ruta de la imagen"
              />
            </label>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={() => void guardarGasto()} className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 transition-colors font-semibold shadow-md shadow-blue-500/10">
              Guardar gasto
            </button>
            <button type="button" onClick={() => setShowGastoForm(false)} className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {viaticos.length === 0 && <p className="text-slate-500 dark:text-slate-400">No hay viáticos registrados.</p>}

        {viaticos.map((viatico) => {
          const aprobado = gastoAprobado(viatico.id);
          const saldo = Math.max(0, Number(viatico.monto) - aprobado);
          const uso = viatico.monto > 0 ? (aprobado / viatico.monto) * 100 : 0;
          const conductor = conductorById.get(viatico.conductorId);
          const orden = ordenById.get(viatico.ordenDeDespachoId);
          const listaGastos = gastosByViatico[viatico.id] ?? [];

          return (
            <div key={viatico.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 shadow-sm backdrop-blur-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Conductor</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{conductor ? `${conductor.nombre} ${conductor.apellido}` : `Conductor #${viatico.conductorId}`}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Orden {orden?.codigo ?? viatico.ordenDeDespachoId}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    viatico.estado === "APROBADO" 
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/30 dark:border-blue-500/10" 
                      : viatico.estado === "LIQUIDADO" || viatico.estado === "PAGADO" 
                        ? "bg-green-50 text-green-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-green-200/30 dark:border-emerald-500/10" 
                        : "bg-slate-50 text-slate-700 dark:bg-slate-900/40 dark:text-slate-400 border border-slate-200/30 dark:border-slate-800/10"
                  }`}>
                    {viatico.estado}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => startEdit(viatico)} 
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 p-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Asignado</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{money(Number(viatico.monto))}</p>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 p-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Aprobado</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{money(aprobado)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 p-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Saldo</p>
                  <p className={`font-semibold ${saldo <= 0 ? "text-red-600 dark:text-red-400" : uso >= 90 ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-emerald-400"}`}>{money(saldo)}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Consumo del viático</span>
                  <span>{uso.toFixed(0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-900">
                  <div className={`h-2 rounded-full ${uso >= 90 ? "bg-red-600" : uso >= 75 ? "bg-orange-500" : "bg-blue-600"}`} style={{ width: `${Math.min(uso, 100)}%` }} />
                </div>
              </div>

              {uso >= 90 && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-orange-200/30 dark:border-orange-500/10 bg-orange-50 dark:bg-orange-950/20 p-3 text-sm text-orange-850 dark:text-orange-400">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  El conductor superó el 90% del viático asignado.
                </div>
              )}

              <div className="mt-5 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Gastos registrados</h3>
                <button 
                  type="button" 
                  onClick={() => {
                    resetGastoForm(viatico.id);
                    setShowGastoForm(true);
                  }} 
                  className="rounded-lg border border-blue-300/30 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  Agregar gasto
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {listaGastos.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Aún no hay gastos para este viático.</p>
                ) : (
                  listaGastos.map((gasto) => (
                    <div key={gasto.id} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{gasto.categoria} · {money(Number(gasto.monto))}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-300">{gasto.descripcion}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{gasto.fechaHora ? new Date(gasto.fechaHora).toLocaleString("es-CO") : new Date(gasto.createdAt).toLocaleString("es-CO")}</p>
                          {gasto.evidenciaFotografica && <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">Evidencia: {gasto.evidenciaFotografica}</p>}
                          {gasto.comentariosAdmin && <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Comentarios: {gasto.comentariosAdmin}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                            gasto.estado === "APROBADO" 
                              ? "bg-green-50 text-green-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-green-200/30 dark:border-emerald-500/10" 
                              : gasto.estado === "RECHAZADO" 
                                ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/30 dark:border-red-500/10" 
                                : "bg-yellow-50 text-yellow-700 dark:bg-amber-950/30 dark:text-amber-400 border border-yellow-200/30 dark:border-amber-500/10"
                          }`}>
                            {gasto.estado}
                          </span>
                          {gasto.estado === "PENDIENTE" && (
                            <>
                              <button type="button" onClick={() => void cambiarEstadoGasto(gasto.id, "aprobar")} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500 transition-colors">
                                Aprobar
                              </button>
                              <button type="button" onClick={() => void cambiarEstadoGasto(gasto.id, "rechazar")} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition-colors">
                                Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 text-sm text-slate-750 dark:text-slate-300">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-emerald-450" />
                  Liquidación
                </div>
                <p className="mt-2">Monto asignado: {money(Number(viatico.monto))}</p>
                <p>Gastos aprobados: {money(aprobado)}</p>
                <p>Saldo: {money(saldo)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
