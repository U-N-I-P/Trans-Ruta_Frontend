import { useState, useEffect } from "react";
import { Plus, DollarSign } from "lucide-react";
import { obtenerViaticos, crearViatico, obtenerGastosViatico } from "../../services/viatico.service";
import { Viatico, GastoViatico, ViaticoInput } from "../../services/viatico.service";
import { Conductor, OrdenDespacho } from "../../types/domain";

interface ViaticosListViewProps {
  conductores: Conductor[];
  ordenes: OrdenDespacho[];
}

export function ViaticosListView({ conductores, ordenes }: ViaticosListViewProps) {
  const [viaticos, setViaticos] = useState<Viatico[]>([]);
  const [gastos, setGastos] = useState<Record<number, GastoViatico[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ViaticoInput>({
    conductorId: conductores[0]?.id || 0,
    ordenDeDespachoId: ordenes[0]?.id || 0,
    monto: 0,
    estado: "APROBADO"
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const viaticosList = await obtenerViaticos();
      setViaticos(viaticosList);

      // Cargar gastos para cada viático
      const gastosMap: Record<number, GastoViatico[]> = {};
      for (const viatico of viaticosList) {
        const gastosViatico = await obtenerGastosViatico(viatico.id);
        gastosMap[viatico.id] = gastosViatico;
      }
      setGastos(gastosMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar viáticos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crearViatico(formData);
      setShowForm(false);
      setFormData({
        conductorId: conductores[0]?.id || 0,
        ordenDeDespachoId: ordenes[0]?.id || 0,
        monto: 0,
        estado: "APROBADO"
      });
      cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear viático");
    }
  };

  const getNombreConductor = (conductorId: number) => {
    const conductor = conductores.find((c) => c.id === conductorId);
    return conductor ? `${conductor.nombre} ${conductor.apellido}` : "-";
  };

  // const getOrdenNombre = (ordenId: number) => {
  //   return ordenes.find((o) => o.id === ordenId)?.codigo || "-";
  // };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Viáticos</h2>
          <p className="text-sm text-slate-600">Asigna presupuestos y revisa gastos de conductores</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Nuevo Viático
        </button>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Conductor</label>
              <select
                value={formData.conductorId}
                onChange={(e) => setFormData({ ...formData, conductorId: parseInt(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {conductores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Orden de Despacho</label>
              <select
                value={formData.ordenDeDespachoId}
                onChange={(e) => setFormData({ ...formData, ordenDeDespachoId: parseInt(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {ordenes.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.codigo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Monto (COP)</label>
              <input
                type="number"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: parseInt(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {viaticos.map((viatico) => (
          <div key={viatico.id} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Conductor</p>
                <p className="font-semibold text-slate-900">{getNombreConductor(viatico.conductorId)}</p>
              </div>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${viatico.estado === "LIQUIDADO" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                {viatico.estado}
              </span>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Asignado</p>
                <p className="font-semibold text-slate-900">${viatico.monto.toLocaleString("es-CO")}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Saldo</p>
                <p className={`font-semibold ${viatico.saldo < 0 ? "text-red-600" : "text-green-600"}`}>${viatico.saldo.toLocaleString("es-CO")}</p>
              </div>
            </div>

            {gastos[viatico.id] && gastos[viatico.id].length > 0 && (
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <p className="text-sm font-medium text-slate-700">Gastos Registrados</p>
                {gastos[viatico.id].map((gasto) => (
                  <div key={gasto.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <div>
                      <p className="text-sm text-slate-600">{gasto.categoria}</p>
                      <p className="text-xs text-slate-500">{gasto.descripcion}</p>
                    </div>
                    <span className={`text-sm font-medium ${gasto.estado === "APROBADO" ? "text-green-600" : gasto.estado === "RECHAZADO" ? "text-red-600" : "text-yellow-600"}`}>
                      ${gasto.monto.toLocaleString("es-CO")}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-blue-600" />
                  <span className="text-sm text-blue-600">Uso: {((viatico.monto - viatico.saldo) / viatico.monto * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
