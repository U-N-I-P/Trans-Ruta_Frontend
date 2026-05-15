import { api } from "./api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ManifiestoResponse {
  manifiesto: {
    numeroOrden: string;
    conductor: {
      nombre: string;
      licencia: string;
      categoriaLicencia: string;
    };
    vehiculo: {
      placa: string;
      tipo: string;
      capacidadCarga: number;
    };
    cliente: {
      nombre: string;
      documento: string;
    };
    carga: {
      origen: string;
      destino: string;
      descripcion: string;
      pesoKg: number;
      limiteLegalKg: number;
      excedePesoLegal: boolean;
    };
    fechaSalida: string;
    fechaEntregaEstimada: string;
    estado: string;
    generadoEn: string;
  };
}

export async function generarManifiesto(ordenId: number) {
  const response = await api.get<ApiResponse<ManifiestoResponse>>(`/manifiestos/${ordenId}`);
  return response.data.data;
}
