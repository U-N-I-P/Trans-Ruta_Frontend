import { useState, useEffect } from "react";
import { Navigation, AlertTriangle, Zap, CheckCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Vehiculo } from "../../types/domain";

// Solución al problema de los iconos por defecto de Leaflet en React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface GPSTrackingViewProps {
  vehiculos: Vehiculo[];
}

interface SimulatedVehicle extends Vehiculo {
  lat: number;
  lng: number;
  velocidad: number;
  ultima_actualizacion: string;
}

export function GPSTrackingView({ vehiculos }: GPSTrackingViewProps) {
  const [simulatedData, setSimulatedData] = useState<SimulatedVehicle[]>([]);

  // Inicializar simulación basada en vehículos reales
  useEffect(() => {
    // Solo monitorear los que pueden estar en calle
    const vehiculosEnCalle = vehiculos.filter(v => v.estado === "EN_RUTA" || v.estado === "DISPONIBLE");

    const initialData = vehiculosEnCalle.map((v) => ({
      ...v,
      // Coordenadas aleatorias cerca a Bogotá (Centro: 4.7110, -74.0721)
      lat: 4.65 + (Math.random() * 0.1),
      lng: -74.15 + (Math.random() * 0.1),
      velocidad: v.estado === "EN_RUTA" ? Math.floor(Math.random() * 30) + 50 : 0,
      ultima_actualizacion: new Date().toLocaleTimeString("es-CO"),
    }));

    setSimulatedData(initialData);

    const interval = setInterval(() => {
      setSimulatedData((prevData) =>
        prevData.map((v) => {
          if (v.estado !== "EN_RUTA") {
            return { ...v, ultima_actualizacion: new Date().toLocaleTimeString("es-CO") };
          }
          
          // Movimiento aleatorio
          const moveLat = (Math.random() - 0.5) * 0.005;
          const moveLng = (Math.random() - 0.5) * 0.005;
          // Variación de velocidad
          const newVel = Math.floor(Math.random() * 40) + 50; 

          return {
            ...v,
            lat: v.lat + moveLat,
            lng: v.lng + moveLng,
            velocidad: newVel,
            ultima_actualizacion: new Date().toLocaleTimeString("es-CO"),
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [vehiculos]);

  const estadoColors: Record<string, string> = {
    DISPONIBLE: "bg-green-100 text-green-800",
    EN_RUTA: "bg-blue-100 text-blue-800",
    EN_MANTENIMIENTO: "bg-yellow-100 text-yellow-800",
    FUERA_DE_SERVICIO: "bg-red-100 text-red-800"
  };

  const vehiculosEnRuta = simulatedData.filter(v => v.estado === "EN_RUTA");
  const velocidadPromedio = vehiculosEnRuta.length > 0
    ? Math.round(vehiculosEnRuta.reduce((acc, v) => acc + v.velocidad, 0) / vehiculosEnRuta.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Monitoreo GPS</h2>
        <p className="text-sm text-slate-600">Ubica en tiempo real tus vehículos en ruta</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Vehículos en Ruta</p>
          <p className="text-2xl font-bold text-blue-600">{vehiculosEnRuta.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Disponibles en Base</p>
          <p className="text-2xl font-bold text-green-600">
            {simulatedData.filter(v => v.estado === "DISPONIBLE").length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Velocidad Promedio Flota</p>
          <p className="text-2xl font-bold text-slate-900">
            {velocidadPromedio} km/h
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-2">
        <div className="flex items-center gap-2 mb-3 px-4 pt-2">
          <Navigation className="h-5 w-5 text-blue-600" />
          <p className="font-semibold text-slate-800">Mapa de Rastreo en Vivo (Simulador)</p>
        </div>
        <div className="w-full h-[500px] rounded-lg overflow-hidden border border-slate-200 relative z-0">
          <MapContainer 
            center={[4.7110, -74.0721]} 
            zoom={11} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {simulatedData.map((v) => (
              <Marker key={v.id} position={[v.lat, v.lng]}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold text-base border-b pb-1 mb-1">{v.placa}</p>
                    <p><b>Tipo:</b> {v.tipo.replace(/_/g, ' ')}</p>
                    <p><b>Velocidad:</b> {v.velocidad} km/h</p>
                    <p><b>Estado:</b> <span className={estadoColors[v.estado] + " px-2 py-0.5 rounded text-xs ml-1"}>{v.estado.replace(/_/g, ' ')}</span></p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900">Detalle de Flota Activa</h3>
        {simulatedData.length === 0 ? (
          <p className="text-slate-500">No hay vehículos activos para monitorear.</p>
        ) : (
          simulatedData.map((vehiculo) => (
            <div key={vehiculo.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-slate-600">Vehículo</p>
                  <p className="font-bold text-slate-900">{vehiculo.placa}</p>
                  <p className="text-xs text-slate-500">{vehiculo.tipo.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Ubicación GPS</p>
                  <p className="text-sm font-mono text-slate-700 bg-slate-50 p-1 rounded">
                    {vehiculo.lat.toFixed(4)}, {vehiculo.lng.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Velocidad / Estado</p>
                  <div className="flex flex-col items-start gap-1 mt-1">
                    {vehiculo.estado === "EN_RUTA" ? (
                      <div className="flex items-center gap-1">
                        <Zap className={`h-4 w-4 ${vehiculo.velocidad > 80 ? "text-red-600" : "text-blue-600"}`} />
                        <span className={`font-bold ${vehiculo.velocidad > 80 ? "text-red-600" : "text-blue-600"}`}>
                          {vehiculo.velocidad} km/h
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-bold text-green-600">Estacionado</span>
                      </div>
                    )}
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${estadoColors[vehiculo.estado]}`}>
                      {vehiculo.estado.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xs text-slate-500 mb-1">Última Actualización</p>
                  <p className="text-sm font-medium text-slate-700">{vehiculo.ultima_actualizacion}</p>
                  {vehiculo.velocidad > 80 && (
                    <div className="mt-2 flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded">
                      <AlertTriangle className="h-3 w-3" />
                      <p className="text-xs font-bold">¡Límite Excedido!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
