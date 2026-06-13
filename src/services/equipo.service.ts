import { api } from "./api";

export interface Estudiante {
  id: number;
  nombre: string;
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
 * Crea un estudiante nuevo. El backend genera y devuelve un PIN único de 6
 * caracteres que el estudiante debe usar para unirse a un equipo.
 */
export async function crearEstudiante(nombre: string): Promise<Estudiante> {
  const resp = await api.post("/estudiantes", { nombre });
  return resp.data.data as Estudiante;
}

/**
 * Crea un equipo nuevo (vacío).
 */
export async function crearEquipo(name: string): Promise<Equipo> {
  const resp = await api.post("/teams", { name });
  // Este endpoint responde el objeto "pelado", sin envoltorio { success, data }
  return resp.data as Equipo;
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
