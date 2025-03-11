import { useState, useEffect, useCallback } from "react";
import { InfoEmpresa } from "../utils/types";

interface UseEmpresaInfoProps {
  refreshKey?: number;
  cacheExpirationHours?: number; // Nueva opción para controlar expiración
}

export const usarEmpresaInfo = ({ 
  refreshKey, 
  cacheExpirationHours = 24 
}: UseEmpresaInfoProps = {}) => {
  const [empresaInfo, setEmpresaInfo] = useState<InfoEmpresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para verificar si el cache es válido
  const isCacheValid = useCallback(() => {
    const timestamp = localStorage.getItem("empresa_timestamp");
    if (!timestamp) return false;
    
    const cacheExpirationMs = cacheExpirationHours * 60 * 60 * 1000;
    return Date.now() - Number(timestamp) < cacheExpirationMs;
  }, [cacheExpirationHours]);

  // Función para cargar datos optimizada
  const cargarEmpresa = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);

      // 1. Verificar datos en localStorage
      const empresaLocal = localStorage.getItem("empresa");
      if (empresaLocal && isCacheValid() && !forceRefresh) {
        const parsedEmpresa = JSON.parse(empresaLocal);
        setEmpresaInfo(parsedEmpresa);
        setLoading(false);
        return;
      }

      // 2. Si no hay datos válidos o se fuerza refresh, fetch a la API
      const response = await fetch("/api/empresa", {
        cache: 'no-store', // Evitar cache del browser
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: Error al obtener la información de la empresa`);
      }

      const data: InfoEmpresa = await response.json();
      setEmpresaInfo(data);
      
      // Guardar en localStorage con timestamp
      localStorage.setItem("empresa", JSON.stringify(data));
      localStorage.setItem("empresa_timestamp", Date.now().toString());
      
      setError(null);
    } catch (err) {
      console.error("Error al cargar empresa:", err);
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      
      // Fallback a datos previos si existen
      const fallbackData = localStorage.getItem("empresa");
      if (fallbackData && !forceRefresh) {
        setEmpresaInfo(JSON.parse(fallbackData));
      }
    } finally {
      setLoading(false);
    }
  }, [isCacheValid]);

  // Función para limpiar el cache
  const clearCache = useCallback(() => {
    localStorage.removeItem("empresa");
    localStorage.removeItem("empresa_timestamp");
    setEmpresaInfo(null);
  }, []);

  // Efecto para la carga inicial y refresh
  useEffect(() => {
    // Cargar datos en la primera ejecución o cuando cambie refreshKey
    cargarEmpresa(refreshKey !== undefined);
  }, [refreshKey, cargarEmpresa]);

  // Función para forzar refresh
  const refreshEmpresa = useCallback(() => {
    clearCache();
    return cargarEmpresa(true);
  }, [cargarEmpresa, clearCache]);

  return {
    empresaInfo,
    loading,
    error,
    cargarEmpresa,
    refreshEmpresa,
    clearCache,
  };
};