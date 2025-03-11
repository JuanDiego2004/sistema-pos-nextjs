import { useState, useEffect } from "react";
import { Sucursal } from "../utils/types";
import { toast } from "sonner";
import { unstable_cache } from 'next/cache';

// Configuración del cache
const getCachedSucursales = unstable_cache(
  async (empresaId: string) => {
    const response = await fetch(`/api/sucursales?empresaId=${empresaId}`);
    if (!response.ok) {
      throw new Error("Error al obtener sucursales");
    }
    return response.json();
  },
  ['sucursales'], // cache key
  { 
    tags: ['sucursales'],
    revalidate: 3600 // 1 hora en segundos
  }
);

export function usarSucursal() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [currentSucursal, setCurrentSucursal] = useState<Sucursal>({
    id: "",
    nombre: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    pais: "Perú",
    telefono: "",
    email: "",
    empresaId: "",
  });

  // Función para cargar desde localStorage
  const loadFromLocalStorage = () => {
    const storedSucursales = localStorage.getItem('sucursales');
    if (storedSucursales) {
      setSucursales(JSON.parse(storedSucursales));
    }
  };

  // Función para guardar en localStorage
  const saveToLocalStorage = (data: Sucursal[]) => {
    localStorage.setItem('sucursales', JSON.stringify(data));
  };

  // Función optimizada para obtener sucursales
  const fetchSucursales = async (forceRefresh = false) => {
    if (!empresaId) return;

    try {
      // Primero intenta cargar desde localStorage si no forzamos refresh
      if (!forceRefresh) {
        const stored = localStorage.getItem('sucursales');
        if (stored) {
          const parsedData = JSON.parse(stored);
          setSucursales(parsedData);
          return;
        }
      }

      // Si no hay datos en localStorage o forzamos refresh, usa el cache de Next.js
      const data = await getCachedSucursales(empresaId);
      setSucursales(data);
      saveToLocalStorage(data);
      return data;
    } catch (error) {
      console.error("Error al obtener sucursales:", error);
      toast.error("No se pudieron cargar las sucursales");
      // Fallback a datos del localStorage si hay error
      loadFromLocalStorage();
    }
  };

  // Cargar la empresa al inicio
  useEffect(() => {
    const fetchEmpresaId = async () => {
      try {
        const response = await fetch("/api/empresa");
        if (!response.ok) throw new Error("No se pudo obtener la empresa.");

        const empresa = await response.json();
        if (empresa && empresa.id) {
          setEmpresaId(empresa.id);
          setCurrentSucursal((prev) => ({ ...prev, empresaId: empresa.id }));
        }
      } catch (error) {
        console.error("Error obteniendo empresa:", error);
        toast.error("No se pudo obtener la empresa.");
      }
    };

    fetchEmpresaId();
    // Carga inicial desde localStorage
    loadFromLocalStorage();
  }, []);

  // Llamar a fetchSucursales cuando empresaId cambie
  useEffect(() => {
    if (!empresaId) return;
    fetchSucursales();
  }, [empresaId]);

  // Función para forzar refresh de los datos
  const refreshSucursales = () => {
    fetchSucursales(true);
  };

  return {
    sucursales,
    currentSucursal,
    setSucursales,
    empresaId,
    fetchSucursales,
    refreshSucursales,
  };
}