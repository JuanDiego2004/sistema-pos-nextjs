// hooks/useConsultarRuc.ts
import { useState } from "react";

interface ConsultaRucResponse {
  ruc: string;
  razonSocial: string;
  tipoContribuyente: string;
  estado: string;
  condicion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccionFiscal: string;
  ubigeo: string;
  nombreComercial: string;
  telefono: string;
  email: string;
  paginaWeb: string;
  representanteLegal: string;
  dniRepresentante: string;
  logoUrl: string;
}


interface ApiResponse {
  status: number;
  success: boolean;
  message: string;
  data: ConsultaRucResponse;
}


export default function usarConsultaRuc() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ConsultaRucResponse | null>(null);

  const consultarRuc = async (ruc: string): Promise<ConsultaRucResponse | null> => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch(`/api/consultaruc?ruc=${ruc}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al consultar el RUC");
      }
  
      const result: ApiResponse = await response.json();
      setData(result.data); // Guarda en el estado
      return result.data; // Devuelve los datos para usarlos directamente
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  

  return { consultarRuc, loading, error, data };
}
