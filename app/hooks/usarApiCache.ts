import { useState, useEffect } from 'react';

interface CacheConfig {
  expirationTime?: number; // tiempo en milisegundos
  key: string;
}

export function usarApiCache<T>(url: string, config: CacheConfig) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar si hay datos en localStorage
        const cachedData = localStorage.getItem(config.key);
        const cachedTimestamp = localStorage.getItem(`${config.key}_timestamp`);

        // Verificar si el caché es válido
        if (cachedData && cachedTimestamp) {
          const isExpired = config.expirationTime && 
            Date.now() - Number(cachedTimestamp) > config.expirationTime;

          if (!isExpired) {
            setData(JSON.parse(cachedData));
            setLoading(false);
            return;
          }
        }

        // Si no hay caché o está expirado, hacer la llamada a la API
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Error en la llamada a la API');
        }

        const result = await response.json();
        
        // Guardar en localStorage
        localStorage.setItem(config.key, JSON.stringify(result));
        localStorage.setItem(`${config.key}_timestamp`, Date.now().toString());
        
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, config.key, config.expirationTime]);

  // Función helper para filtrar datos
  const filterData = (filterFn: (item: T) => boolean) => {
    if (!data) return null;
    return Array.isArray(data) ? data.filter(filterFn) : null;
  };

  return { data, loading, error, filterData };
}