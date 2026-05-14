export function AuditoriaListView() {
  const logs = [
    { id: 1, usuario: "Admin", accion: "CREATE", entidad: "Orden de Despacho", fechaHora: "2026-05-13 14:32:15", ip: "192.168.1.100" },
    { id: 2, usuario: "Despachador", accion: "UPDATE", entidad: "Estado de Viaje", fechaHora: "2026-05-13 14:15:00", ip: "192.168.1.101" },
    { id: 3, usuario: "Admin", accion: "DELETE", entidad: "Documento Vehicular", fechaHora: "2026-05-13 13:45:22", ip: "192.168.1.100" },
    { id: 4, usuario: "Auditor", accion: "LOGIN", entidad: "Usuario", fechaHora: "2026-05-13 08:00:00", ip: "192.168.1.102" }
  ];

  const accionColors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800",
    UPDATE: "bg-blue-100 text-blue-800",
    DELETE: "bg-red-100 text-red-800",
    LOGIN: "bg-purple-100 text-purple-800"
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Registro de Auditoría</h2>
        <p className="text-sm text-slate-600">Revisa todas las operaciones críticas del sistema</p>
      </div>

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
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-900">{log.usuario}</td>
                <td className="px-6 py-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${accionColors[log.accion] || "bg-gray-100"}`}>
                    {log.accion}
                  </span>
                </td>
                <td className="px-6 py-3 text-slate-600">{log.entidad}</td>
                <td className="px-6 py-3 text-slate-600">{log.fechaHora}</td>
                <td className="px-6 py-3 text-slate-600">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
