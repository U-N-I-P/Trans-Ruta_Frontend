import { useState } from "react";
import { MessageCircle, Phone, Mail, MapPin } from "lucide-react";

interface ClienteInfo {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  ubicacion: string;
  ordenesTotal: number;
  montoTotal: number;
  estado: "ACTIVO" | "INACTIVO";
  ultimaOrden: string;
}

export function PortalClienteView() {
  const [clientes] = useState<ClienteInfo[]>([
    {
      id: "1",
      nombre: "Empresa Logística A",
      email: "contacto@empresaa.com",
      telefono: "+57 301 234 5678",
      ubicacion: "Bogotá, DC",
      ordenesTotal: 45,
      montoTotal: 12500000,
      estado: "ACTIVO",
      ultimaOrden: "2026-05-12"
    },
    {
      id: "2",
      nombre: "Distribuidora Regional",
      email: "info@distribuidora.com",
      telefono: "+57 310 987 6543",
      ubicacion: "Medellín",
      ordenesTotal: 28,
      montoTotal: 8750000,
      estado: "ACTIVO",
      ultimaOrden: "2026-05-10"
    },
    {
      id: "3",
      nombre: "Comercio Mayorista",
      email: "ventas@mayorista.com",
      telefono: "+57 305 567 8901",
      ubicacion: "Cali",
      ordenesTotal: 12,
      montoTotal: 3200000,
      estado: "INACTIVO",
      ultimaOrden: "2026-04-20"
    }
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Portal de Clientes</h2>
        <p className="text-sm text-slate-600">Gestiona relaciones y comunicación con clientes</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Clientes Activos</p>
          <p className="text-2xl font-bold text-green-600">{clientes.filter(c => c.estado === "ACTIVO").length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Total Órdenes</p>
          <p className="text-2xl font-bold text-slate-900">{clientes.reduce((acc, c) => acc + c.ordenesTotal, 0)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Monto Facturado</p>
          <p className="text-2xl font-bold text-slate-900">
            ${(clientes.reduce((acc, c) => acc + c.montoTotal, 0) / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {clientes.map((cliente) => (
          <div key={cliente.id} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{cliente.nombre}</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4" />
                    <p className="text-sm">{cliente.email}</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-4 w-4" />
                    <p className="text-sm">{cliente.telefono}</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <p className="text-sm">{cliente.ubicacion}</p>
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
                      {new Date(cliente.ultimaOrden).toLocaleDateString("es-CO")}
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
