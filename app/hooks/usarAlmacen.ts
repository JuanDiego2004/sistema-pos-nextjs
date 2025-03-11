import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { Almacen, CrearAlmacen } from "../utils/types";

// Función fetcher optimizada con timestamp para localStorage
const fetcher = async (url: string) => {
  const storedData = localStorage.getItem("almacenes");
  const storedTimestamp = localStorage.getItem("almacenes_timestamp");
  const cacheExpiration = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

  // Verificar si hay datos válidos en localStorage
  if (storedData && storedTimestamp) {
    const isCacheValid = Date.now() - Number(storedTimestamp) < cacheExpiration;
    if (isCacheValid) {
      return JSON.parse(storedData);
    }
  }

  // Si no hay datos válidos, hacer fetch a la API
  const response = await fetch(url);
  if (!response.ok) throw new Error("Error al cargar los almacenes");
  const data = await response.json();
  
  // Guardar en localStorage con timestamp
  localStorage.setItem("almacenes", JSON.stringify(data));
  localStorage.setItem("almacenes_timestamp", Date.now().toString());
  return data;
};

// Función para limpiar el cache
const clearCache = () => {
  localStorage.removeItem("almacenes");
  localStorage.removeItem("almacenes_timestamp");
};

export function usarAlmacen(filtro?: string) {
  const queryParams = filtro ? `?filtro=${encodeURIComponent(filtro)}` : "";
  const swrKey = `/api/almacenes${queryParams}`;

  const { data: almacenes = [], error, isLoading, mutate: swrMutate } = useSWR<Almacen[]>(
    swrKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 0,
      dedupingInterval: 5000, // Evita múltiples requests en 5 segundos
      fallbackData: [], // Datos iniciales vacíos mientras carga
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Reintentar solo 3 veces en caso de error
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    }
  );

  // Función para actualizar cache y localStorage
  const actualizarCache = async () => {
    try {
      const response = await fetch(swrKey);
      if (!response.ok) throw new Error("Error al actualizar los datos");
      const nuevosDatos = await response.json();
      
      // Actualizar localStorage
      localStorage.setItem("almacenes", JSON.stringify(nuevosDatos));
      localStorage.setItem("almacenes_timestamp", Date.now().toString());
      
      // Actualizar cache de SWR
      swrMutate(nuevosDatos, false);
      return nuevosDatos;
    } catch (error) {
      console.error("Error actualizando cache:", error);
      throw error;
    }
  };

  // Registrar un nuevo almacén
  const registrarAlmacen = async (nuevoAlmacen: CrearAlmacen) => {
    try {
      const response = await fetch("/api/almacenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoAlmacen),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al registrar el almacén");
      }

      const nuevoAlmacenData = await response.json();
      toast.success("Almacén registrado correctamente");
      
      // Optimistic update
      swrMutate([...almacenes, nuevoAlmacenData], {
        optimisticData: [...almacenes, nuevoAlmacenData],
        rollbackOnError: true,
        populateCache: true,
        revalidate: true,
      });
      
      await actualizarCache();
    } catch (err) {
      console.error("Error registrando almacén:", err);
      toast.error(`Error: ${(err as Error).message}`);
    }
  };

  // Editar un almacén
  const editarAlmacen = async (id: string, updatedData: Partial<Almacen>) => {
    if (!updatedData.nombre?.trim()) {
      toast.error("El nombre del almacén es obligatorio");
      return;
    }

    try {
      const response = await fetch(`/api/almacenes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el almacén");
      }

      const updatedAlmacen = await response.json();
      toast.success("Almacén actualizado correctamente");

      // Optimistic update
      const updatedAlmacenes = almacenes.map(almacen =>
        almacen.id === id ? { ...almacen, ...updatedAlmacen } : almacen
      );
      
      swrMutate(updatedAlmacenes, {
        optimisticData: updatedAlmacenes,
        rollbackOnError: true,
        populateCache: true,
        revalidate: true,
      });

      await actualizarCache();
    } catch (err) {
      console.error("Error actualizando almacén:", err);
      toast.error(`Error: ${(err as Error).message}`);
    }
  };

  // Eliminar un almacén
  const eliminarAlmacen = async (id: string) => {
    try {
      const response = await fetch(`/api/almacenes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el almacén");
      }

      toast.success("Almacén eliminado correctamente");

      // Optimistic update
      const updatedAlmacenes = almacenes.filter(almacen => almacen.id !== id);
      swrMutate(updatedAlmacenes, {
        optimisticData: updatedAlmacenes,
        rollbackOnError: true,
        populateCache: true,
        revalidate: true,
      });

      await actualizarCache();
    } catch (err) {
      console.error("Error eliminando almacén:", err);
      toast.error(`Error: ${(err as Error).message}`);
    }
  };

  // Forzar refresh completo
  const refreshAlmacenes = async () => {
    clearCache();
    await actualizarCache();
  };

  return {
    almacenes,
    loading: isLoading,
    error,
    registrarAlmacen,
    editarAlmacen,
    eliminarAlmacen,
    refreshAlmacenes,
  };
}