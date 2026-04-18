import {
  Conductor,
  NotificacionIncidente,
  OrdenDespacho,
  Repuesto,
  SolicitudCompra,
  Vehiculo
} from "../types/domain";

export const vehiculosMock: Vehiculo[] = [
  { id: "veh-001", placa: "TRA-104", tipo: "Camion", capacidadKg: 12000, estado: "Disponible" },
  { id: "veh-002", placa: "TRA-239", tipo: "Turbo", capacidadKg: 7000, estado: "En Ruta" },
  { id: "veh-003", placa: "TRA-311", tipo: "Furgon", capacidadKg: 4500, estado: "Mantenimiento" },
  { id: "veh-004", placa: "TRA-427", tipo: "Tractomula", capacidadKg: 28000, estado: "En Ruta" },
  { id: "veh-005", placa: "TRA-558", tipo: "Van", capacidadKg: 1800, estado: "Disponible" },
  { id: "veh-006", placa: "TRA-612", tipo: "Turbo", capacidadKg: 6800, estado: "Disponible" },
  { id: "veh-007", placa: "TRA-719", tipo: "Camion", capacidadKg: 11000, estado: "Mantenimiento" },
  { id: "veh-008", placa: "TRA-804", tipo: "Furgon", capacidadKg: 5000, estado: "Disponible" },
  { id: "veh-009", placa: "TRA-915", tipo: "Camion", capacidadKg: 13000, estado: "En Ruta" },
  { id: "veh-010", placa: "TRA-037", tipo: "Tractomula", capacidadKg: 30000, estado: "Disponible" },
  { id: "veh-011", placa: "TRA-126", tipo: "Van", capacidadKg: 2100, estado: "En Ruta" },
  { id: "veh-012", placa: "TRA-209", tipo: "Turbo", capacidadKg: 7200, estado: "Disponible" }
];

export const conductoresMock: Conductor[] = [
  { id: "con-001", nombre: "Carlos Mendoza", licencia: "C3-4459", telefono: "3105551001", disponible: true },
  { id: "con-002", nombre: "Andrea Rojas", licencia: "C2-3098", telefono: "3105551002", disponible: false },
  { id: "con-003", nombre: "Luis Restrepo", licencia: "C3-8831", telefono: "3105551003", disponible: true },
  { id: "con-004", nombre: "Natalia Salas", licencia: "C2-1590", telefono: "3105551004", disponible: true },
  { id: "con-005", nombre: "Mateo Cardenas", licencia: "C3-1195", telefono: "3105551005", disponible: false },
  { id: "con-006", nombre: "Daniela Quintero", licencia: "C1-7288", telefono: "3105551006", disponible: true },
  { id: "con-007", nombre: "Javier Londoño", licencia: "C2-6107", telefono: "3105551007", disponible: true },
  { id: "con-008", nombre: "Paola Bernal", licencia: "C3-3248", telefono: "3105551008", disponible: false },
  { id: "con-009", nombre: "Ricardo Lozano", licencia: "C2-9172", telefono: "3105551009", disponible: true },
  { id: "con-010", nombre: "Esteban Ocampo", licencia: "C1-5070", telefono: "3105551010", disponible: true },
  { id: "con-011", nombre: "Valentina Muñoz", licencia: "C3-7623", telefono: "3105551011", disponible: false },
  { id: "con-012", nombre: "Sebastian Perez", licencia: "C2-1187", telefono: "3105551012", disponible: true }
];

export const ordenesDespachoMock: OrdenDespacho[] = [
  {
    id: "ord-001",
    codigo: "OD-2026-0001",
    vehiculoId: "veh-002",
    conductorId: "con-002",
    origen: "Bogota",
    destino: "Medellin",
    pesoCargaKg: 6500,
    estado: "En Ruta",
    fechaProgramada: "2026-04-18T08:00:00"
  },
  {
    id: "ord-002",
    codigo: "OD-2026-0002",
    vehiculoId: "veh-004",
    conductorId: "con-005",
    origen: "Cali",
    destino: "Barranquilla",
    pesoCargaKg: 25000,
    estado: "Despachado",
    fechaProgramada: "2026-04-18T09:15:00"
  },
  {
    id: "ord-003",
    codigo: "OD-2026-0003",
    vehiculoId: "veh-009",
    conductorId: "con-008",
    origen: "Bucaramanga",
    destino: "Bogota",
    pesoCargaKg: 9700,
    estado: "Incidente",
    fechaProgramada: "2026-04-17T14:20:00"
  },
  {
    id: "ord-004",
    codigo: "OD-2026-0004",
    vehiculoId: "veh-011",
    conductorId: "con-011",
    origen: "Pereira",
    destino: "Cucuta",
    pesoCargaKg: 1800,
    estado: "En Ruta",
    fechaProgramada: "2026-04-18T10:00:00"
  },
  {
    id: "ord-005",
    codigo: "OD-2026-0005",
    vehiculoId: "veh-001",
    conductorId: "con-001",
    origen: "Manizales",
    destino: "Cartagena",
    pesoCargaKg: 11000,
    estado: "Despachado",
    fechaProgramada: "2026-04-18T11:40:00"
  },
  {
    id: "ord-006",
    codigo: "OD-2026-0006",
    vehiculoId: "veh-006",
    conductorId: "con-003",
    origen: "Bogota",
    destino: "Villavicencio",
    pesoCargaKg: 5100,
    estado: "Entregado",
    fechaProgramada: "2026-04-16T06:20:00"
  },
  {
    id: "ord-007",
    codigo: "OD-2026-0007",
    vehiculoId: "veh-010",
    conductorId: "con-007",
    origen: "Tunja",
    destino: "Santa Marta",
    pesoCargaKg: 28000,
    estado: "En Ruta",
    fechaProgramada: "2026-04-18T07:50:00"
  },
  {
    id: "ord-008",
    codigo: "OD-2026-0008",
    vehiculoId: "veh-008",
    conductorId: "con-010",
    origen: "Bogota",
    destino: "Neiva",
    pesoCargaKg: 4200,
    estado: "Despachado",
    fechaProgramada: "2026-04-18T12:00:00"
  },
  {
    id: "ord-009",
    codigo: "OD-2026-0009",
    vehiculoId: "veh-012",
    conductorId: "con-012",
    origen: "Medellin",
    destino: "Monteria",
    pesoCargaKg: 6900,
    estado: "Entregado",
    fechaProgramada: "2026-04-14T09:00:00"
  },
  {
    id: "ord-010",
    codigo: "OD-2026-0010",
    vehiculoId: "veh-005",
    conductorId: "con-006",
    origen: "Bogota",
    destino: "Zipaquira",
    pesoCargaKg: 1200,
    estado: "En Ruta",
    fechaProgramada: "2026-04-18T13:10:00"
  },
  {
    id: "ord-011",
    codigo: "OD-2026-0011",
    vehiculoId: "veh-001",
    conductorId: "con-004",
    origen: "Cali",
    destino: "Pasto",
    pesoCargaKg: 7300,
    estado: "Entregado",
    fechaProgramada: "2026-04-15T11:00:00"
  },
  {
    id: "ord-012",
    codigo: "OD-2026-0012",
    vehiculoId: "veh-006",
    conductorId: "con-009",
    origen: "Ibague",
    destino: "Bogota",
    pesoCargaKg: 3400,
    estado: "Incidente",
    fechaProgramada: "2026-04-17T16:45:00"
  }
];

export const notificacionesIncidentesMock: NotificacionIncidente[] = [
  {
    id: "not-001",
    titulo: "Retraso por cierre vial",
    descripcion: "OD-2026-0003 reporta demoras por cierre en Ruta del Sol.",
    severidad: "Alta",
    fecha: "2026-04-18T08:44:00"
  },
  {
    id: "not-002",
    titulo: "Temperatura no conforme",
    descripcion: "Unidad refrigerada TRA-239 fuera de rango por 12 min.",
    severidad: "Media",
    fecha: "2026-04-18T08:10:00"
  },
  {
    id: "not-003",
    titulo: "Parada no programada",
    descripcion: "Conductor en orden OD-2026-0010 detuvo unidad fuera de geocerca.",
    severidad: "Media",
    fecha: "2026-04-18T07:58:00"
  },
  {
    id: "not-004",
    titulo: "Incidente mecanico",
    descripcion: "OD-2026-0012 solicita asistencia por falla de frenos.",
    severidad: "Alta",
    fecha: "2026-04-17T16:52:00"
  },
  {
    id: "not-005",
    titulo: "Entrega con novedad",
    descripcion: "OD-2026-0009 entregada con diferencia de inventario.",
    severidad: "Baja",
    fecha: "2026-04-14T12:14:00"
  }
];

export const repuestosMock: Repuesto[] = [
  { id: "rep-001", nombre: "Pastillas de freno", stockActual: 18, stockMinimo: 20, ubicacion: "Bodega A1" },
  { id: "rep-002", nombre: "Filtro de aceite", stockActual: 42, stockMinimo: 25, ubicacion: "Bodega A2" },
  { id: "rep-003", nombre: "Llanta 22.5", stockActual: 9, stockMinimo: 10, ubicacion: "Bodega B3" },
  { id: "rep-004", nombre: "Bateria 150Ah", stockActual: 15, stockMinimo: 12, ubicacion: "Bodega C1" },
  { id: "rep-005", nombre: "Refrigerante", stockActual: 7, stockMinimo: 8, ubicacion: "Bodega A4" },
  { id: "rep-006", nombre: "Correa alternador", stockActual: 21, stockMinimo: 10, ubicacion: "Bodega C2" },
  { id: "rep-007", nombre: "Bombillo LED", stockActual: 30, stockMinimo: 15, ubicacion: "Bodega D1" },
  { id: "rep-008", nombre: "Amortiguador", stockActual: 4, stockMinimo: 6, ubicacion: "Bodega B1" }
];

export const solicitudesCompraMock: SolicitudCompra[] = [
  { id: "sc-001", repuesto: "Pastillas de freno", cantidad: 50, estado: "Pendiente" },
  { id: "sc-002", repuesto: "Llanta 22.5", cantidad: 20, estado: "Pendiente" },
  { id: "sc-003", repuesto: "Refrigerante", cantidad: 30, estado: "Pendiente" },
  { id: "sc-004", repuesto: "Filtro de aceite", cantidad: 60, estado: "Aprobada" }
];
