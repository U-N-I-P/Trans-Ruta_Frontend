import { useMemo, useState } from "react";
import { Plus, MapPin, Trash2, Edit2 } from "lucide-react";
import { CreateOrderModal } from "../dashboard/CreateOrderModal";
import { Cliente, ConductorConDisponibilidad, NuevaOrdenInput, OrdenDespacho, Vehiculo } from "../../types/domain";
import { actualizarOrdenDespacho, eliminarOrdenDespacho } from "../../services/orden.service";
import { crearViatico, actualizarViatico, Viatico } from "../../services/viatico.service";

interface Orden {
  id: string;
  codigo: string;
  origen: string;
  destino: string;
  pesoCarga: number;
  cliente: string;
  estado: "PENDIENTE" | "DESPACHADO" | "EN_RUTA" | "ENTREGADO";
  fecha: string;
}

interface OrdenesListViewProps {
  ordenes: any[];
  vehiculos: Vehiculo[];
  conductores: ConductorConDisponibilidad[];
  clientes: Cliente[];
  viaticos: Viatico[];
  onCrearOrden: (payload: NuevaOrdenInput) => Promise<OrdenDespacho>;
  onActualizar: () => Promise<void>;
}

export function OrdenesListView({ ordenes, vehiculos, conductores, clientes, viaticos, onCrearOrden, onActualizar }: OrdenesListViewProps) {
  const [abrirModalNuevaOrden, setAbrirModalNuevaOrden] = useState(false);
  const [ordenEnEdicion, setOrdenEnEdicion] = useState<any | null>(null);
  const [procesandoAccion, setProcesandoAccion] = useState(false);

  const ordenesList = useMemo<Orden[]>(
    () =>
      ordenes?.map((o: any) => ({
        id: o.id,
        codigo: o.codigo,
        origen: o.origen,
        destino: o.destino,
        pesoCarga: o.pesoCarga,
        cliente: o.cliente?.nombre || "N/A",
        estado: o.estado,
        fecha: o.createdAt || new Date().toISOString()
      })) || [],
    [ordenes]
  );

  const manejarEliminar = async (id: number) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar esta orden?");
    if (!confirmar) {
      return;
    }

    try {
      setProcesandoAccion(true);
      await eliminarOrdenDespacho(id);
      await onActualizar();
    } finally {
      setProcesandoAccion(false);
    }
  };

  const manejarEditar = async (payload: NuevaOrdenInput) => {
    if (!ordenEnEdicion) {
      throw new Error("No hay una orden en edición");
    }

    try {
      setProcesandoAccion(true);

      if (payload.viaticoMonto != null && payload.viaticoMonto > 0) {
        const viaticoExistente = viaticos.find((item) => item.ordenDeDespachoId === Number(ordenEnEdicion.id));
        const viaticoPayload = {
          conductorId: payload.conductorId,
          ordenDeDespachoId: Number(ordenEnEdicion.id),
          monto: payload.viaticoMonto,
          saldo: payload.viaticoMonto,
          estado: "APROBADO" as const,
          fecha: payload.fechaSalida ?? new Date().toISOString().split("T")[0],
          descripcion: `Viático asociado a la orden ${ordenEnEdicion.codigo}`
        };

        if (viaticoExistente) {
          await actualizarViatico(viaticoExistente.id, viaticoPayload);
        } else {
          await crearViatico(viaticoPayload);
        }
      }

      const ordenActualizada = await actualizarOrdenDespacho(ordenEnEdicion.id, payload);
      setOrdenEnEdicion(null);
      setAbrirModalNuevaOrden(false);
      await onActualizar();
      return ordenActualizada;
    } finally {
      setProcesandoAccion(false);
    }
  };

  const abrirEditor = (ordenId: number) => {
    const ordenCompleta = ordenes.find((item) => Number(item.id) === ordenId) ?? null;
    setOrdenEnEdicion(ordenCompleta);
    setAbrirModalNuevaOrden(Boolean(ordenCompleta));
  };

  const manejarCrear = async (payload: NuevaOrdenInput) => {
    try {
      setProcesandoAccion(true);
      return await onCrearOrden(payload);
    } finally {
      setProcesandoAccion(false);
    }
  };

  const estadoColors: Record<string, string> = {
    PENDIENTE: "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-350 border border-slate-200/30 dark:border-slate-700/50",
    DESPACHADO: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/30 dark:border-blue-500/10",
    EN_RUTA: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/30 dark:border-amber-500/10",
    ENTREGADO: "bg-green-50 text-green-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-green-200/30 dark:border-emerald-500/10"
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-['Sora'] text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">Gestión de Órdenes</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Crea y controla órdenes de despacho en el sistema</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOrdenEnEdicion(null);
              setAbrirModalNuevaOrden(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-500/10"
          >
            <Plus className="h-4 w-4" />
            Nueva Orden
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Órdenes</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{ordenesList.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pendientes</p>
          <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">{ordenesList.filter(o => o.estado === "PENDIENTE").length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">En Ruta</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{ordenesList.filter(o => o.estado === "EN_RUTA").length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Entregadas</p>
          <p className="text-2xl font-bold text-green-600 dark:text-emerald-400">{ordenesList.filter(o => o.estado === "ENTREGADO").length}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-panel backdrop-blur-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100">
            <tr>
              <th className="px-6 py-3 font-semibold">Código</th>
              <th className="px-6 py-3 font-semibold">Cliente</th>
              <th className="px-6 py-3 font-semibold">Ruta</th>
              <th className="px-6 py-3 font-semibold">Peso (kg)</th>
              <th className="px-6 py-3 font-semibold">Estado</th>
              <th className="px-6 py-3 font-semibold">Fecha</th>
              <th className="px-6 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {ordenesList.length > 0 ? (
              ordenesList.map((orden) => (
                <tr key={orden.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">{orden.codigo}</td>
                  <td className="px-6 py-3">{orden.cliente}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      {orden.origen} → {orden.destino}
                    </div>
                  </td>
                  <td className="px-6 py-3">{orden.pesoCarga}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${estadoColors[orden.estado]}`}>
                      {orden.estado}
                    </span>
                  </td>
                  <td className="px-6 py-3">{new Date(orden.fecha).toLocaleDateString("es-CO")}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => abrirEditor(Number(orden.id))}
                        className="rounded-lg bg-blue-600/10 border border-blue-500/20 px-2.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 transition hover:bg-blue-600/20 disabled:opacity-50 disabled:pointer-events-none"
                        disabled={procesandoAccion}
                        title="Editar"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void manejarEliminar(Number(orden.id))}
                        className="rounded-lg bg-red-600/10 border border-red-500/20 px-2.5 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-600/20 disabled:opacity-50 disabled:pointer-events-none"
                        disabled={procesandoAccion}
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  No hay órdenes registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateOrderModal
        abierto={abrirModalNuevaOrden}
        vehiculos={vehiculos}
        conductores={conductores}
        clientes={clientes}
        ordenInicial={ordenEnEdicion}
        onCerrar={() => {
          setAbrirModalNuevaOrden(false);
          setOrdenEnEdicion(null);
        }}
        onCrearOrden={ordenEnEdicion ? manejarEditar : manejarCrear}
      />
    </div>
  );
}
