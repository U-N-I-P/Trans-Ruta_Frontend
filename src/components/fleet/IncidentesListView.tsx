import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle, Edit2, Plus, Flag, Search } from "lucide-react";
import { Incidente, IncidenteInput, OrdenDespacho } from "../../types/domain";
import { eliminarIncidente, obtenerIncidentes, reportarIncidente, finalizarIncidente } from "../../services/incidente.service";
import { IncidenteFormModal } from "./IncidenteFormModal";

interface IncidentesListViewProps {
  ordenes: OrdenDespacho[];
}

const FINALIZADOS_KEY = "transruta_incidentes_finalizados";

export function IncidentesListView({ ordenes }: IncidentesListViewProps) {
  const [filtro, setFiltro] = useState("");
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [incidenteEditar, setIncidenteEditar] = useState<Incidente | null>(null);
  const [finalizados] = useState<Record<number, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(FINALIZADOS_KEY) ?? "{}");
    } catch {
      return {};
    }
  });

  const cargarIncidentes = async () => {
    try {
      setLoading(true);
      setError(null);
      const datos = await obtenerIncidentes();
      setIncidentes(datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar incidentes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarIncidentes();
  }, []);

  useEffect(() => {
    localStorage.setItem(FINALIZADOS_KEY, JSON.stringify(finalizados));
  }, [finalizados]);

  const mapaOrdenes = useMemo(() => new Map(ordenes.map((orden) => [orden.id, orden])), [ordenes]);

  const incidentesFiltrados = useMemo(() => {
    const termino = filtro.trim().toLowerCase();

    return incidentes
      .map((incidente) => ({
        ...incidente,
        finalizado: incidente.estado ? ['RESUELTO', 'CERRADO'].includes(incidente.estado) : (finalizados[incidente.id] ?? false),
      }))
      .filter((incidente) => {
        if (!termino) {
          return true;
        }

        const orden = mapaOrdenes.get(incidente.ordenDeDespachoId);
        return (
          incidente.tipo.toLowerCase().includes(termino) ||
          incidente.descripcion.toLowerCase().includes(termino) ||
          orden?.codigo.toLowerCase().includes(termino) ||
          String(incidente.ordenDeDespachoId).includes(termino)
        );
      });
  }, [finalizados, filtro, incidentes, mapaOrdenes]);

  const handleNuevo = () => {
    setIncidenteEditar(null);
    setMostrarModal(true);
  };

  const handleEditar = (incidente: Incidente) => {
    setIncidenteEditar(incidente);
    setMostrarModal(true);
  };

  const handleGuardarIncidente = async (ordenId: number, payload: IncidenteInput, incidenteId?: number) => {
    try {
      if (incidenteId) {
        await eliminarIncidente(incidenteId);
      }

      await reportarIncidente(ordenId, payload);
      await cargarIncidentes();
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.message ?? "No se pudo guardar el incidente");
      }

      throw err instanceof Error ? err : new Error("No se pudo guardar el incidente");
    }
  };

  const handleFinalizar = async (incidente: Incidente) => {
    try {
      await finalizarIncidente(incidente.id);
      await cargarIncidentes();
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "No se pudo finalizar el incidente");
      } else {
        setError(err instanceof Error ? err.message : "No se pudo finalizar el incidente");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando incidentes...</p>
      </div>
    );
  }

  const tiposIncidente: Record<string, { label: string; color: string }> = {
    FALLA_MECANICA: { label: "Falla Mecánica", color: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/30 dark:border-red-500/10" },
    RETRASO: { label: "Retraso", color: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/30 dark:border-amber-500/10" },
    ACCIDENTE: { label: "Accidente", color: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border border-orange-200/30 dark:border-orange-500/10" },
    OTRO: { label: "Otro", color: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/30 dark:border-blue-500/10" }
  };

  const totalActivos = incidentesFiltrados.filter((incidente) => !incidente.finalizado).length;
  const totalFinalizados = incidentesFiltrados.filter((incidente) => incidente.finalizado).length;

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-['Sora'] text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">Gestión de Incidentes</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">Reporta, edita y finaliza incidentes en ruta</p>
          </div>
          <button
            type="button"
            onClick={handleNuevo}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-500/10"
          >
            <Plus className="h-4 w-4" />
            Agregar incidente
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-panel backdrop-blur-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total incidentes</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{incidentesFiltrados.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-panel backdrop-blur-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">Activos</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{totalActivos}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-panel backdrop-blur-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">Finalizados</p>
          <p className="text-3xl font-bold text-green-600 dark:text-emerald-400 mt-2">{totalFinalizados}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-3 text-slate-700 dark:text-slate-300">
          <Search size={18} className="shrink-0 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por código de orden..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100"
          />
        </label>
      </div>

      {/* Tabla Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-panel backdrop-blur-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100">
            <tr>
              <th className="px-6 py-3 font-semibold">Orden</th>
              <th className="px-6 py-3 font-semibold">Ruta</th>
              <th className="px-6 py-3 font-semibold">Tipo</th>
              <th className="px-6 py-3 font-semibold">Fecha</th>
              <th className="px-6 py-3 font-semibold">Estado</th>
              <th className="px-6 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {incidentesFiltrados.length > 0 ? (
              incidentesFiltrados.map((incidente) => {
                const orden = mapaOrdenes.get(incidente.ordenDeDespachoId);
                return (
                  <tr key={incidente.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3 font-semibold text-slate-900 dark:text-slate-100">{orden?.codigo ?? `Orden ${incidente.ordenDeDespachoId}`}</td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300 font-medium">{orden ? `${orden.origen} → ${orden.destino}` : "-"}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tiposIncidente[incidente.tipo]?.color ?? tiposIncidente.OTRO.color}`}>
                        {tiposIncidente[incidente.tipo]?.label ?? incidente.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{new Date(incidente.fecha).toLocaleDateString("es-CO")}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${incidente.finalizado ? "bg-green-50 text-green-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-green-200/30 dark:border-emerald-500/10" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/30 dark:border-red-500/10"}`}>
                        {incidente.finalizado ? <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-emerald-400" /> : <AlertTriangle className="h-3.5 w-3.5 text-red-650 dark:text-red-400" />}
                        {incidente.finalizado ? "Finalizado" : "Activo"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditar(incidente)}
                          className="rounded-lg bg-blue-600/10 border border-blue-500/20 px-2.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 transition hover:bg-blue-600/20"
                          title="Editar"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleFinalizar(incidente)}
                          className="rounded-lg bg-green-600/10 border border-green-500/20 px-2.5 py-1.5 text-xs font-semibold text-green-600 dark:text-green-400 transition hover:bg-green-600/20 disabled:opacity-50 disabled:pointer-events-none"
                          title="Marcar como resuelto"
                          disabled={Boolean(incidente.finalizado)}
                        >
                          <Flag className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  No hay incidentes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <IncidenteFormModal
        abierto={mostrarModal}
        ordenes={ordenes}
        incidente={incidenteEditar}
        onClose={() => {
          setMostrarModal(false);
          setIncidenteEditar(null);
        }}
        onSubmit={handleGuardarIncidente}
      />
    </div>
  );
}
