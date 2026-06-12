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
    DISPONIBLE: "bg-green-50 text-green-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-green-200/30 dark:border-emerald-500/10",
    BAJO_STOCK: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/30 dark:border-amber-500/10",
    AGOTADO: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/30 dark:border-red-500/10"
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-['Sora'] text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">Inventario de Repuestos</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gestiona stock de piezas y componentes</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-500/10"
          >
            <Plus className="h-4 w-4" />
            Nuevo Repuesto
          </button>
        </div>
      </div>

      {/* Alerta Stock */}
      {repuestos.some(r => r.estado !== "DISPONIBLE") && (
        <div className="rounded-2xl border border-amber-250 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-950/20 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-400" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">Alerta de Stock</p>
              <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                {repuestos.filter(r => r.estado === "BAJO_STOCK").length} repuestos con stock bajo y {repuestos.filter(r => r.estado === "AGOTADO").length} agotados
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-panel backdrop-blur-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Repuestos</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{repuestos.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-panel backdrop-blur-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">Valor Total Inventario</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            ${(repuestos.reduce((acc, r) => acc + (r.stock * r.precio), 0) / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-panel backdrop-blur-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">Alertas</p>
          <p className="text-3xl font-bold text-red-650 dark:text-red-400 mt-2">
            {repuestos.filter(r => r.estado !== "DISPONIBLE").length}
          </p>
        </div>
      </div>

      {/* Tabla Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-panel backdrop-blur-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100">
            <tr>
              <th className="px-6 py-3 font-semibold">Código</th>
              <th className="px-6 py-3 font-semibold">Nombre</th>
              <th className="px-6 py-3 font-semibold">Categoría</th>
              <th className="px-6 py-3 font-semibold">Stock</th>
              <th className="px-6 py-3 font-semibold">Mínimo</th>
              <th className="px-6 py-3 font-semibold">Precio Unit.</th>
              <th className="px-6 py-3 font-semibold">Ubicación</th>
              <th className="px-6 py-3 font-semibold">Estado</th>
              <th className="px-6 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {repuestos.map((rep) => (
              <tr key={rep.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-3 font-semibold text-slate-900 dark:text-slate-100">{rep.codigo}</td>
                <td className="px-6 py-3">{rep.nombre}</td>
                <td className="px-6 py-3">{rep.categoria}</td>
                <td className="px-6 py-3 font-bold text-slate-900 dark:text-slate-100">{rep.stock}</td>
                <td className="px-6 py-3">{rep.cantidadMinima}</td>
                <td className="px-6 py-3">${rep.precio.toLocaleString("es-CO")}</td>
                <td className="px-6 py-3">{rep.ubicacion}</td>
                <td className="px-6 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${estadoColors[rep.estado]}`}>
                    {rep.estado}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      const confirmar = window.confirm(`¿Eliminar el repuesto ${rep.nombre}?`);
                      if (confirmar) {
                        setRepuestos(repuestos.filter(r => r.id !== rep.id));
                      }
                    }}
                    className="rounded-lg bg-red-600/10 border border-red-500/20 px-2.5 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-600/20"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      <Modal abierto={showForm} titulo="Registrar Nuevo Repuesto" onCerrar={() => setShowForm(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Código</label>
              <input 
                type="text" 
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500" 
                placeholder="Ej. REP-004"
                value={formData.codigo}
                onChange={e => setFormData({...formData, codigo: e.target.value})}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
              <input 
                type="text" 
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-450 dark:placeholder-slate-500 outline-none focus:border-blue-500" 
                placeholder="Ej. Batería 12V"
                value={formData.nombre}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Categoría</label>
              <select 
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
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
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Ubicación</label>
              <input 
                type="text" 
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-450 dark:placeholder-slate-500 outline-none focus:border-blue-500" 
                placeholder="Ej. Estante D4"
                value={formData.ubicacion}
                onChange={e => setFormData({...formData, ubicacion: e.target.value})}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Stock Inicial</label>
              <input 
                type="number" 
                min="0"
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500" 
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Stock Mínimo (Alerta)</label>
              <input 
                type="number" 
                min="1"
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500" 
                value={formData.cantidadMinima}
                onChange={e => setFormData({...formData, cantidadMinima: Number(e.target.value)})}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Precio Unitario ($)</label>
              <input 
                type="number" 
                min="0"
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500" 
                value={formData.precio}
                onChange={e => setFormData({...formData, precio: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-150 dark:border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
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

