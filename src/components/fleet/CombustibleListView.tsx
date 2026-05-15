import { useState, useEffect } from "react";
import { Plus, TrendingDown } from "lucide-react";
import { ConsumoCombustible, ConsumoCombustibleInput, registrarConsumoCombustible, obtenerConsumosCombustible } from "../../services/consumoCombustible.service";
import { Vehiculo, OrdenDespacho } from "../../types/domain";

interface CombustibleListViewProps {
  vehiculos: Vehiculo[];
  ordenes: OrdenDespacho[];
}

export function CombustibleListView({ vehiculos, ordenes }: CombustibleListViewProps) {
  const [consumos, setConsumos] = useState<ConsumoCombustible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ConsumoCombustibleInput>({
    vehiculoId: 0,
    ordenDeDespachoId: ordenes[0]?.id || 0,
    kilometrajeInicial: 0,
    kilometrajeFinal: 0,
    litrosCargados: 0,
    costoTotal: 0
  });

  const cargarConsumos = async () => {
    try {
      setLoading(true);
      const datos = await obtenerConsumosCombustible();
      setConsumos(datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar consumos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarConsumos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registrarConsumoCombustible(formData);
      setShowForm(false);
      setFormData({
        vehiculoId: 0,
        ordenDeDespachoId: ordenes[0]?.id || 0,
        kilometrajeInicial: 0,
        kilometrajeFinal: 0,
        litrosCargados: 0,
        costoTotal: 0
      });
      cargarConsumos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar consumo");
    }
  };

  const getVehiculoPlaca = (vehiculoId: number) => {
    return vehiculos.find((v) => v.id === vehiculoId)?.placa || "-";
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Control de Combustible</h2>
          <p className="text-sm text-slate-600">Registra consumo de combustible por viaje</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Registrar Consumo
        </button>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Orden de Despacho (Viaje)</label>
              <select
                value={formData.ordenDeDespachoId}
                onChange={(e) => setFormData({ ...formData, ordenDeDespachoId: parseInt(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              >
                {ordenes.map((o) => {
                  const placa = vehiculos.find((v) => v.id === o.vehiculoId)?.placa || "Desconocido";
                  return (
                    <option key={o.id} value={o.id}>
                      {o.codigo} - Vehículo: {placa}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Km Inicial</label>
              <input
                type="number"
                value={formData.kilometrajeInicial}
                onChange={(e) => setFormData({ ...formData, kilometrajeInicial: parseInt(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Km Final</label>
              <input
                type="number"
                value={formData.kilometrajeFinal}
                onChange={(e) => setFormData({ ...formData, kilometrajeFinal: parseInt(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Litros</label>
              <input
                type="number"
                step="0.1"
                value={formData.litrosCargados}
                onChange={(e) => setFormData({ ...formData, litrosCargados: parseFloat(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Costo Total</label>
              <input
                type="number"
                step="0.01"
                value={formData.costoTotal}
                onChange={(e) => setFormData({ ...formData, costoTotal: parseFloat(e.target.value) })}
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

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-900">Vehículo</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Km Recorrida</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Litros</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Rendimiento</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Costo</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {consumos.length > 0 ? (
                consumos.map((consumo) => (
                  <tr key={consumo.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-slate-900">{getVehiculoPlaca(consumo.vehiculoId)}</td>
                    <td className="px-6 py-3 text-slate-600">{consumo.distanciaRecorrida || consumo.kilometrajeFinal - consumo.kilometrajeInicial} km</td>
                    <td className="px-6 py-3 text-slate-600">{consumo.litrosCargados} L</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1">
                        {consumo.rendimiento?.toFixed(2) || "-"} km/L
                        {consumo.rendimiento && consumo.rendimiento < 5 && <TrendingDown size={16} className="text-red-600" />}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">${consumo.costoTotal.toLocaleString("es-CO")}</td>
                    <td className="px-6 py-3 text-slate-600">{new Date(consumo.createdAt).toLocaleDateString("es-CO")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No hay registros de consumo
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
