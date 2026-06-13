import { api } from "./api";

export interface Estudiante {
  id: number;
  nombre: string | null;
  pin: string;
  equipoId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Equipo {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Genera un PIN vacío para un estudiante (Solo accesible por Administradores).
 */
export async function generarPin(): Promise<string> {
  const resp = await api.post("/estudiantes/pin");
  // La respuesta es: { success: true, message, data: { pin } }
  return resp.data.data.pin;
}

/**
 * Registra un estudiante consumiendo un PIN pre-generado.
 */
export async function registrarEstudiante(nombre: string, pin: string): Promise<Estudiante> {
  const resp = await api.post("/estudiantes", { nombre, pin });
  // La respuesta es: { success: true, message, data: estudiante }
  return resp.data.data as Estudiante;
}

/**
 * Lista todos los estudiantes (tanto pendientes como registrados).
 */
export async function listarEstudiantes(): Promise<Estudiante[]> {
  const resp = await api.get("/estudiantes");
  // La respuesta es: { success: true, data: [estudiantes] }
  return resp.data.data as Estudiante[];
}

/**
 * Crea un equipo nuevo (vacío).
 */
export async function crearEquipo(name: string): Promise<Equipo> {
  const resp = await api.post("/teams", { name });
  // Este endpoint responde el objeto del equipo creado
  return resp.data as Equipo;
}

/**
 * Lista todos los equipos creados en la base de datos.
 */
export async function listarEquipos(): Promise<Equipo[]> {
  const resp = await api.get("/teams");
  // Este endpoint responde directamente un arreglo de equipos
  return resp.data as Equipo[];
}

/**
 * Lista los estudiantes que pertenecen a un equipo.
 */
export async function listarEstudiantesEquipo(equipoId: number): Promise<Estudiante[]> {
  const resp = await api.get(`/teams/${equipoId}/students`);
  // Este endpoint responde directamente un arreglo
  return resp.data as Estudiante[];
}

/**
 * Une a un estudiante existente a un equipo usando su PIN.
 */
export async function unirEstudianteAEquipo(equipoId: number, pin: string): Promise<Estudiante> {
  const resp = await api.post(`/teams/${equipoId}/students`, { pin });
  return resp.data.estudiante as Estudiante;
}
