export function ReportesListView() {
  const reportes = [
    { id: 1, nombre: "Consumo Combustible Mensual", fecha: "2026-05-13", estado: "Disponible" },
    { id: 2, nombre: "Rentabilidad de Rutas", fecha: "2026-05-12", estado: "Disponible" },
    { id: 3, nombre: "Cumplimiento de Tiempos", fecha: "2026-05-11", estado: "Disponible" },
    { id: 4, nombre: "Eficiencia de Conductores", fecha: "2026-05-10", estado: "Pendiente" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Reportes y Estadísticas</h2>
        <p className="text-sm text-slate-600">Analiza el rendimiento operativo de tu flota</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {reportes.map((reporte) => (
          <div key={reporte.id} className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-slate-900">{reporte.nombre}</h3>
            <p className="text-sm text-slate-500 mt-2">Generado: {new Date(reporte.fecha).toLocaleDateString("es-CO")}</p>
            <div className="mt-4 flex items-center justify-between">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  reporte.estado === "Disponible" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {reporte.estado}
              </span>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Descargar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
