import { useEffect, useMemo, useState } from "react";
import { Download, Filter, RotateCcw, Search, ShieldCheck, Clock3, ListChecks, AlertTriangle } from "lucide-react";
import { useToast } from "../ui/ToastProvider";
import { AuditoriaLog } from "../../types/domain";
import { exportarAuditoriaLogs, obtenerAuditoriaLogs } from "../../services/auditoria.service";

export function AuditoriaListView() {
  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportando, setExportando] = useState<"csv" | "pdf" | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const { addToast } = useToast();
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    usuarioId: "",
    accion: "",
    entidad: ""
  });

  const cargar = async () => {
    try {
      setCargando(true);
      setError(null);
      const params = {
        ...(filtros.fechaInicio ? { fechaInicio: filtros.fechaInicio } : {}),
        ...(filtros.fechaFin ? { fechaFin: filtros.fechaFin } : {}),
        ...(filtros.usuarioId ? { usuarioId: filtros.usuarioId } : {}),
        ...(filtros.accion ? { accion: filtros.accion } : {}),
        ...(filtros.entidad ? { entidad: filtros.entidad } : {}),
      };
      const data = await obtenerAuditoriaLogs(params);
      setLogs(data);
      setForbidden(false);
    } catch (err: any) {
      const status = err?.response?.status ?? null;
      if (status === 403) {
        setForbidden(true);
        addToast({ message: 'No tiene permisos para ver el registro de auditoría (403)', type: 'error' });
      } else if (status === 401) {
        addToast({ message: 'No autenticado. Por favor inicia sesión nuevamente.', type: 'error' });
      } else {
        setError("No se pudo cargar el registro de auditoría. Verifica tu conexión.");
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const resumen = useMemo(() => {
    const acciones = new Map<string, number>();
    logs.forEach((log) => acciones.set(log.accion, (acciones.get(log.accion) ?? 0) + 1));
    const ultimos = logs.slice(0, 5);
    return {
      total: logs.length,
      acciones,
      ultimos,
      criticidad: logs.filter((log) => log.accion === "DELETE" || log.accion === "REJECT").length,
    };
  }, [logs]);

  const descargar = async (formato: "csv" | "pdf") => {
    try {
      setExportando(formato);
      const params = {
        ...(filtros.fechaInicio ? { fechaInicio: filtros.fechaInicio } : {}),
        ...(filtros.fechaFin ? { fechaFin: filtros.fechaFin } : {}),
        ...(filtros.usuarioId ? { usuarioId: filtros.usuarioId } : {}),
        ...(filtros.accion ? { accion: filtros.accion } : {}),
        ...(filtros.entidad ? { entidad: filtros.entidad } : {}),
      };
      const { blob, filename } = await exportarAuditoriaLogs(formato, params);
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = filename;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setExportando(null);
    }
  };

  useEffect(() => {
    const handler = (e: Event) => {
      // @ts-ignore
      const status = e?.detail?.status;
      if (status === 401) {
        addToast({ message: 'Sesión expirada. Vuelva a iniciar sesión.', type: 'error' });
      }
      if (status === 403) {
        setForbidden(true);
        addToast({ message: 'No tiene permisos suficientes para acceder a auditoría.', type: 'error' });
      }
    };
    window.addEventListener('transruta:authError', handler as EventListener);
    return () => window.removeEventListener('transruta:authError', handler as EventListener);
  }, [addToast]);

  const accionColors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800",
    UPDATE: "bg-blue-100 text-blue-800",
    DELETE: "bg-red-100 text-red-800",
    APPROVE: "bg-emerald-100 text-emerald-800",
    REJECT: "bg-rose-100 text-rose-800",
    ASSIGN: "bg-purple-100 text-purple-800",
    LOGIN: "bg-indigo-100 text-indigo-800",
    LOGOUT: "bg-slate-100 text-slate-700"
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
              <ShieldCheck size={14} /> Registro de auditoría
            </span>
            <h2 className="mt-3 font-['Sora'] text-3xl font-semibold">Trazabilidad de operaciones críticas</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Consulta eventos sensibles, exporta evidencia y filtra por usuario, acción o entidad.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[560px]">
            <AuditCard titulo="Eventos" valor={resumen.total} icono={ListChecks} tono="bg-white/10" />
            <AuditCard titulo="Críticos" valor={resumen.criticidad} icono={AlertTriangle} tono="bg-rose-400/20" />
            <AuditCard titulo="Últimos" valor={resumen.ultimos.length} icono={Clock3} tono="bg-sky-400/20" />
            <AuditCard titulo="Acciones" valor={resumen.acciones.size} icono={Filter} tono="bg-emerald-400/20" />
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1.35fr_1fr]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200 backdrop-blur">
            <Search size={18} className="shrink-0 text-slate-300" />
            <input
              type="text"
              placeholder="Filtrar visualmente la vista cargada..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              onChange={(event) => setFiltros((prev) => ({ ...prev, entidad: event.target.value }))}
              value={filtros.entidad}
            />
          </label>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300 backdrop-blur">
            <p className="font-semibold text-white">Última actividad</p>
            <p className="mt-1">{resumen.ultimos[0] ? `${resumen.ultimos[0].accion} · ${resumen.ultimos[0].entidad}` : "Sin registros recientes"}</p>
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="h-4 w-4" />
          Filtros
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <input type="date" value={filtros.fechaInicio} onChange={(e) => setFiltros((prev) => ({ ...prev, fechaInicio: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <input type="date" value={filtros.fechaFin} onChange={(e) => setFiltros((prev) => ({ ...prev, fechaFin: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <input type="number" min="1" placeholder="Usuario ID" value={filtros.usuarioId} onChange={(e) => setFiltros((prev) => ({ ...prev, usuarioId: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <select value={filtros.accion} onChange={(e) => setFiltros((prev) => ({ ...prev, accion: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="">Todas las acciones</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="APPROVE">APPROVE</option>
            <option value="REJECT">REJECT</option>
            <option value="ASSIGN">ASSIGN</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
          </select>
          <input type="text" placeholder="Entidad afectada" value={filtros.entidad} onChange={(e) => setFiltros((prev) => ({ ...prev, entidad: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={cargar} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Aplicar filtros
          </button>
          <button type="button" onClick={() => setFiltros({ fechaInicio: "", fechaFin: "", usuarioId: "", accion: "", entidad: "" })} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <RotateCcw className="mr-2 inline h-4 w-4" />
            Limpiar
          </button>
          <button type="button" onClick={() => void descargar("csv")} className="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50" disabled={exportando !== null}>
            <Download className="mr-2 inline h-4 w-4" />
            {exportando === "csv" ? "Exportando CSV..." : "Exportar CSV"}
          </button>
          <button type="button" onClick={() => void descargar("pdf")} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" disabled={exportando !== null || forbidden}>
            <Download className="mr-2 inline h-4 w-4" />
            {exportando === "pdf" ? "Exportando PDF..." : "Exportar PDF"}
          </button>
        </div>
        {forbidden && (
          <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            No tienes permisos suficientes para acceder a los registros de auditoría. Contacta a un administrador.
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {cargando ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-panel">
          Cargando registro de auditoría...
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-900">Usuario</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Acción</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Entidad</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Fecha y Hora</th>
                <th className="px-6 py-3 font-semibold text-slate-900">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                    No hay registros de auditoría.
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">
                    {log.usuario?.nombre ?? `Usuario #${log.usuarioId}`}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${accionColors[log.accion] ?? "bg-gray-100 text-gray-700"}`}>
                      {log.accion}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {log.entidad}{log.entidadId ? ` #${log.entidadId}` : ""}
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {new Date(log.createdAt).toLocaleString("es-CO")}
                  </td>
                  <td className="px-6 py-3 text-slate-600">{log.ipAddress ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AuditCard({
  titulo,
  valor,
  icono: Icono,
  tono
}: {
  titulo: string;
  valor: string | number;
  icono: typeof ListChecks;
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
