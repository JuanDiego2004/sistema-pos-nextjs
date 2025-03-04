import { useState, useEffect } from "react";
import { InfoEmpresa } from "../utils/types";

interface UseEmpresaInfoProps {
  refreshKey?: number;
}

export const usarEmpresaInfo = ({ refreshKey }: UseEmpresaInfoProps = {}) => {
  const [empresaInfo, setEmpresaInfo] = useState<InfoEmpresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarEmpresa = async () => {
    try {
      setLoading(true);

      // ✅ 1. Intentar obtener datos desde localStorage primero
      const empresaLocal = localStorage.getItem("empresa");
      if (empresaLocal) {
        const parsedEmpresa = JSON.parse(empresaLocal);
        setEmpresaInfo(parsedEmpresa);
        setLoading(false);
        return; // ⚠️ Evita llamada innecesaria a la API si ya tenemos datos
      }

      console.log("datos local", localStorage.getItem("empresa"));


      // ✅ 2. Si no hay datos en localStorage, hacer la solicitud a la API
      const response = await fetch("/api/empresa");
      if (!response.ok) throw new Error("Error al obtener la información de la empresa");

      const data: InfoEmpresa = await response.json();
      setEmpresaInfo(data);
      localStorage.setItem("empresa", JSON.stringify(data)); // Guardar en cache
      setError(null);
    } catch (err) {
      console.error("Error al cargar empresa:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ⚠️ Solo cargar empresa si NO hay datos en estado o si se pide una actualización con refreshKey
    if (!empresaInfo || refreshKey !== undefined) {
      cargarEmpresa();
    }
  }, [refreshKey]); // Se ejecuta solo cuando cambia refreshKey

  return { empresaInfo, loading, error, cargarEmpresa };
};
