import { useState } from "react";
import { Navigation, AlertTriangle, Zap } from "lucide-react";

interface Vehiculo {
  id: string;
  placa: string;
  ubicacion: { lat: number; lng: number };
  estado: "DISPONIBLE" | "EN_RUTA" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO";
  conductor: string;
  velocidad: number;
  ultima_actualizacion: string;
}

export function GPSTrackingView({}: any) {
  const [vehiculosTracking] = useState<Vehiculo[]>([
    {
      id: "1",
      placa: "ABC-123",
      ubicacion: { lat: 4.7110, lng: -74.0721 },
      estado: "EN_RUTA",
      conductor: "Juan Pérez",
      velocidad: 45,
      ultima_actualizacion: new Date().toLocaleTimeString("es-CO")
    },
    {
      id: "2",
      placa: "XYZ-789",
      ubicacion: { lat: 4.6097, lng: -74.0817 },
      estado: "DISPONIBLE",
      conductor: "Carlos López",
      velocidad: 0,
      ultima_actualizacion: new Date().toLocaleTimeString("es-CO")
    },
    {
      id: "3",
      placa: "DEF-456",
      ubicacion: { lat: 4.7169, lng: -74.0833 },
      estado: "EN_RUTA",
      conductor: "Ana García",
      velocidad: 60,
      ultima_actualizacion: new Date().toLocaleTimeString("es-CO")
    }
  ]);

  const estadoColors: Record<string, string> = {
    DISPONIBLE: "bg-green-100 text-green-800",
    EN_RUTA: "bg-blue-100 text-blue-800",
    EN_MANTENIMIENTO: "bg-yellow-100 text-yellow-800",
    FUERA_DE_SERVICIO: "bg-red-100 text-red-800"
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Monitoreo GPS</h2>
        <p className="text-sm text-slate-600">Ubica en tiempo real tus vehículos en ruta</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Vehículos Activos</p>
          <p className="text-2xl font-bold text-blue-600">{vehiculosTracking.filter(v => v.estado === "EN_RUTA").length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Disponibles</p>
          <p className="text-2xl font-bold text-green-600">{vehiculosTracking.filter(v => v.estado === "DISPONIBLE").length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Velocidad Promedio</p>
          <p className="text-2xl font-bold text-slate-900">
            {Math.round(vehiculosTracking.filter(v => v.estado === "EN_RUTA").reduce((acc, v) => acc + v.velocidad, 0) / Math.max(vehiculosTracking.filter(v => v.estado === "EN_RUTA").length, 1))} km/h
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-900 to-slate-800 p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="h-5 w-5" />
          <p className="font-semibold">Mapa de Rastreo (Vista Simulada)</p>
        </div>
        <div className="w-full h-96 bg-slate-700 rounded-lg flex items-center justify-center border border-slate-600">
          <div className="text-center">
            <Navigation className="h-12 w-12 text-blue-400 mx-auto mb-2 opacity-50" />
            <p className="text-slate-400">Mapa GPS interactivo</p>
            <p className="text-xs text-slate-500 mt-1">{vehiculosTracking.length} vehículos rastreados</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900">Detalle de Vehículos</h3>
        {vehiculosTracking.map((vehiculo) => (
          <div key={vehiculo.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-600">Placa</p>
                <p className="font-bold text-slate-900">{vehiculo.placa}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Conductor</p>
                <p className="font-semibold text-slate-900">{vehiculo.conductor}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Ubicación</p>
                <p className="text-sm text-slate-600">{vehiculo.ubicacion.lat.toFixed(4)}, {vehiculo.ubicacion.lng.toFixed(4)}</p>
              </div>
              <div className="flex items-end justify-between sm:flex-col sm:items-start">
                <div>
                  <p className="text-sm text-slate-600">Velocidad</p>
                  <div className="flex items-center gap-2">
                    <Zap className={`h-4 w-4 ${vehiculo.velocidad > 80 ? "text-red-600" : "text-blue-600"}`} />
                    <p className="font-semibold text-slate-900">{vehiculo.velocidad} km/h</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600">Estado</p>
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${estadoColors[vehiculo.estado]}`}>
                  {vehiculo.estado}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-600">Última Actualización</p>
                <p className="text-sm text-slate-600">{vehiculo.ultima_actualizacion}</p>
              </div>
              {vehiculo.velocidad > 80 && (
                <div className="sm:col-span-2 flex items-center gap-2 text-red-700 bg-red-50 p-2 rounded-lg">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-xs font-medium">Velocidad excesiva detectada</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
