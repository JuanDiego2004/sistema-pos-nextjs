// usarEmpresaData.ts
"use client";

import { Almacen, InfoEmpresa, Sucursal } from "@/app/utils/types";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface UseEmpresaDataProps {
  refreshKey?: number;
  cacheExpirationHours?: number;
}

export const usarEmpresaData = ({
  refreshKey,
  cacheExpirationHours = 24,
}: UseEmpresaDataProps = {}) => {
  const [empresaInfo, setEmpresaInfo] = useState<InfoEmpresa | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isCacheValid = useCallback(
    (key: string) => {
      const timestamp = localStorage.getItem(`${key}_timestamp`);
      if (!timestamp) return false;
      const cacheExpirationMs = cacheExpirationHours * 60 * 60 * 1000;
      return Date.now() - Number(timestamp) < cacheExpirationMs;
    },
    [cacheExpirationHours]
  );

  const fetchSucursales = useCallback(async (empresaId: string) => {
    const response = await fetch(`/api/sucursales?empresaId=${empresaId}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Error al obtener sucursales");
    return response.json();
  }, []);

  const fetchAlmacenes = useCallback(async () => {
    const response = await fetch("/api/almacenes", { cache: "no-store" });
    if (!response.ok) throw new Error("Error al obtener almacenes");
    return response.json();
  }, []);

  const fetchAllData = useCallback(
    async (forceRefresh: boolean = false) => {
      setLoading(true);
      try {
        const empresaLocal = localStorage.getItem("empresa");
        if (empresaLocal && isCacheValid("empresa") && !forceRefresh) {
          setEmpresaInfo(JSON.parse(empresaLocal));
        } else {
          const empresaRes = await fetch("/api/empresa", { cache: "no-store" });
          if (!empresaRes.ok) throw new Error("Error al cargar empresa");
          const empresaData: InfoEmpresa = await empresaRes.json();
          setEmpresaInfo(empresaData);
          localStorage.setItem("empresa", JSON.stringify(empresaData));
          localStorage.setItem("empresa_timestamp", Date.now().toString());
        }

        const sucursalesLocal = localStorage.getItem("sucursales");
        const empresaId = empresaInfo?.id || JSON.parse(empresaLocal || "{}")?.id;
        if (sucursalesLocal && isCacheValid("sucursales") && !forceRefresh) {
          setSucursales(JSON.parse(sucursalesLocal));
        } else if (empresaId) {
          const sucursalesData = await fetchSucursales(empresaId);
          setSucursales(sucursalesData);
          localStorage.setItem("sucursales", JSON.stringify(sucursalesData));
          localStorage.setItem("sucursales_timestamp", Date.now().toString());
        }

        const almacenesLocal = localStorage.getItem("almacenes");
        if (almacenesLocal && isCacheValid("almacenes") && !forceRefresh) {
          setAlmacenes(JSON.parse(almacenesLocal));
        } else {
          const almacenesData = await fetchAlmacenes();
          setAlmacenes(almacenesData);
          localStorage.setItem("almacenes", JSON.stringify(almacenesData));
          localStorage.setItem("almacenes_timestamp", Date.now().toString());
        }

        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error desconocido";
        setError(errorMsg);
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    },
    [isCacheValid, empresaInfo?.id, fetchSucursales, fetchAlmacenes]
  );

  const actualizarEmpresa = useCallback(
    async (data: FormData | Partial<InfoEmpresa>, id?: string) => {
      if (!id) {
        throw new Error("Se requiere un ID de empresa para actualizar");
      }
      
      try {
        const url = `/api/empresa/${id}`;
        
        // Configurar la solicitud correctamente según el tipo de datos
        const options: RequestInit = {
          method: "PUT",
          body: data instanceof FormData ? data : JSON.stringify(data),
          headers: data instanceof FormData 
            ? {} 
            : { "Content-Type": "application/json" },
        };
        
        // Realizar la solicitud
        const response = await fetch(url, options);
        
        // Verificar errores HTTP
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
          throw new Error(errorData.error || `Error HTTP: ${response.status}`);
        }
        
        // Procesar la respuesta
        const result = await response.json();
        
        // Actualizar el estado local y el cache
        const updatedEmpresa = result.data;
        setEmpresaInfo(updatedEmpresa);
        localStorage.setItem("empresa", JSON.stringify(updatedEmpresa));
        localStorage.setItem("empresa_timestamp", Date.now().toString());
        
        return updatedEmpresa;
      } catch (err) {
        console.error("Error en actualizarEmpresa:", err);
        throw err; // Re-lanzar el error para manejarlo en el componente
      }
    },
    []
  );


  const editarAlmacen = useCallback(
    async (id: string, updatedData: Partial<Almacen>) => {
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
        if (!response.ok) throw new Error("Error al actualizar almacén");

        const updatedAlmacen = await response.json();
        setAlmacenes((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...updatedAlmacen } : a))
        );
        localStorage.setItem("almacenes", JSON.stringify(almacenes));
        toast.success("Almacén actualizado correctamente");
      } catch (err) {
        toast.error(`Error: ${(err as Error).message}`);
      }
    },
    [almacenes]
  );

  const eliminarAlmacen = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/almacenes/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Error al eliminar almacén");

        setAlmacenes((prev) => prev.filter((a) => a.id !== id));
        localStorage.setItem("almacenes", JSON.stringify(almacenes));
        toast.success("Almacén eliminado correctamente");
      } catch (err) {
        toast.error(`Error: ${(err as Error).message}`);
      }
    },
    [almacenes]
  );

  useEffect(() => {
    fetchAllData(refreshKey !== undefined);
  }, [refreshKey, fetchAllData]);

  const refreshAll = () => {
    localStorage.clear();
    return fetchAllData(true);
  };

  return {
    empresaInfo,
    sucursales,
    almacenes,
    loading,
    error,
    fetchAllData,
    actualizarEmpresa, // ¡Agregado aquí!
    refreshAll,
    editarAlmacen,
    eliminarAlmacen,
    empresaId: empresaInfo?.id || "",
  };
};