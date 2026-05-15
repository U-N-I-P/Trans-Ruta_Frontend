import { useState } from "react";
import { Plus, Trash2, AlertTriangle, Save, X } from "lucide-react";
import { Modal } from "../ui/Modal";

interface Repuesto {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  stock: number;
  cantidadMinima: number;
  precio: number;
  ubicacion: string;
  estado: "DISPONIBLE" | "BAJO_STOCK" | "AGOTADO";
}

export function InventarioRepuestosView() {
  const [repuestos, setRepuestos] = useState<Repuesto[]>([
    {
      id: "1",
      codigo: "REP-001",
      nombre: "Repuesto de Motor",
      categoria: "Motor",
      stock: 8,
      cantidadMinima: 5,
      precio: 425000,
      ubicacion: "Estante A1",
      estado: "DISPONIBLE"
    },
    {
      id: "2",
      codigo: "REP-002",
      nombre: "Pastillas de Freno",
      categoria: "Sistema de Frenos",
      stock: 3,
      cantidadMinima: 10,
      precio: 89000,
      ubicacion: "Estante B2",
      estado: "BAJO_STOCK"
    },
    {
      id: "3",
      codigo: "REP-003",
      nombre: "Filtro de Aire",
      categoria: "Filtros",
      stock: 0,
      cantidadMinima: 8,
      precio: 45000,
      ubicacion: "Estante C3",
      estado: "AGOTADO"
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    categoria: "Motor",
    stock: 0,
    cantidadMinima: 5,
    precio: 0,
    ubicacion: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevoRepuesto: Repuesto = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      estado: formData.stock === 0 ? "AGOTADO" : formData.stock <= formData.cantidadMinima ? "BAJO_STOCK" : "DISPONIBLE"
    };
    
    setRepuestos([...repuestos, nuevoRepuesto]);
    setShowForm(false);
    setFormData({
      codigo: "",
      nombre: "",
      categoria: "Motor",
      stock: 0,
      cantidadMinima: 5,
      precio: 0,
      ubicacion: ""
    });
  };

  const estadoColors: Record<string, string> = {
    DISPONIBLE: "bg-green-100 text-green-800",
    BAJO_STOCK: "bg-yellow-100 text-yellow-800",
    AGOTADO: "bg-red-100 text-red-800"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventario de Repuestos</h2>
          <p className="text-sm text-slate-600">Gestiona stock de piezas y componentes</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo Repuesto
        </button>
      </div>

      {repuestos.some(r => r.estado !== "DISPONIBLE") && (
        <div className="rounded-xl border-l-4 border-yellow-500 bg-yellow-50 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-900">Alerta de Stock</p>
              <p className="text-sm text-yellow-700">
                {repuestos.filter(r => r.estado === "BAJO_STOCK").length} repuestos con stock bajo y {repuestos.filter(r => r.estado === "AGOTADO").length} agotados
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Total Repuestos</p>
          <p className="text-2xl font-bold text-slate-900">{repuestos.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Valor Total Inventario</p>
          <p className="text-2xl font-bold text-slate-900">
            ${(repuestos.reduce((acc, r) => acc + (r.stock * r.precio), 0) / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Alertas</p>
          <p className="text-2xl font-bold text-red-600">
            {repuestos.filter(r => r.estado !== "DISPONIBLE").length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-900">Código</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Nombre</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Categoría</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Stock</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Mínimo</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Precio Unit.</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Ubicación</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Estado</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {repuestos.map((rep) => (
              <tr key={rep.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-900">{rep.codigo}</td>
                <td className="px-6 py-3 text-slate-600">{rep.nombre}</td>
                <td className="px-6 py-3 text-slate-600">{rep.categoria}</td>
                <td className="px-6 py-3 font-semibold text-slate-900">{rep.stock}</td>
                <td className="px-6 py-3 text-slate-600">{rep.cantidadMinima}</td>
                <td className="px-6 py-3 text-slate-600">${rep.precio.toLocaleString("es-CO")}</td>
                <td className="px-6 py-3 text-slate-600">{rep.ubicacion}</td>
                <td className="px-6 py-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${estadoColors[rep.estado]}`}>
                    {rep.estado}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <button className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal abierto={showForm} titulo="Registrar Nuevo Repuesto" onCerrar={() => setShowForm(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Código</label>
              <input 
                type="text" 
                required
                className="w-full rounded-lg border border-slate-300 p-2 text-sm" 
                placeholder="Ej. REP-004"
                value={formData.codigo}
                onChange={e => setFormData({...formData, codigo: e.target.value})}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
              <input 
                type="text" 
                required
                className="w-full rounded-lg border border-slate-300 p-2 text-sm" 
                placeholder="Ej. Batería 12V"
                value={formData.nombre}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Categoría</label>
              <select 
                className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                value={formData.categoria}
                onChange={e => setFormData({...formData, categoria: e.target.value})}
              >
                <option value="Motor">Motor</option>
                <option value="Sistema de Frenos">Sistema de Frenos</option>
                <option value="Filtros">Filtros</option>
                <option value="Eléctrico">Eléctrico</option>
                <option value="Suspensión">Suspensión</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ubicación</label>
              <input 
                type="text" 
                required
                className="w-full rounded-lg border border-slate-300 p-2 text-sm" 
                placeholder="Ej. Estante D4"
                value={formData.ubicacion}
                onChange={e => setFormData({...formData, ubicacion: e.target.value})}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Stock Inicial</label>
              <input 
                type="number" 
                min="0"
                required
                className="w-full rounded-lg border border-slate-300 p-2 text-sm" 
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Stock Mínimo (Alerta)</label>
              <input 
                type="number" 
                min="1"
                required
                className="w-full rounded-lg border border-slate-300 p-2 text-sm" 
                value={formData.cantidadMinima}
                onChange={e => setFormData({...formData, cantidadMinima: Number(e.target.value)})}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Precio Unitario ($)</label>
              <input 
                type="number" 
                min="0"
                required
                className="w-full rounded-lg border border-slate-300 p-2 text-sm" 
                value={formData.precio}
                onChange={e => setFormData({...formData, precio: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Guardar Repuesto
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
