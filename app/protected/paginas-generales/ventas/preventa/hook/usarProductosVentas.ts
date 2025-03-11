"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Producto } from "@/app/utils/types";

// Configuración del caché
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutos en milisegundos
const PRODUCTOS_CACHE_KEY = "productos_cache";
const CATEGORIAS_CACHE_KEY = "categorias_cache";

export default function usarProductosVentas() {
  const [productosOriginales, setProductosOriginales] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener datos del caché o de la API
  const fetchDataWithCache = async (url: string, cacheKey: string) => {
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const isValid = Date.now() - timestamp < CACHE_DURATION;
      if (isValid) {
        console.log(`Usando datos en caché para ${cacheKey}`);
        return data;
      } else {
        console.log(`Caché expirado para ${cacheKey}, obteniendo datos frescos`);
      }
    }
    
    const response = await axios.get(url);
    const data = response.data;
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
  };

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productosData, categoriasData] = await Promise.all([
          fetchDataWithCache("/api/productos?includeUnidades=true", PRODUCTOS_CACHE_KEY), // Ajusta la URL según tu API
          fetchDataWithCache("/api/categorias", CATEGORIAS_CACHE_KEY),
        ]);
        
        const productos = productosData.productos || productosData;
        setProductosOriginales(productos);
        setCategorias(categoriasData);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("No se pudieron cargar los productos o categorías");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar productos con useMemo para mejor rendimiento
  const productosFiltrados = useMemo(() => {
    if (!productosOriginales.length) return [];
    
    return productosOriginales.filter((producto) => {
      const pasaCategoria =
        !categoriaSeleccionada ||
        categoriaSeleccionada === "todas" ||
        producto.categoriaId === categoriaSeleccionada;
      const pasaBusqueda =
        !busqueda || producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
      return pasaCategoria && pasaBusqueda;
    });
  }, [productosOriginales, categoriaSeleccionada, busqueda]);

  // Nueva propiedad: productos con bonificación
  const productosConBonificacion = useMemo(() => {
    return productosOriginales.filter((producto) => producto.productoConBonificacion === true);
  }, [productosOriginales]);

  // Función para actualizar manualmente el caché
  const refreshCache = async () => {
    setLoading(true);
    try {
      localStorage.removeItem(PRODUCTOS_CACHE_KEY);
      localStorage.removeItem(CATEGORIAS_CACHE_KEY);
      
      const [productosData, categoriasData] = await Promise.all([
        fetchDataWithCache("/api/productos?includeUnidades=true", PRODUCTOS_CACHE_KEY),
        fetchDataWithCache("/api/categorias", CATEGORIAS_CACHE_KEY),
      ]);
      
      const productos = productosData.productos || productosData;
      setProductosOriginales(productos);
      setCategorias(categoriasData);
      return { success: true };
    } catch (err) {
      console.error("Error al actualizar caché:", err);
      setError("No se pudo actualizar la información");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    productos: productosFiltrados,
    productosOriginales,
    productosConBonificacion,
    categorias,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    busqueda,
    setBusqueda,
    loading,
    error,
    refreshCache,
  };
}