import { useState, useEffect } from "react";
import axios from "axios";

interface UseProductosProps {
  categoriaId?: string;
  page?: number;
  limit?: number;
  refreshKey?: number;
}

export function usarProductos({
  categoriaId,
  page = 1,
  limit = 10,
  refreshKey,
}: UseProductosProps) {
  const [allProductos, setAllProductos] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [categoriasCompletas, setCategoriasCompletas] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(page);
  const [isLoading, setIsLoading] = useState(true);
  const [filterValue, setFilterValue] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const storedProductos = localStorage.getItem("productos");
        const storedCategorias = localStorage.getItem("categorias");

        if (storedProductos && storedCategorias && !refreshKey) {
          const parsedProductos = JSON.parse(storedProductos);
          const parsedCategorias = JSON.parse(storedCategorias);
          if (Array.isArray(parsedProductos) && Array.isArray(parsedCategorias)) {
            setAllProductos(parsedProductos);
            setCategoriasCompletas(parsedCategorias);
            setIsLoading(false);
            return;
          }
        }

        const [productosResponse, categoriasResponse] = await Promise.all([
          axios.get("/api/productos"),
          axios.get("/api/categorias"),
        ]);

        const productosData = productosResponse.data.productos;
        const categoriasData = categoriasResponse.data;

        localStorage.setItem("productos", JSON.stringify(productosData));
        localStorage.setItem("categorias", JSON.stringify(categoriasData));

        setAllProductos(productosData);
        setCategoriasCompletas(categoriasData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  // Filtrar y paginar productos
  useEffect(() => {
    const updateProductos = () => {
      let filteredData = [...allProductos];

      if (categoriaId && categoriaId !== "todas") {
        filteredData = filteredData.filter(
          (producto) => producto.categoriaId === categoriaId
        );
      }

      if (filterValue) {
        filteredData = filteredData.filter((producto) =>
          producto.nombre.toLowerCase().includes(filterValue.toLowerCase())
        );
      }

      const totalItems = filteredData.length;
      const totalPages = Math.ceil(totalItems / limit);
      const skip = (currentPage - 1) * limit;
      const paginatedData = filteredData.slice(skip, skip + limit);

      setProductos(paginatedData);
      setPagination({
        page: currentPage,
        limit,
        total: totalItems,
        totalPages,
      });
    };

    updateProductos();
  }, [allProductos, categoriaId, filterValue, currentPage, limit]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };

  const eliminarProducto = async (productoId: string) => {
    if (!productoId) throw new Error("ID de producto no válido");

    try {
      const response = await fetch(`/api/productos/${productoId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!data.exito) throw new Error(data.error || "Error al eliminar el producto");

      setAllProductos((prev) => {
        const nuevosProductos = prev.filter((p) => p.id !== productoId);
        localStorage.setItem("productos", JSON.stringify(nuevosProductos));
        return nuevosProductos;
      });
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      throw error;
    }
  };

  const registrarProducto = async (nuevoProducto: any) => {
    if (isRegistering) return; // Prevenir múltiples submissions
    
    try {
      setIsRegistering(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append("data", JSON.stringify(nuevoProducto));
      if (nuevoProducto.imagen) {
        formDataToSend.append("imagen", nuevoProducto.imagen);
      }
  
      const response = await fetch("/api/productos", {
        method: "POST",
        body: formDataToSend,
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || "Error al registrar el producto");
      }
  
      // Actualizar el estado de manera segura
      setAllProductos(prev => {
        const updatedProductos = [...prev, result.producto];
        // Mover la actualización de localStorage a un setTimeout para no bloquear la UI
        setTimeout(() => {
          localStorage.setItem("productos", JSON.stringify(updatedProductos));
        }, 0);
        return updatedProductos;
      });
      
      return result.producto; // Devolver el producto creado
    } catch (error) {
      console.error("Error al registrar el producto:", error);
      throw error;
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    productos,
    registrarProducto,
    categoriasCompletas,
    eliminarProducto,
    pagination,
    isLoading,
    handlePageChange,
    handleSearchChange,
  };
}