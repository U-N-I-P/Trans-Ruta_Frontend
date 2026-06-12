import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CheckCircle, Signature, Truck, ClipboardCheck } from "lucide-react";
import { Entrega, OrdenDespacho, EntregaInput } from "../../types/domain";
import { obtenerEntregas, registrarEntrega } from "../../services/entrega.service";
import { EntregaFormModal } from "./EntregaFormModal";

interface EntregasListViewProps {
  ordenes: OrdenDespacho[];
  onActualizar?: () => Promise<void>;
}

export function EntregasListView({ ordenes, onActualizar }: EntregasListViewProps) {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenDespacho | null>(null);

  const cargarEntregas = async () => {
    try {
      setLoading(true);
      setError(null);
      const datos = await obtenerEntregas();
      setEntregas(datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar entregas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarEntregas();
  }, []);

  const entregasPorOrden = useMemo(() => new Set(entregas.map((entrega) => entrega.ordenDeDespachoId)), [entregas]);
  const ordenesPendientes = useMemo(
    () =>
      ordenes.filter(
        (orden) =>
          (orden.estado === "DESPACHADO" || orden.estado === "EN_RUTA") && !entregasPorOrden.has(orden.id)
      ),
    [entregasPorOrden, ordenes]
  );

  const estadoColors: Record<string, string> = {
    DESPACHADO: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/30 dark:border-blue-500/10",
    EN_RUTA: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/30 dark:border-amber-500/10",
    ENTREGADO: "bg-green-50 text-green-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-green-200/30 dark:border-emerald-500/10",
    CANCELADO: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/30 dark:border-red-500/10"
  };

  const handleAbrirRegistro = (orden: OrdenDespacho) => {
    setOrdenSeleccionada(orden);
    setMostrarModal(true);
  };

  const handleRegistrarEntrega = async (payload: EntregaInput) => {
    if (!ordenSeleccionada) {
      return;
    }

    try {
      await registrarEntrega(ordenSeleccionada.id, payload);
      await cargarEntregas();
      await onActualizar?.();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.message ?? "No se pudo registrar la entrega");
      }

      throw err instanceof Error ? err : new Error("No se pudo registrar la entrega");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Cargando entregas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Gestión de Entregas</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Controla entregas con firma digital</p>
      </div>

      {error && <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-xs text-red-400">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-green-600 dark:text-emerald-400" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Entregas registradas</p>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-emerald-400">{entregas.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Órdenes disponibles</p>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{ordenesPendientes.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Signature className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Con firma digital</p>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{entregas.filter((entrega) => Boolean(entrega.firmaDigital)).length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-sm backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Órdenes listas para registrar entrega</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Selecciona una orden en ruta o despachada y registra la entrega real</p>
          </div>
        </div>

        {ordenesPendientes.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ordenesPendientes.map((orden) => (
              <div key={orden.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/40">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{orden.codigo}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{orden.origen} → {orden.destino}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Estado: {orden.estado}</p>
                <button
                  type="button"
                  onClick={() => handleAbrirRegistro(orden)}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-500/10"
                >
                  <Signature className="h-4 w-4" />
                  Registrar entrega
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No hay órdenes pendientes de registro.</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 overflow-x-auto shadow-sm backdrop-blur-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100">
            <tr>
              <th className="px-6 py-3 font-semibold">Orden</th>
              <th className="px-6 py-3 font-semibold">Fecha entrega</th>
              <th className="px-6 py-3 font-semibold">Firma</th>
              <th className="px-6 py-3 font-semibold">Estado de orden</th>
              <th className="px-6 py-3 font-semibold">Observaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {entregas.length > 0 ? (
              entregas.map((entrega) => (
                <tr key={entrega.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-3 font-bold text-slate-900 dark:text-slate-100">{entrega.ordenDeDespacho?.codigo ?? `Orden ${entrega.ordenDeDespachoId}`}</td>
                  <td className="px-6 py-3">{new Date(entrega.fechaEntrega).toLocaleDateString("es-CO")}</td>
                  <td className="px-6 py-3">
                    {entrega.firmaDigital ? (
                      <span className="flex items-center gap-1 text-green-600 dark:text-emerald-400 text-sm font-semibold">
                        <CheckCircle className="h-4 w-4" />
                        Firmada
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 text-sm">Sin firma</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${estadoColors[entrega.ordenDeDespacho?.estado ?? "DESPACHADO"]}`}>
                      {entrega.ordenDeDespacho?.estado ?? "DESPACHADO"}
                    </span>
                  </td>
                  <td className="px-6 py-3">{entrega.observaciones ?? "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  Aún no hay entregas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EntregaFormModal
        abierto={mostrarModal}
        orden={ordenSeleccionada}
        onClose={() => {
          setMostrarModal(false);
          setOrdenSeleccionada(null);
        }}
        onSubmit={handleRegistrarEntrega}
      />
    </div>
  );
}
