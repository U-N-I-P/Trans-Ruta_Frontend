import { useState, useEffect } from "react";
import { Navigation, AlertTriangle, Zap, CheckCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { OrdenDespacho, Vehiculo } from "../../types/domain";

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
  ordenes: OrdenDespacho[];
}

interface SimulatedVehicle extends Vehiculo {
  lat: number;
  lng: number;
  velocidad: number;
  ultima_actualizacion: string;
  progreso: number;
  ordenCodigo?: string;
}

function parseCoordenadas(valor?: string | null) {
  if (!valor) return null;
  const partes = valor.split(",").map((item) => Number(item.trim()));
  if (partes.length !== 2 || partes.some((item) => Number.isNaN(item))) return null;
  return { lat: partes[0], lng: partes[1] };
}

function interpolarPunto(origen: { lat: number; lng: number }, destino: { lat: number; lng: number }, progreso: number) {
  const factor = Math.max(0, Math.min(1, progreso / 100));
  return {
    lat: origen.lat + (destino.lat - origen.lat) * factor,
    lng: origen.lng + (destino.lng - origen.lng) * factor,
  };
}

export function GPSTrackingView({ vehiculos, ordenes }: GPSTrackingViewProps) {
  const [simulatedData, setSimulatedData] = useState<SimulatedVehicle[]>([]);

  // Inicializar simulación basada en vehículos reales
  useEffect(() => {
    const ordenesActivas = ordenes.filter((orden) => orden.estado === "DESPACHADO" || orden.estado === "EN_RUTA" || orden.estado === "CERCA_DEL_DESTINO");
    const vehiculosEnCalle = vehiculos.filter((vehiculo) => vehiculo.estado === "EN_RUTA" || vehiculo.estado === "DISPONIBLE");

    const initialData = vehiculosEnCalle.map((vehiculo, index) => {
      const orden = ordenesActivas[index % Math.max(ordenesActivas.length, 1)];
      const origen = parseCoordenadas(orden?.origen);
      const destino = parseCoordenadas(orden?.destino);
      const progreso = orden ? (orden.estado === "DESPACHADO" ? 20 : orden.estado === "EN_RUTA" ? 55 : 82) : 0;
      const punto = origen && destino ? interpolarPunto(origen, destino, progreso) : { lat: 4.65 + Math.random() * 0.1, lng: -74.15 + Math.random() * 0.1 };

      return {
        ...vehiculo,
        lat: punto.lat,
        lng: punto.lng,
        velocidad: vehiculo.estado === "EN_RUTA" ? Math.floor(Math.random() * 30) + 50 : 0,
        ultima_actualizacion: new Date().toLocaleTimeString("es-CO"),
        progreso,
        ordenCodigo: orden?.codigo,
      };
    });

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
            progreso: Math.min(100, v.progreso + 3),
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [vehiculos]);

  const estadoColors: Record<string, string> = {
    DISPONIBLE: "bg-green-50 text-green-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-green-200/30 dark:border-emerald-500/10",
    EN_RUTA: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/30 dark:border-blue-500/10",
    EN_MANTENIMIENTO: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/30 dark:border-amber-500/10",
    FUERA_DE_SERVICIO: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/30 dark:border-red-500/10"
  };

  const vehiculosEnRuta = simulatedData.filter(v => v.estado === "EN_RUTA");
  const velocidadPromedio = vehiculosEnRuta.length > 0
    ? Math.round(vehiculosEnRuta.reduce((acc, v) => acc + v.velocidad, 0) / vehiculosEnRuta.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm backdrop-blur-sm">
        <h2 className="font-['Sora'] text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">Monitoreo GPS</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Ubica en tiempo real tus vehículos en ruta</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Vehículos en Ruta</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{vehiculosEnRuta.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Disponibles en Base</p>
          <p className="text-2xl font-bold text-green-600 dark:text-emerald-400">
            {simulatedData.filter(v => v.estado === "DISPONIBLE").length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Velocidad Promedio Flota</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {velocidadPromedio} km/h
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-2 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2 mb-3 px-4 pt-2">
          <Navigation className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <p className="font-semibold text-slate-800 dark:text-slate-200">Mapa de Rastreo en Vivo (Simulador)</p>
        </div>
        <div className="w-full h-[500px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 relative z-0">
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
                    <p className="font-bold text-base border-b pb-1 mb-1 text-slate-900">{v.placa}</p>
                    {v.ordenCodigo && <p className="text-slate-600"><b>Orden:</b> {v.ordenCodigo}</p>}
                    <p className="text-slate-600"><b>Tipo:</b> {v.tipo.replace(/_/g, ' ')}</p>
                    <p className="text-slate-600"><b>Velocidad:</b> {v.velocidad} km/h</p>
                    <p className="text-slate-600"><b>Progreso:</b> {v.progreso}%</p>
                    <div className="pt-1">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${estadoColors[v.estado]}`}>
                        {v.estado.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Detalle de Flota Activa</h3>
        {simulatedData.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No hay vehículos activos para monitorear.</p>
        ) : (
          simulatedData.map((vehiculo) => (
            <div key={vehiculo.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Vehículo</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{vehiculo.placa}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{vehiculo.tipo.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ubicación GPS</p>
                  <p className="text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded">
                    {vehiculo.lat.toFixed(4)}, {vehiculo.lng.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Velocidad / Estado</p>
                  <div className="flex flex-col items-start gap-1.5 mt-1">
                    {vehiculo.estado === "EN_RUTA" ? (
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <Zap className={`h-4 w-4 ${vehiculo.velocidad > 80 ? "text-red-650 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`} />
                        <span className={`font-bold ${vehiculo.velocidad > 80 ? "text-red-650 dark:text-red-400" : ""}`}>
                          {vehiculo.velocidad} km/h
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-green-600 dark:text-emerald-400">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-bold">Estacionado</span>
                      </div>
                    )}
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${estadoColors[vehiculo.estado]}`}>
                      {vehiculo.estado.replace(/_/g, ' ')}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Progreso estimado: {vehiculo.progreso}%</p>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Última Actualización</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{vehiculo.ultima_actualizacion}</p>
                  {vehiculo.velocidad > 80 && (
                    <div className="mt-2 flex items-center gap-1 text-red-750 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded border border-red-200 dark:border-red-500/10">
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
