import useSWR from "swr";

async function fetcher(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error al cargar los datos: ${response.statusText}`);
  }

  const data = await response.json();
  localStorage.setItem("proveedores", JSON.stringify(data)); // Guardar en localStorage
  return data;
}

export function usarProveedores() {
  // Intentar obtener datos desde localStorage antes de hacer la consulta
  const datosLocales = typeof window !== "undefined" ? localStorage.getItem("proveedores") : null;
  const proveedoresIniciales = datosLocales ? JSON.parse(datosLocales) : [];

  const { data, error, isLoading, mutate } = useSWR("/api/proveedores", fetcher, {
    fallbackData: proveedoresIniciales, // Usar datos locales si existen
    revalidateOnFocus: false, 
    revalidateOnReconnect: false, 
    refreshInterval: 0, 
  });

  // Función para actualizar los proveedores después de un PUT
  const actualizarProveedores = async (proveedorActualizado: any) => {
    try {
      const response = await fetch(`/api/proveedores/${proveedorActualizado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proveedorActualizado),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el proveedor");
      }

      const nuevosProveedores = data.map((prov: any) =>
        prov.id === proveedorActualizado.id ? proveedorActualizado : prov
      );

      localStorage.setItem("proveedores", JSON.stringify(nuevosProveedores)); // Actualizar localStorage
      mutate(nuevosProveedores, false); // Actualizar el estado sin revalidar la API

    } catch (error) {
      console.error("Error actualizando proveedor:", error);
    }
  };

  return {
    proveedores: data || [], 
    isLoading,
    error,
    mutate,
    actualizarProveedores, 
  };
}
