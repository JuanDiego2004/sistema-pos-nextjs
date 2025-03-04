import { useState, useEffect } from "react";

interface Cliente {
  id: string;
  nombre: string;
  numeroDocumento: string;
}

interface UseClientesResult {
  clientes: Cliente[];
  isLoading: boolean;
  error: string | null;
}

// Tiempo de expiración del caché en milisegundos (5 minutos)
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000;

export function usarClientes(): UseClientesResult {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener clientes desde el caché o la API
  useEffect(() => {
    const fetchClientes = async () => {
      setIsLoading(true);
      setError(null);

      // Intentar obtener desde el caché
      const cached = localStorage.getItem("clientesCache");
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRATION_TIME) {
          setClientes(data);
          setIsLoading(false);
          return;
        }
      }

      // Si no hay caché válido, consultar la API
      try {
        const res = await fetch("/api/clientes?filtro="); // Sin filtro para obtener todos
        if (!res.ok) {
          throw new Error("Error al obtener clientes");
        }
        const { data } = await res.json();
        setClientes(data);
        // Guardar en caché
        localStorage.setItem(
          "clientesCache",
          JSON.stringify({ data, timestamp: Date.now() })
        );
      } catch (err) {
        console.error("Error al obtener clientes:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        setClientes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientes();
  }, []); // Solo se ejecuta al montar el componente

  return {
    clientes,
    isLoading,
    error,
  };
}