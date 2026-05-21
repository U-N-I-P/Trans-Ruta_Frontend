import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { obtenerLogsAuditoria, AuditoriaLog } from "../../services/auditoria.service";

const accionColors: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800",
  UPDATE: "bg-blue-100 text-blue-800",
  DELETE: "bg-red-100 text-red-800",
  APPROVE: "bg-emerald-100 text-emerald-800",
  REJECT: "bg-orange-100 text-orange-800",
  ASSIGN: "bg-cyan-100 text-cyan-800",
  LOGIN: "bg-purple-100 text-purple-800",
  LOGOUT: "bg-slate-100 text-slate-800"
};

export function AuditoriaListView() {
  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await obtenerLogsAuditoria();
      setLogs(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el registro de auditoría. Verifica la conexión con el backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void cargarLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Registro de Auditoría</h2>
          <p className="text-sm text-slate-600">Revisa todas las operaciones críticas del sistema</p>
        </div>
        <button
          type="button"
          onClick={() => void cargarLogs()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualizar"}
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-900">Usuario ID</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Acción</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Entidad</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Fecha y Hora</th>
              <th className="px-6 py-3 font-semibold text-slate-900">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-900">{log.usuarioId}</td>
                <td className="px-6 py-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${accionColors[log.accion] || "bg-gray-100 text-gray-700"}`}>
                    {log.accion}
                  </span>
                </td>
                <td className="px-6 py-3 text-slate-600">{log.entidad}</td>
                <td className="px-6 py-3 text-slate-600">{new Date(log.createdAt).toLocaleString("es-CO")}</td>
                <td className="px-6 py-3 text-slate-600">{log.ipAddress ?? "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
