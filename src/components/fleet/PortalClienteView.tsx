import { MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { Cliente, OrdenDespacho } from "../../types/domain";

interface PortalClienteViewProps {
  clientes: Cliente[];
  ordenes: OrdenDespacho[];
}

export function PortalClienteView({ clientes, ordenes }: PortalClienteViewProps) {
  // Procesamos los datos para añadir métricas calculadas
  const clientesConMetricas = clientes.map((cliente) => {
    const ordenesCliente = ordenes.filter((o) => String(o.clienteId) === String(cliente.id));
    const ordenesTotal = ordenesCliente.length;
    
    // Obtenemos la última orden si tiene
    let ultimaOrden = "Sin órdenes";
    if (ordenesTotal > 0) {
      const fechas = ordenesCliente.map(o => new Date(o.fechaCreacion).getTime());
      const maxFecha = new Date(Math.max(...fechas));
      ultimaOrden = maxFecha.toLocaleDateString("es-CO");
    }

    // Como el backend no maneja facturación, simulamos el monto basado en el peso o lo dejamos en 0
    const montoTotal = ordenesCliente.reduce((acc, o) => acc + (o.pesoCarga * 1500), 0); // 1500 pesos por kg simulado

    return {
      ...cliente,
      ordenesTotal,
      montoTotal,
      ultimaOrden,
      // Asumimos que si tiene órdenes recientes está ACTIVO
      estado: ordenesTotal > 0 ? "ACTIVO" : "INACTIVO"
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Portal de Clientes</h2>
        <p className="text-sm text-slate-600">Gestiona relaciones y comunicación con clientes</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Clientes Activos</p>
          <p className="text-2xl font-bold text-green-600">{clientesConMetricas.filter(c => c.estado === "ACTIVO").length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Total Órdenes Históricas</p>
          <p className="text-2xl font-bold text-slate-900">{ordenes.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Monto Facturado (Estimado)</p>
          <p className="text-2xl font-bold text-slate-900">
            ${(clientesConMetricas.reduce((acc, c) => acc + c.montoTotal, 0) / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {clientesConMetricas.length === 0 && (
          <p className="text-slate-500 text-center py-8">No hay clientes registrados en la base de datos.</p>
        )}
        {clientesConMetricas.map((cliente) => (
          <div key={cliente.id} className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{cliente.nombre}</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <p className="text-sm">{cliente.correo}</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <p className="text-sm">{cliente.telefono || "No registrado"}</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <p className="text-sm">{cliente.direccion || "No registrada"}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600">Órdenes</p>
                    <p className="text-lg font-bold text-slate-900">{cliente.ordenesTotal}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600">Monto Total</p>
                    <p className="text-lg font-bold text-slate-900">
                      ${(cliente.montoTotal / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600">Estado</p>
                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${cliente.estado === "ACTIVO" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}`}>
                      {cliente.estado}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600">Última Orden</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {cliente.ultimaOrden}
                    </p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 flex gap-3">
                <button className="flex items-center gap-2 flex-1 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-blue-700 hover:bg-blue-100">
                  <MessageCircle className="h-4 w-4" />
                  Enviar Mensaje
                </button>
                <button className="flex items-center gap-2 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50">
                  <Phone className="h-4 w-4" />
                  Llamar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
