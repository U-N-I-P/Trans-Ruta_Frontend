import { useEffect, useMemo, useState } from "react";
import { Trash2, Edit2, Plus, AlertTriangle, Search } from "lucide-react";
import { Conductor } from "../../types/domain";
import { obtenerConductores, eliminarConductor, obtenerLicenciasPorVencer } from "../../services/conductor.service";
import { Modal } from "../ui/Modal";
import { ConductorFormModal } from "./ConductorFormModal";

interface ConductorListViewProps {
  onActualizar?: () => void;
  busquedaExterna?: string;
}

export function ConductorListView({ onActualizar, busquedaExterna }: ConductorListViewProps) {
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [licenciasPorVencer, setLicenciasPorVencer] = useState<Conductor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [conductorEditar, setConductorEditar] = useState<Conductor | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conductorEliminar, setConductorEliminar] = useState<Conductor | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (busquedaExterna !== undefined) {
      setBusqueda(busquedaExterna);
    }
  }, [busquedaExterna]);

  const busquedaActiva = busquedaExterna ?? busqueda;

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const [datos, licencias] = await Promise.all([
        obtenerConductores(),
        obtenerLicenciasPorVencer()
      ]);
      setConductores(datos);
      setLicenciasPorVencer(licencias);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar conductores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCrearConductor = () => {
    setConductorEditar(null);
    setShowFormModal(true);
  };

  const handleEditarConductor = (conductor: Conductor) => {
    setConductorEditar(conductor);
    setShowFormModal(true);
  };

  const handleEliminarConductor = (conductor: Conductor) => {
    setConductorEliminar(conductor);
    setShowDeleteModal(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!conductorEliminar) return;

    try {
      await eliminarConductor(conductorEliminar.id);
      setShowDeleteModal(false);
      setConductorEliminar(null);
      cargarDatos();
      onActualizar?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar conductor");
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setConductorEditar(null);
    cargarDatos();
    onActualizar?.();
  };

  const getNombreCompleto = (conductor: Conductor) => `${conductor.nombre} ${conductor.apellido}`;

  const conductoresFiltrados = useMemo(() => {
    const termino = busquedaActiva.trim().toLowerCase();
    if (!termino) return conductores;

    return conductores.filter((conductor) =>
      getNombreCompleto(conductor).toLowerCase().includes(termino) ||
      conductor.cedula.toLowerCase().includes(termino) ||
      conductor.numeroLicencia.toLowerCase().includes(termino) ||
      conductor.categoriaLicencia.toLowerCase().includes(termino)
    );
  }, [conductores, busquedaActiva]);

  const getLicenciaEstado = (conductor: Conductor) => {
    if (conductor.licenciaVencida) {
      return { color: "text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/10", bg: "bg-red-50 dark:bg-red-950/20", label: "Vencida" };
    }
    if (conductor.diasParaVencimiento <= 7) {
      return { color: "text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/10", bg: "bg-orange-50 dark:bg-orange-950/20", label: "Crítica" };
    }
    if (conductor.diasParaVencimiento <= 15) {
      return { color: "text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/10", bg: "bg-amber-50 dark:bg-amber-950/20", label: "Alerta" };
    }
    if (conductor.diasParaVencimiento <= 30) {
      return { color: "text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/10", bg: "bg-blue-50 dark:bg-blue-950/20", label: "Próxima" };
    }
    return { color: "text-green-700 dark:text-emerald-400 border border-green-200 dark:border-emerald-500/10", bg: "bg-green-50 dark:bg-emerald-950/20", label: "Vigente" };
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Cargando conductores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas de Licencias por Vencer */}
      {licenciasPorVencer.length > 0 && (
        <div className="rounded-xl border border-orange-200 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-950/20 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="text-orange-600 dark:text-orange-400 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-orange-900 dark:text-orange-200">Licencias por Vencer</h3>
              <p className="text-sm text-orange-850 dark:text-orange-300 mt-1">
                {licenciasPorVencer.length} conductor(es) tienen licencias próximas a vencer o vencidas:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-orange-700 dark:text-orange-400">
                {licenciasPorVencer.map((c) => (
                  <li key={c.id}>
                    • {getNombreCompleto(c)} - {c.diasParaVencimiento <= 0 ? "Vencida" : `Vence en ${c.diasParaVencimiento} días`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-['Sora'] text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">Gestión de Conductores</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {busquedaActiva.trim()
                ? `Mostrando ${conductoresFiltrados.length} de ${conductores.length} conductores`
                : `Total: ${conductores.length} conductores registrados en el sistema`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 px-3 py-2">
              <Search size={16} className="text-slate-400" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, cédula o licencia..."
                className="w-48 border-none bg-transparent text-sm text-slate-700 outline-none dark:text-slate-300"
              />
            </div>
            <button
              onClick={handleCrearConductor}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-500/10"
            >
              <Plus size={18} />
              Nuevo Conductor
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-panel backdrop-blur-sm overflow-x-auto">
        {conductoresFiltrados.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold">Nombre</th>
                <th className="px-6 py-3 text-sm font-semibold">Cédula</th>
                <th className="px-6 py-3 text-sm font-semibold">Licencia</th>
                <th className="px-6 py-3 text-sm font-semibold">Categoría</th>
                <th className="px-6 py-3 text-sm font-semibold">Vencimiento</th>
                <th className="px-6 py-3 text-sm font-semibold">Estado</th>
                <th className="px-6 py-3 text-sm font-semibold">Horas</th>
                <th className="px-6 py-3 text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {conductoresFiltrados.map((conductor) => {
                const licenciaEstado = getLicenciaEstado(conductor);
                return (
                  <tr key={conductor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {getNombreCompleto(conductor)}
                    </td>
                    <td className="px-6 py-4 text-sm">{conductor.cedula}</td>
                    <td className="px-6 py-4 text-sm">{conductor.numeroLicencia}</td>
                    <td className="px-6 py-4 text-sm">{conductor.categoriaLicencia}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(conductor.fechaVencimientoLicencia).toLocaleDateString("es-CO")}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${licenciaEstado.bg} ${licenciaEstado.color}`}>
                        {licenciaEstado.label}
                        {conductor.diasParaVencimiento > 0 && ` (${conductor.diasParaVencimiento}d)`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{conductor.horasConducidas}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditarConductor(conductor)}
                          className="rounded-lg bg-blue-600/10 border border-blue-500/20 px-2.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 transition hover:bg-blue-600/20"
                          title="Editar"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminarConductor(conductor)}
                          className="rounded-lg bg-red-600/10 border border-red-500/20 px-2.5 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-600/20"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-500 dark:text-slate-400">
            {conductores.length === 0
              ? "No hay conductores registrados. ¡Crea el primero!"
              : "No hay conductores que coincidan con la búsqueda."}
          </div>
        )}
      </div>

      {/* Modal Formulario */}
      {showFormModal && (
        <ConductorFormModal
          conductor={conductorEditar}
          onClose={() => {
            setShowFormModal(false);
            setConductorEditar(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && conductorEliminar && (
        <Modal
          abierto={showDeleteModal}
          titulo="Eliminar Conductor"
          onCerrar={() => {
            setShowDeleteModal(false);
            setConductorEliminar(null);
          }}
        >
          <div className="space-y-4">
            <p className="text-slate-600">
              ¿Estás seguro de que deseas eliminar al conductor <strong>{getNombreCompleto(conductorEliminar)}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConductorEliminar(null);
                }}
                className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarEliminar}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
