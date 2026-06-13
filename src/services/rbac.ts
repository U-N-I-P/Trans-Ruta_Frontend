import { VistaPrincipal } from "../components/layout/Sidebar";

const AUTH_USER_KEY = "trans_ruta_usuario";

export type RecursoPanel =
  | "vehiculos"
  | "conductores"
  | "clientes"
  | "ordenes-despacho"
  | "notificaciones"
  | "viaticos"
  | "repuestos"
  | "solicitudes-compra";

const RECURSOS_POR_ROL: Record<string, RecursoPanel[]> = {
  // Alineado con roles autorizados en backend (roles.middleware + rutas):
  // repuestos y solicitudes-compra: ADMINISTRADOR, JEFE_TALLER, GESTOR_INVENTARIO
  // ordenes-despacho: ADMINISTRADOR, DESPACHADOR, CONDUCTOR, AUDITOR (no CLIENTE)
  // notificaciones: ADMINISTRADOR, CLIENTE
  GESTOR_INVENTARIO: ["repuestos", "solicitudes-compra"],
  JEFE_TALLER: ["vehiculos", "repuestos", "solicitudes-compra"],
  CONDUCTOR: ["ordenes-despacho", "viaticos"],
  CLIENTE: ["clientes", "notificaciones"],
  AUDITOR: ["ordenes-despacho"],
  DESPACHADOR: [
    "vehiculos",
    "conductores",
    "clientes",
    "ordenes-despacho",
    "viaticos"
  ],
  ADMINISTRADOR: [
    "vehiculos",
    "conductores",
    "clientes",
    "ordenes-despacho",
    "notificaciones",
    "viaticos",
    "repuestos",
    "solicitudes-compra"
  ]
};

const VISTAS_POR_ROL: Partial<Record<string, VistaPrincipal[]>> = {
  GESTOR_INVENTARIO: ["inventario", "compras", "flota"],
  JEFE_TALLER: ["inventario", "compras", "vehiculos", "mantenimiento", "documentos", "combustible", "flota"],
  CONDUCTOR: ["ordenes", "viaticos", "gps", "entregas", "incidentes"],
  CLIENTE: ["clientes", "ordenes"],
  AUDITOR: ["auditoria", "reportes", "ordenes", "incidentes", "manifiestos"]
};

const VISTA_INICIAL_POR_ROL: Partial<Record<string, VistaPrincipal>> = {
  GESTOR_INVENTARIO: "inventario",
  JEFE_TALLER: "inventario",
  CONDUCTOR: "ordenes",
  CLIENTE: "clientes",
  AUDITOR: "auditoria"
};

export function obtenerRolUsuario(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { rol?: string };
    return parsed.rol ?? null;
  } catch {
    return null;
  }
}

export function recursosPanelPorRol(rol: string | null): RecursoPanel[] {
  if (!rol) {
    return RECURSOS_POR_ROL.ADMINISTRADOR;
  }
  return RECURSOS_POR_ROL[rol] ?? RECURSOS_POR_ROL.ADMINISTRADOR;
}

export function vistaInicialPorRol(rol: string | null): VistaPrincipal {
  if (!rol) return "panel";
  return VISTA_INICIAL_POR_ROL[rol] ?? "panel";
}

export function vistaPermitidaParaRol(rol: string | null, vista: VistaPrincipal): VistaPrincipal {
  const permitidas = rol ? VISTAS_POR_ROL[rol] : undefined;
  if (!permitidas || permitidas.includes(vista)) {
    return vista;
  }
  return vistaInicialPorRol(rol);
}

export function obtenerVistasPermitidas(rol: string | null): VistaPrincipal[] {
  if (!rol) return VISTAS_POR_ROL_COMPLETO.ADMINISTRADOR;
  return VISTAS_POR_ROL[rol] ?? VISTAS_POR_ROL_COMPLETO.ADMINISTRADOR;
}

const VISTAS_POR_ROL_COMPLETO: Record<string, VistaPrincipal[]> = {
  ADMINISTRADOR: [
    "panel", "gps", "asignacion", "operativo", "entregas", "incidentes", "manifiestos",
    "flota", "vehiculos", "conductores", "documentos",
    "mantenimiento", "inventario",
    "viaticos", "combustible", "compras",
    "reportes", "clientes", "evaluacion", "auditoria"
  ],
  DESPACHADOR: [
    "panel", "gps", "asignacion", "operativo", "entregas", "incidentes", "manifiestos",
    "flota", "vehiculos", "conductores", "documentos",
    "reportes", "clientes", "evaluacion"
  ]
};
