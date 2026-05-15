import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle, Edit2, Plus, Flag, X } from "lucide-react";
import { Incidente, IncidenteInput, OrdenDespacho } from "../../types/domain";
import { eliminarIncidente, obtenerIncidentes, reportarIncidente } from "../../services/incidente.service";
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
  const [finalizados, setFinalizados] = useState<Record<number, boolean>>(() => {
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
        finalizado: finalizados[incidente.id] ?? false
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
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.message ?? "No se pudo guardar el incidente");
      }

      throw err instanceof Error ? err : new Error("No se pudo guardar el incidente");
    }
  };

  const handleFinalizar = (incidente: Incidente) => {
    setFinalizados((actual) => ({ ...actual, [incidente.id]: true }));
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Cargando incidentes...</p>
      </div>
    );
  }

  const tiposIncidente: Record<string, { label: string; color: string }> = {
    FALLA_MECANICA: { label: "Falla Mecánica", color: "bg-red-100 text-red-800" },
    RETRASO: { label: "Retraso", color: "bg-yellow-100 text-yellow-800" },
    ACCIDENTE: { label: "Accidente", color: "bg-orange-100 text-orange-800" },
    OTRO: { label: "Otro", color: "bg-blue-100 text-blue-800" }
  };

  const totalActivos = incidentesFiltrados.filter((incidente) => !incidente.finalizado).length;
  const totalFinalizados = incidentesFiltrados.filter((incidente) => incidente.finalizado).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Incidentes</h2>
          <p className="text-sm text-slate-600">Reporta, edita y finaliza incidentes en ruta</p>
        </div>
        <button
          type="button"
          onClick={handleNuevo}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Agregar incidente
        </button>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Total incidentes</p>
          <p className="text-2xl font-bold text-slate-900">{incidentesFiltrados.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Activos</p>
          <p className="text-2xl font-bold text-red-600">{totalActivos}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Finalizados</p>
          <p className="text-2xl font-bold text-green-600">{totalFinalizados}</p>
        </div>
      </div>

      <div>
        <input
          type="text"
          placeholder="Buscar por código de orden..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-2"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-900">Orden</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Ruta</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Tipo</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Fecha</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Estado</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {incidentesFiltrados.length > 0 ? (
              incidentesFiltrados.map((incidente) => {
                const orden = mapaOrdenes.get(incidente.ordenDeDespachoId);
                return (
                <tr key={incidente.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">{orden?.codigo ?? `Orden ${incidente.ordenDeDespachoId}`}</td>
                  <td className="px-6 py-3 text-slate-600">{orden ? `${orden.origen} → ${orden.destino}` : "-"}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${tiposIncidente[incidente.tipo]?.color ?? tiposIncidente.OTRO.color}`}>
                      {tiposIncidente[incidente.tipo]?.label ?? incidente.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{new Date(incidente.fecha).toLocaleDateString("es-CO")}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${incidente.finalizado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {incidente.finalizado ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {incidente.finalizado ? "Finalizado" : "Activo"}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditar(incidente)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFinalizar(incidente)}
                        className="text-green-600 hover:text-green-700"
                        title="Finalizar"
                        disabled={Boolean(incidente.finalizado)}
                      >
                        <Flag className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
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
