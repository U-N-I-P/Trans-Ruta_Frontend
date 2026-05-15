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
    DESPACHADO: "bg-blue-100 text-blue-800",
    EN_RUTA: "bg-yellow-100 text-yellow-800",
    ENTREGADO: "bg-green-100 text-green-800",
    CANCELADO: "bg-red-100 text-red-800"
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
        <p className="text-gray-500">Cargando entregas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Gestión de Entregas</h2>
        <p className="text-sm text-slate-600">Controla entregas con firma digital</p>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-green-600" />
            <p className="text-sm text-slate-600">Entregas registradas</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{entregas.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-slate-600">Órdenes disponibles</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{ordenesPendientes.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Signature className="h-4 w-4 text-amber-600" />
            <p className="text-sm text-slate-600">Con firma digital</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">{entregas.filter((entrega) => Boolean(entrega.firmaDigital)).length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Órdenes listas para registrar entrega</h3>
            <p className="text-sm text-slate-600">Selecciona una orden en ruta o despachada y registra la entrega real</p>
          </div>
        </div>

        {ordenesPendientes.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ordenesPendientes.map((orden) => (
              <div key={orden.id} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{orden.codigo}</p>
                <p className="text-sm text-slate-600">{orden.origen} → {orden.destino}</p>
                <p className="mt-1 text-xs text-slate-500">Estado: {orden.estado}</p>
                <button
                  type="button"
                  onClick={() => handleAbrirRegistro(orden)}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Signature className="h-4 w-4" />
                  Registrar entrega
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No hay órdenes pendientes de registro.</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-900">Orden</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Fecha entrega</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Firma</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Estado de orden</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Observaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {entregas.length > 0 ? (
              entregas.map((entrega) => (
                <tr key={entrega.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">{entrega.ordenDeDespacho?.codigo ?? `Orden ${entrega.ordenDeDespachoId}`}</td>
                  <td className="px-6 py-3 text-slate-600">{new Date(entrega.fechaEntrega).toLocaleDateString("es-CO")}</td>
                  <td className="px-6 py-3">
                    {entrega.firmaDigital ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Firmada
                      </span>
                    ) : (
                      <span className="text-slate-500 text-sm">Sin firma</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${estadoColors[entrega.ordenDeDespacho?.estado ?? "DESPACHADO"]}`}>
                      {entrega.ordenDeDespacho?.estado ?? "DESPACHADO"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{entrega.observaciones ?? "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
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
