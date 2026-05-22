import { MessageCircle, Phone, Mail, MapPin, Search, Send, BellRing, Users2, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "../ui/ToastProvider";
import { Cliente, Notificacion, OrdenDespacho } from "../../types/domain";
import { crearNotificacion } from "../../services/notificacion.service";

interface PortalClienteViewProps {
  clientes: Cliente[];
  ordenes: OrdenDespacho[];
  notificaciones: Notificacion[];
}

export function PortalClienteView({ clientes, ordenes, notificaciones }: PortalClienteViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState<"ESTADO_ENVIO" | "INCIDENTE" | "STOCK_BAJO" | "MANTENIMIENTO" | "SISTEMA">("SISTEMA");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "ACTIVO" | "INACTIVO">("TODOS");
  const { addToast } = useToast();

  const abrirModalMensaje = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setMensaje(`Hola ${cliente.nombre},\n\n`);
    setTipo("SISTEMA");
    setModalOpen(true);
  };

  // Procesamos los datos para añadir métricas calculadas
  const clientesConMetricas = useMemo(() => clientes.map((cliente) => {
    const ordenesCliente = ordenes.filter((o) => String(o.clienteId) === String(cliente.id));
    const ordenesTotal = ordenesCliente.length;
    const notificacionesCliente = notificaciones.filter((notif) => String(notif.clienteId) === String(cliente.id));
    
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
      notificacionesCliente,
      // Asumimos que si tiene órdenes recientes está ACTIVO
      estado: ordenesTotal > 0 ? "ACTIVO" : "INACTIVO"
    };
  }), [clientes, notificaciones, ordenes]);

  const metricas = useMemo(() => {
    const activos = clientesConMetricas.filter((c) => c.estado === "ACTIVO").length;
    const mensajes = notificaciones.length;
    const totalOrdenes = ordenes.length;
    const montoEstimado = clientesConMetricas.reduce((acc, c) => acc + c.montoTotal, 0);
    return { activos, mensajes, totalOrdenes, montoEstimado };
  }, [clientesConMetricas, notificaciones.length, ordenes.length]);

  const clientesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return clientesConMetricas.filter((cliente) => {
      const coincideTexto =
        texto.length === 0 ||
        cliente.nombre.toLowerCase().includes(texto) ||
        cliente.correo.toLowerCase().includes(texto) ||
        (cliente.telefono ?? "").toLowerCase().includes(texto);
      const coincideEstado = filtroEstado === "TODOS" || cliente.estado === filtroEstado;
      return coincideTexto && coincideEstado;
    });
  }, [busqueda, clientesConMetricas, filtroEstado]);

  const estados = [
    { key: "TODOS" as const, label: "Todos", total: clientesConMetricas.length },
    { key: "ACTIVO" as const, label: "Activos", total: clientesConMetricas.filter((c) => c.estado === "ACTIVO").length },
    { key: "INACTIVO" as const, label: "Inactivos", total: clientesConMetricas.filter((c) => c.estado === "INACTIVO").length }
  ];

  const totalNotificacionesNoLeidas = notificaciones.filter((notif) => !notif.leida).length;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 p-6 text-white shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
              <Users2 size={14} /> Portal de clientes
            </span>
            <h2 className="mt-3 font-['Sora'] text-3xl font-semibold">Relación comercial más clara y viva</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Visualiza actividad, mensajería y volumen estimado de negocio por cliente en una sola pantalla.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[560px]">
            <MetricCard titulo="Clientes activos" valor={metricas.activos} icono={Users2} tono="bg-white/10" />
            <MetricCard titulo="Órdenes" valor={metricas.totalOrdenes} icono={TrendingUp} tono="bg-sky-400/20" />
            <MetricCard titulo="Notificaciones" valor={metricas.mensajes} icono={BellRing} tono="bg-emerald-400/20" />
            <MetricCard titulo="Sin leer" valor={totalNotificacionesNoLeidas} icono={Send} tono="bg-amber-400/20" />
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1.35fr_1fr]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200 backdrop-blur">
            <Search size={18} className="shrink-0 text-slate-300" />
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar cliente por nombre, correo o teléfono..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>
          <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur">
            {estados.map((estado) => {
              const activo = filtroEstado === estado.key;
              return (
                <button
                  key={estado.key}
                  type="button"
                  onClick={() => setFiltroEstado(estado.key)}
                  className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${
                    activo ? "bg-white text-slate-900" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {estado.label} <span className="ml-1 opacity-70">{estado.total}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
          <p className="text-sm text-slate-600">Clientes Activos</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{metricas.activos}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
          <p className="text-sm text-slate-600">Total Órdenes Históricas</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{metricas.totalOrdenes}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
          <p className="text-sm text-slate-600">Monto Facturado (Estimado)</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            ${(metricas.montoEstimado / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {clientesFiltrados.length === 0 && (
          <p className="rounded-2xl border border-slate-200 bg-white py-10 text-center text-slate-500 shadow-panel">
            No hay clientes que coincidan con el filtro actual.
          </p>
        )}
        {clientesFiltrados.map((cliente, index) => (
          <div
            key={cliente.id}
            className={`overflow-hidden rounded-3xl border p-6 shadow-panel transition-transform duration-200 hover:-translate-y-0.5 ${
              cliente.estado === "ACTIVO"
                ? "border-emerald-200 bg-gradient-to-br from-white via-emerald-50/40 to-white"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">#{index + 1}</span>
                  <h3 className="font-['Sora'] text-xl font-semibold text-slate-900">{cliente.nombre}</h3>
                </div>
                <p className="mt-1 text-sm text-slate-500">Última orden: {cliente.ultimaOrden}</p>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cliente.estado === "ACTIVO" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                {cliente.estado}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
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
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-600">Órdenes</p>
                    <p className="text-lg font-bold text-slate-900">{cliente.ordenesTotal}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-600">Monto Total</p>
                    <p className="text-lg font-bold text-slate-900">
                      ${(cliente.montoTotal / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-600">Estado</p>
                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${cliente.estado === "ACTIVO" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}`}>
                      {cliente.estado}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-600">Última Orden</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {cliente.ultimaOrden}
                    </p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800">Seguimiento y notificaciones</p>
                  <span className="text-xs text-slate-500">{cliente.notificacionesCliente.length} eventos</span>
                </div>
                <div className="mt-3 space-y-2">
                  {cliente.notificacionesCliente.length === 0 ? (
                    <p className="text-sm text-slate-500">Sin notificaciones registradas para este cliente.</p>
                  ) : (
                    cliente.notificacionesCliente.slice(0, 3).map((notif) => (
                      <div key={notif.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-slate-900">{notif.tipo.replace(/_/g, " ")}</p>
                          <span className={`text-xs ${notif.leida ? "text-slate-400" : "text-blue-600"}`}>
                            {notif.leida ? "Leída" : "Nueva"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{notif.mensaje}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="sm:col-span-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => abrirModalMensaje(cliente)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-3 py-3 font-medium text-blue-700 transition hover:bg-blue-100"
                >
                  <MessageCircle className="h-4 w-4" />
                  Enviar Mensaje
                </button>
                <div className="flex-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {modalOpen && clienteSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Nuevo mensaje</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">Enviar mensaje a {clienteSeleccionado.nombre}</h3>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{clienteSeleccionado.correo}</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="mt-1 w-full rounded-xl border-slate-200 bg-white px-3 py-2"
              >
                <option value="SISTEMA">SISTEMA</option>
                <option value="ESTADO_ENVIO">ESTADO_ENVIO</option>
                <option value="INCIDENTE">INCIDENTE</option>
                <option value="STOCK_BAJO">STOCK_BAJO</option>
                <option value="MANTENIMIENTO">MANTENIMIENTO</option>
              </select>
              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{clienteSeleccionado.nombre}</p>
                <p className="mt-1">{clienteSeleccionado.telefono || "Sin teléfono registrado"}</p>
                <p className="mt-1">{clienteSeleccionado.direccion || "Sin dirección registrada"}</p>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700">Mensaje</label>
              <textarea
                rows={6}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                className="mt-1 w-full rounded-2xl border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setClienteSeleccionado(null);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!clienteSeleccionado) return;
                  try {
                    await crearNotificacion({
                      mensaje,
                      fecha: new Date().toISOString(),
                      tipo,
                      destinatario: clienteSeleccionado.correo || "",
                      clienteId: clienteSeleccionado.id
                    });
                    // Emitir evento para que el layout principal refresque datos
                    try {
                      window.dispatchEvent(
                        new CustomEvent("transruta:refreshData", { detail: { scope: "notificaciones" } })
                      );
                    } catch (e) {
                      // noop
                    }
                    setModalOpen(false);
                    setClienteSeleccionado(null);
                    addToast({ message: "Notificación creada correctamente", type: "success" });
                  } catch (err) {
                    console.error(err);
                    addToast({ message: "Error al crear la notificación", type: "error" });
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  titulo,
  valor,
  icono: Icono,
  tono
}: {
  titulo: string;
  valor: number;
  icono: typeof Users2;
  tono: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 ${tono} p-3 backdrop-blur`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300">{titulo}</p>
          <p className="mt-1 text-2xl font-bold text-white">{valor}</p>
        </div>
        <Icono size={18} className="text-white/80" />
      </div>
    </div>
  );
}
