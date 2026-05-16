import { useEffect, useState } from "react";
import { AuditoriaLog } from "../../types/domain";
import { obtenerAuditoriaLogs } from "../../services/auditoria.service";

export function AuditoriaListView() {
  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await obtenerAuditoriaLogs();
        setLogs(data);
      } catch {
        setError("No se pudo cargar el registro de auditoría. Verifica tu conexión.");
      } finally {
        setCargando(false);
      }
    };
    void cargar();
  }, []);

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
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Registro de Auditoría</h2>
        <p className="text-sm text-slate-600">Revisa todas las operaciones críticas del sistema</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {cargando ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Cargando registro de auditoría...
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
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
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${accionColors[log.accion] ?? "bg-gray-100"}`}>
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
