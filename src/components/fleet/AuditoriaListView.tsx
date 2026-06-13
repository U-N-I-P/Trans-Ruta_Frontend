import { useEffect, useMemo, useState } from "react";
import { Download, Filter, RotateCcw, ShieldCheck, Clock3, ListChecks, AlertTriangle } from "lucide-react";
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
    CREATE: "bg-green-50 text-green-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-green-200/30 dark:border-emerald-500/10",
    UPDATE: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/30 dark:border-blue-500/10",
    DELETE: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/30 dark:border-red-500/10",
    APPROVE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/30 dark:border-emerald-500/10",
    REJECT: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/30 dark:border-rose-500/10",
    ASSIGN: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-200/30 dark:border-purple-500/10",
    LOGIN: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200/30 dark:border-indigo-500/10",
    LOGOUT: "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/30 dark:border-slate-700/10"
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-6 text-slate-900 dark:text-slate-100 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 dark:text-slate-300">
              <ShieldCheck size={14} /> Registro de auditoría
            </span>
            <h2 className="mt-3 font-['Sora'] text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">Trazabilidad de operaciones críticas</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Consulta events sensibles, exporta evidencia y filtra por usuario, acción o entidad.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[560px]">
            <AuditCard titulo="Eventos" valor={resumen.total} icono={ListChecks} />
            <AuditCard titulo="Críticos" valor={resumen.criticidad} icono={AlertTriangle} />
            <AuditCard titulo="Últimos" valor={resumen.ultimos.length} icono={Clock3} />
            <AuditCard titulo="Acciones" valor={resumen.acciones.size} icono={Filter} />
          </div>
        </div>
      </section>

      {/* Filter and Action Panel */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-5 shadow-panel backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Filter className="h-4 w-4" />
          Filtros de Búsqueda
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Fecha Inicio</label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros((prev) => ({ ...prev, fechaInicio: e.target.value }))}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Fecha Fin</label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros((prev) => ({ ...prev, fechaFin: e.target.value }))}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Usuario ID</label>
            <input
              type="number"
              min="1"
              placeholder="Ej. 12"
              value={filtros.usuarioId}
              onChange={(e) => setFiltros((prev) => ({ ...prev, usuarioId: e.target.value }))}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Acción</label>
            <select
              value={filtros.accion}
              onChange={(e) => setFiltros((prev) => ({ ...prev, accion: e.target.value }))}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
            >
              <option value="">Todas</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="APPROVE">APPROVE</option>
              <option value="REJECT">REJECT</option>
              <option value="ASSIGN">ASSIGN</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Entidad</label>
            <input
              type="text"
              placeholder="Ej. Orden"
              value={filtros.entidad}
              onChange={(e) => setFiltros((prev) => ({ ...prev, entidad: e.target.value }))}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={cargar}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition-all shadow-md shadow-blue-500/10"
            >
              Aplicar filtros
            </button>
            <button
              type="button"
              onClick={() => setFiltros({ fechaInicio: "", fechaFin: "", usuarioId: "", accion: "", entidad: "" })}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="mr-2 inline h-4 w-4" />
              Limpiar
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void descargar("csv")}
              className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-colors"
              disabled={exportando !== null}
            >
              <Download className="mr-2 inline h-4 w-4" />
              {exportando === "csv" ? "Exportando CSV..." : "Exportar CSV"}
            </button>
            <button
              type="button"
              onClick={() => void descargar("pdf")}
              className="rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20 px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
              disabled={exportando !== null || forbidden}
            >
              <Download className="mr-2 inline h-4 w-4" />
              {exportando === "pdf" ? "Exportando PDF..." : "Exportar PDF"}
            </button>
          </div>
        </div>

        {forbidden && (
          <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-950/30 p-3 text-sm text-rose-400">
            No tienes permisos suficientes para acceder a los registros de auditoría. Contacta a un administrador.
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-xs text-red-400">{error}</div>
      )}

      {cargando ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-10 text-center text-slate-500 dark:text-slate-400 shadow-panel backdrop-blur-sm">
          Cargando registro de auditoría...
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-panel backdrop-blur-sm overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100">
              <tr>
                <th className="px-6 py-3 font-semibold">Usuario</th>
                <th className="px-6 py-3 font-semibold">Acción</th>
                <th className="px-6 py-3 font-semibold">Entidad</th>
                <th className="px-6 py-3 font-semibold">Fecha y Hora</th>
                <th className="px-6 py-3 font-semibold">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No hay registros de auditoría.
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-900 dark:text-slate-100">
                    {log.usuario?.nombre ?? `Usuario #${log.usuarioId}`}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${accionColors[log.accion] ?? "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                      {log.accion}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300 font-medium">
                    {log.entidad}{log.entidadId ? ` #${log.entidadId}` : ""}
                  </td>
                  <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                    {new Date(log.createdAt).toLocaleString("es-CO")}
                  </td>
                  <td className="px-6 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{log.ipAddress ?? "—"}</td>
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
  icono: Icono
}: {
  titulo: string;
  valor: string | number;
  icono: typeof ListChecks;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{titulo}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{valor}</p>
        </div>
        <Icono size={18} className="text-slate-700 dark:text-slate-300" />
      </div>
    </div>
  );
}
