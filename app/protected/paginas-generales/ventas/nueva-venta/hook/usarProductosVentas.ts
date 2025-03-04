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
  const [categorias, setCategorias] = useState([]);
  // Cambiamos el tipo aquí para coincidir con la interfaz Props de CategoriaSlider
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener datos del caché o de la API
  const fetchDataWithCache = async (url: string, cacheKey: string) => {
    // Intentar obtener datos del caché
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
    
    // Si no hay caché válido, obtener datos de la API
    const response = await axios.get(url);
    const data = response.data;
    
    // Guardar en caché
    localStorage.setItem(
      cacheKey, 
      JSON.stringify({
        data,
        timestamp: Date.now()
      })
    );
    
    return data;
  };

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Obtener productos y categorías con caché
        const [productosData, categoriasData] = await Promise.all([
          fetchDataWithCache("/api/productos", PRODUCTOS_CACHE_KEY),
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
    
    return productosOriginales.filter(producto => {
      // Filtrar por categoría
      const pasaCategoria = !categoriaSeleccionada || 
                           categoriaSeleccionada === "todas" || 
                           producto.categoriaId === categoriaSeleccionada;
      
      // Filtrar por búsqueda
      const pasaBusqueda = !busqueda || 
                          producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
      
      return pasaCategoria && pasaBusqueda;
    });
  }, [productosOriginales, categoriaSeleccionada, busqueda]);

  // Función para actualizar manualmente el caché cuando sea necesario
  const refreshCache = async () => {
    setLoading(true);
    try {
      localStorage.removeItem(PRODUCTOS_CACHE_KEY);
      localStorage.removeItem(CATEGORIAS_CACHE_KEY);
      
      const [productosData, categoriasData] = await Promise.all([
        fetchDataWithCache("/api/productos", PRODUCTOS_CACHE_KEY),
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
    categorias,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    busqueda,
    setBusqueda,
    loading,
    error,
    refreshCache, // Exponer función para actualizar caché manualmente
  };
}