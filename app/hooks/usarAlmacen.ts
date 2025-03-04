
import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { Almacen, CrearAlmacen } from "../utils/types";

// Función para obtener datos con localStorage
const fetcher = async (url: string) => {
  const almacenLocal = localStorage.getItem("almacenes");
  if (almacenLocal) return JSON.parse(almacenLocal); // Cargar desde localStorage si hay datos
  const response = await fetch(url);
  if (!response.ok) throw new Error("Error al cargar los almacenes");
  const data = await response.json();
  localStorage.setItem("almacenes", JSON.stringify(data)); // Guardar en localStorage
  return data;
};

export function usarAlmacen(filtro?: string) {
  const queryParams = filtro ? `?filtro=${encodeURIComponent(filtro)}` : "";
  const { data: almacenes = [], error, isLoading } = useSWR(
    `/api/almacenes${queryParams}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );

  // Función para actualizar cache y localStorage después de un cambio
  const actualizarCache = async () => {
    const response = await fetch(`/api/almacenes${queryParams}`);
    if (!response.ok) throw new Error("Error al actualizar los datos");
    const nuevosDatos = await response.json();
    localStorage.setItem("almacenes", JSON.stringify(nuevosDatos)); // Actualizar localStorage
    mutate(`/api/almacenes${queryParams}`, nuevosDatos, false); // Actualizar cache de SWR
  };

  // Función para registrar un nuevo almacén
  // usarAlmacen.ts
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
    toast.success("Almacén registrado correctamente");
    await actualizarCache();
  } catch (err) {
    console.error("Error registrando almacén:", err);
    toast.error(`Error: ${(err as Error).message}`);
  }
};

  // Función para editar un almacén
  const editarAlmacen = async (id: string, updatedData: Partial<Almacen>) => {
    if (!updatedData.nombre || updatedData.nombre.trim() === "") {
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
      toast.success("Almacén actualizado correctamente");
      await actualizarCache();
    } catch (err) {
      console.error("Error actualizando almacén:", err);
      toast.error(`Error: ${(err as Error).message}`);
    }
  };

  // Función para eliminar un almacén
  const eliminarAlmacen = async (id: string) => {
    try {
      const response = await fetch(`/api/almacenes/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar el almacén");
      toast.success("Almacén eliminado correctamente");
      await actualizarCache();
    } catch (err) {
      console.error("Error eliminando almacén:", err);
      toast.error(`Error: ${(err as Error).message}`);
    }
  };

  return {
    almacenes,
    loading: isLoading,
    error,
    registrarAlmacen,
    editarAlmacen,
    eliminarAlmacen,
  };
}