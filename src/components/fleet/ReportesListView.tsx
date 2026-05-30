import { useEffect, useMemo, useState } from "react";
import { FileText, Search, DownloadCloud, RefreshCw, PlusCircle, BarChart3 } from "lucide-react";
import { listarReportes, obtenerReporte, generarReporte, ReporteItem } from "../../services/reporte.service";
import { obtenerVehiculos } from "../../services/vehiculo.service";
import { useToast } from "../ui/ToastProvider";

export function ReportesListView() {
  const [reportes, setReportes] = useState<ReporteItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<ReporteItem | null>(null);
  const [modalVerOpen, setModalVerOpen] = useState(false);
  const [generarOpen, setGenerarOpen] = useState(false);
  const [tipoNuevo, setTipoNuevo] = useState("COMBUSTIBLE");
  const [paramsText, setParamsText] = useState<string>("");
  const [vehiculosList, setVehiculosList] = useState<any[]>([]);
  const [placaInput, setPlacaInput] = useState<string>("");
  const [advancedJson, setAdvancedJson] = useState<boolean>(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");

  const { addToast } = useToast();

  const cargar = async () => {
    try {
      setCargando(true);
      setError(null);
      const resp = await listarReportes();
      setReportes(resp.data ?? []);
    } catch (err) {
      setError("No se pudieron cargar los reportes. Verifica la conexión y credenciales.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const reportesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return reportes.filter((reporte) => {
      const coincideTexto =
        texto.length === 0 ||
        reporte.tipo.toLowerCase().includes(texto) ||
        (reporte.formato ?? "").toLowerCase().includes(texto);
      const coincideTipo = filtroTipo === "TODOS" || reporte.tipo === filtroTipo;
      return coincideTexto && coincideTipo;
    });
  }, [busqueda, filtroTipo, reportes]);

  const resumen = useMemo(() => {
    const total = reportes.length;
    const formatos = new Map<string, number>();
    reportes.forEach((reporte) => formatos.set(reporte.formato, (formatos.get(reporte.formato) ?? 0) + 1));
    const ultimo = [...reportes].sort((a, b) => new Date(b.fechaGeneracion).getTime() - new Date(a.fechaGeneracion).getTime())[0];
    return { total, formatos, ultimo };
  }, [reportes]);

  const tiposDisponibles = ["TODOS", ...Array.from(new Set(reportes.map((reporte) => reporte.tipo)))];

  useEffect(() => {
    if (!generarOpen) return;
    void (async () => {
      try {
        const lista = await obtenerVehiculos();
        setVehiculosList(lista);
      } catch {
        // ignore
      }
    })();
  }, [generarOpen]);

  const verReporte = async (id: number) => {
    try {
      const resp = await obtenerReporte(id);
      const data = resp.data as ReporteItem;
      setDetalle(data);
      setModalVerOpen(true);
    } catch {
      addToast({ message: "Error obteniendo el reporte", type: "error" });
    }
  };

  const descargar = (reporte: ReporteItem) => {
    try {
      const contenido = reporte.contenido ?? JSON.stringify({ mensaje: 'Sin contenido' });
      const blob = new Blob([contenido], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${reporte.id}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      addToast({ message: 'Descarga iniciada', type: 'success' });
    } catch {
      addToast({ message: 'No se pudo descargar el reporte', type: 'error' });
    }
  };

  const crearReporte = async () => {
    try {
      const body: any = { tipo: tipoNuevo, formato: 'JSON' };
      if (advancedJson) {
        if (paramsText) {
          let parsed: any;
          try {
            parsed = JSON.parse(paramsText);
          } catch {
            addToast({ message: 'Parámetros JSON inválidos', type: 'error' });
            return;
          }

          // Si el usuario proporciona 'placa' en vez de 'vehiculoId', intentamos resolverla
          if (parsed.placa && !parsed.vehiculoId) {
            try {
              const vehiculos = await obtenerVehiculos({ placa: parsed.placa });
              const found = Array.isArray(vehiculos) && vehiculos.length > 0 ? vehiculos[0] : null;
              if (found) {
                parsed.vehiculoId = found.id;
              } else {
                addToast({ message: `No se encontró vehículo con placa ${parsed.placa}`, type: 'error' });
                return;
              }
            } catch {
              addToast({ message: 'Error buscando vehículo por placa', type: 'error' });
              return;
            }
          }

          body.parametros = JSON.stringify(parsed);
        }
      } else {
        // modo placa simple
        if (placaInput) {
          body.parametros = JSON.stringify({ placa: placaInput });
        }
      }

      await generarReporte(body);
      addToast({ message: 'Reporte generado', type: 'success' });
      setGenerarOpen(false);
      void cargar();
    } catch (err) {
      addToast({ message: 'Error generando reporte', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
              <BarChart3 size={14} /> Reportes y estadísticas
            </span>
            <h2 className="mt-3 font-['Sora'] text-3xl font-semibold">Lectura rápida del rendimiento operativo</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Consulta reportes generados, filtra por tipo y crea nuevos reportes con una experiencia más visual.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[520px]">
            <SummaryCard titulo="Reportes" valor={resumen.total} icono={FileText} tono="bg-white/10" />
            <SummaryCard titulo="JSON" valor={resumen.formatos.get("JSON") ?? 0} icono={DownloadCloud} tono="bg-sky-400/20" />
            <SummaryCard titulo="Último" valor={resumen.ultimo ? new Date(resumen.ultimo.fechaGeneracion).toLocaleDateString("es-CO") : "—"} icono={RefreshCw} tono="bg-emerald-400/20" />
            <SummaryCard titulo="Tipos" valor={new Set(reportes.map((r) => r.tipo)).size} icono={PlusCircle} tono="bg-amber-400/20" />
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1.35fr_1fr]">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700">
            <Search size={18} className="shrink-0 text-slate-300" />
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por tipo o formato..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>

          <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50 p-2">
            {tiposDisponibles.map((tipo) => {
              const activo = filtroTipo === tipo;
              const total = tipo === "TODOS" ? reportes.length : reportes.filter((reporte) => reporte.tipo === tipo).length;
              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setFiltroTipo(tipo)}
                  className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${
                    activo ? "bg-white text-slate-900" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tipo} <span className="ml-1 opacity-70">{total}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
        <div>
          <h3 className="font-['Sora'] text-lg font-semibold text-slate-900">Biblioteca de reportes</h3>
          <p className="text-sm text-slate-500">{reportesFiltrados.length} resultado{reportesFiltrados.length === 1 ? "" : "s"} de {reportes.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setGenerarOpen(true)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            Generar reporte
          </button>
          <button onClick={() => void cargar()} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            Actualizar
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      {cargando ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-panel">Cargando reportes...</div>
      ) : reportes.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-panel">No hay reportes generados aún.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reportesFiltrados.map((reporte) => (
            <article key={reporte.id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-panel transition duration-200 hover:-translate-y-1 hover:shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Reporte</p>
                  <h3 className="mt-1 font-['Sora'] text-lg font-semibold text-slate-900">{reporte.tipo}</h3>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${reporte.formato === 'JSON' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {reporte.formato}
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-500">Generado: {new Date(reporte.fechaGeneracion).toLocaleDateString('es-CO')}</p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <button onClick={() => void verReporte(reporte.id)} className="text-sm font-semibold text-blue-600 transition hover:text-blue-700">
                  Ver detalle
                </button>
                <button onClick={() => descargar(reporte)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900">
                  <DownloadCloud className="h-4 w-4" />
                  Descargar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalVerOpen && detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Vista previa</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{detalle.tipo} · {detalle.formato}</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                #{detalle.id}
              </span>
            </div>
            <div className="mt-4 max-h-[60vh] overflow-auto rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
              <pre className="whitespace-pre-wrap">{detalle.contenido ? JSON.stringify(JSON.parse(detalle.contenido), null, 2) : '— Sin contenido —'}</pre>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setModalVerOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {generarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900">Generar nuevo reporte</h3>
            <div className="mt-4 grid gap-3">
              <label className="text-sm">Tipo</label>
              <select value={tipoNuevo} onChange={(e) => setTipoNuevo(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <option value="COMBUSTIBLE">Consumo Combustible</option>
                <option value="RUTAS_RENTABLES">Rutas rentables</option>
                <option value="CUMPLIMIENTO_ENTREGAS">Cumplimiento entregas</option>
              </select>
              {!advancedJson ? (
                <>
                  <label className="text-sm">Placa</label>
                  <input
                    list="placas-list"
                    value={placaInput}
                    onChange={(e) => setPlacaInput(e.target.value)}
                    placeholder="ABC123"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                  <datalist id="placas-list">
                    {vehiculosList.map((v) => (
                      <option key={v.id} value={v.placa} />
                    ))}
                  </datalist>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-500">Usa la placa del vehículo para generar el reporte.</p>
                    <label className="text-xs text-slate-500 flex items-center gap-2">
                      <input type="checkbox" checked={advancedJson} onChange={(e) => setAdvancedJson(e.target.checked)} />
                      JSON avanzado
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <label className="text-sm">Parámetros (JSON avanzado)</label>
                  <textarea value={paramsText} onChange={(e) => setParamsText(e.target.value)} className="h-24 rounded-xl border border-slate-300 p-2 text-sm" placeholder='{"vehiculoId": 123, "otro": "valor"}' />
                  <div className="mt-2">
                    <label className="text-xs text-slate-500 flex items-center gap-2">
                      <input type="checkbox" checked={advancedJson} onChange={(e) => setAdvancedJson(e.target.checked)} />
                      Volver a modo placa
                    </label>
                  </div>
                </>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setGenerarOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">Cancelar</button>
              <button type="button" onClick={() => void crearReporte()} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Generar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  titulo,
  valor,
  icono: Icono,
  tono
}: {
  titulo: string;
  valor: string | number;
  icono: typeof FileText;
  tono: string;
}) {
  const bgClass = tono === "bg-white/10" ? "bg-slate-50" : tono;
  return (
    <div className={`rounded-2xl border border-slate-200 ${bgClass} p-3`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{titulo}</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{valor}</p>
        </div>
        <Icono size={18} className="text-slate-700" />
      </div>
    </div>
  );
}
