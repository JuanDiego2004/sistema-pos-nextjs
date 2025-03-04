"use client";

import { useEffect, useState } from "react";
import { ProductoConCategoria } from "@/app/utils/types";
import { createClient } from "@/utils/supabase/client";

type Rol = "ADMIN" | "EMPLEADO" | "GERENTE" | "INVENTARISTA" | "VENDEDOR";

interface UsuarioAlmacen {
  id: string;
  usuarioId: string;
  almacenId: string;
}

interface UseProductosInventarioResponse {
  productos: ProductoConCategoria[];
  usuarioRol: Rol | null;
  usuarioId: string | null;
  usuarioAlmacenes: UsuarioAlmacen[];
  loading: boolean;
  updateStock: (productoId: string, almacenRegistroId: string, newStock: number) => Promise<void>;
  error: string | null;
  clearCache: () => void;
}

interface CachedData {
  productos: ProductoConCategoria[];
  usuarioRol: Rol | null;
  usuarioId: string | null;
  usuarioAlmacenes: UsuarioAlmacen[];
  timestamp: number;
}

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutos

export function usarProductosInventario(): UseProductosInventarioResponse {
  const [productos, setProductos] = useState<ProductoConCategoria[]>([]);
  const [usuarioRol, setUsuarioRol] = useState<Rol | null>(null);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [usuarioAlmacenes, setUsuarioAlmacenes] = useState<UsuarioAlmacen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const clearCache = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const CACHE_KEY = `productosInventarioCache-${user.id}`;
      localStorage.removeItem(CACHE_KEY);
      await fetchData();
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
  
      if (userError || !user) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        setLoading(false);
        return;
      }
  
      const CACHE_KEY = `productosInventarioCache-${user.id}`;
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const cachedData: CachedData = JSON.parse(cached);
        const now = Date.now();
        if (now - cachedData.timestamp < CACHE_EXPIRATION_TIME) {
          setProductos(cachedData.productos);
          setUsuarioRol(cachedData.usuarioRol);
          setUsuarioId(cachedData.usuarioId);
          setUsuarioAlmacenes(cachedData.usuarioAlmacenes);
          setLoading(false);
          return;
        }
      }
  
      const response = await fetch("/api/productos-por-rol", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener los productos");
      }
  
      const data = await response.json();
      if (!data.exito) throw new Error("La respuesta no fue exitosa");

      // Verificar si el usuario pertenece a algún almacén
      if (!data.usuarioAlmacenes || data.usuarioAlmacenes.length === 0) {
        setError("No tienes permisos para estar aquí. No estás asignado a ningún almacén.");
        setLoading(false);
        return;
      }

      // Filtrar productos según el rol y los almacenes asignados
      let productosFiltrados = data.productos;
      if (data.rol !== "ADMIN" && data.rol !== "INVENTARISTA") {
        productosFiltrados = []; // Si no es ADMIN ni INVENTARISTA, no mostrar productos
      } else {
        // Filtrar productos por almacenes asignados
        const almacenesIds = data.usuarioAlmacenes.map((ua: UsuarioAlmacen) => ua.almacenId);
        productosFiltrados = data.productos.map((producto: ProductoConCategoria) => {
          const almacenesFiltrados = producto.almacenes.filter((almacen) =>
            almacenesIds.includes(almacen.almacenId)
          );
          return { ...producto, almacenes: almacenesFiltrados };
        }).filter((producto: ProductoConCategoria) => producto.almacenes.length > 0);
      }

      // Sincronizar stocks al cargar los datos
      const productosSincronizados = productosFiltrados.map((producto: ProductoConCategoria) => {
        const unidadPrincipal = producto.unidadesMedida.find((um) => um.esUnidadPrincipal);
        if (!unidadPrincipal) return producto;
  
        const stockPrincipalPorAlmacen = producto.almacenes.reduce((acc, almacen) => {
          if (almacen.unidadMedidaId === unidadPrincipal.unidadMedidaId) {
            acc[almacen.almacenId] = almacen.stock;
          }
          return acc;
        }, {} as Record<string, number>);
  
        const almacenesActualizados = producto.almacenes.map((almacen) => {
          if (almacen.unidadMedidaId === unidadPrincipal.unidadMedidaId) {
            return almacen; // No modificamos el principal
          }
          const unidadSecundaria = producto.unidadesMedida.find(
            (um) => um.unidadMedidaId === almacen.unidadMedidaId && !um.esUnidadPrincipal
          );
          if (unidadSecundaria) {
            const stockPrincipal = stockPrincipalPorAlmacen[almacen.almacenId] || 0;
            const stockEsperado = Math.floor(stockPrincipal * unidadSecundaria.factorConversion);
            if (stockEsperado !== almacen.stock) {
              console.log(
                `Sincronizando stock secundario para ${producto.nombre} en almacén ${almacen.almacen.nombre}: ${almacen.stock} -> ${stockEsperado}`
              );
              return { ...almacen, stock: stockEsperado };
            }
          }
          return almacen;
        });
  
        return { ...producto, almacenes: almacenesActualizados };
      });
  
      setUsuarioRol(data.rol);
      setUsuarioId(data.usuarioId);
      setUsuarioAlmacenes(data.usuarioAlmacenes || []);
      setProductos(productosSincronizados);
  
      const cacheData: CachedData = {
        productos: productosSincronizados,
        usuarioRol: data.rol,
        usuarioId: data.usuarioId,
        usuarioAlmacenes: data.usuarioAlmacenes || [],
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      setError("Error al cargar los datos: " + (err instanceof Error ? err.message : String(err)));
      setProductos([]);
      setUsuarioAlmacenes([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productoId: string, almacenRegistroId: string, newStock: number): Promise<void> => {
    try {
      console.log("Iniciando updateStock:", { productoId, almacenRegistroId, newStock });

      // Encontrar el producto
      const producto = productos.find((p) => p.id === productoId);
      if (!producto) throw new Error("Producto no encontrado");

      // Encontrar el registro de almacén
      const almacenRegistro = producto.almacenes.find((a) => a.id === almacenRegistroId);
      if (!almacenRegistro) throw new Error("Registro de almacén no encontrado");

      // Encontrar la unidad de medida del registro
      const unidadActual = producto.unidadesMedida.find(
        (um) => um.unidadMedidaId === almacenRegistro.unidadMedidaId
      );
      if (!unidadActual) throw new Error("Unidad de medida no encontrada");

      const almacenId = almacenRegistro.almacenId;

      // Actualización optimista (cambiar el estado local antes de la solicitud)
      const updatedProductos = productos.map((p) => {
        if (p.id === productoId) {
          const updatedAlmacenes = p.almacenes.map((a) => {
            if (a.id === almacenRegistroId) {
              return { ...a, stock: newStock };
            }
            return a;
          });
          return { ...p, almacenes: updatedAlmacenes };
        }
        return p;
      });

      // Si es la unidad principal
      if (unidadActual.esUnidadPrincipal) {
        console.log("Actualizando unidad PRINCIPAL");

        // Actualizar estado local optimistamente
        setProductos(updatedProductos);

        // Actualizar unidad principal en la API
        const responsePrincipal = await fetch(`/api/update-stock`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ almacenRegistroId, stock: newStock }),
        });

        if (!responsePrincipal.ok) {
          throw new Error("Error al actualizar el stock principal");
        }

        // Actualizar unidades secundarias
        const unidadesSecundarias = producto.unidadesMedida.filter((um) => !um.esUnidadPrincipal);
        for (const unidadSecundaria of unidadesSecundarias) {
          const almacenSecundario = producto.almacenes.find(
            (a) => a.unidadMedidaId === unidadSecundaria.unidadMedidaId && a.almacenId === almacenId
          );
          if (almacenSecundario) {
            const nuevoStockSecundario = Math.floor(newStock * unidadSecundaria.factorConversion);
            console.log("Actualizando unidad secundaria:", {
              unidadId: unidadSecundaria.unidadMedidaId,
              almacenId: almacenSecundario.id,
              nuevoStockSecundario,
            });

            const responseSecundario = await fetch(`/api/update-stock`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ almacenRegistroId: almacenSecundario.id, stock: nuevoStockSecundario }),
            });

            if (responseSecundario.ok) {
              // Actualizar estado local con el stock secundario
              setProductos((prev) =>
                prev.map((p) => {
                  if (p.id === productoId) {
                    const updatedAlmacenes = p.almacenes.map((a) =>
                      a.id === almacenSecundario.id ? { ...a, stock: nuevoStockSecundario } : a
                    );
                    return { ...p, almacenes: updatedAlmacenes };
                  }
                  return p;
                })
              );
            } else {
              console.error(`Error al actualizar unidad secundaria ${almacenSecundario.id}`);
            }
          }
        }
      } 
      // Si es una unidad secundaria
      else {
        console.log("Actualizando unidad SECUNDARIA");

        // Encontrar la unidad principal
        const unidadPrincipal = producto.unidadesMedida.find((um) => um.esUnidadPrincipal);
        if (!unidadPrincipal) throw new Error("Unidad principal no encontrada");

        // Calcular el nuevo stock principal
        const nuevoStockPrincipal = Math.ceil(newStock / unidadActual.factorConversion);
        console.log("Nuevo stock principal calculado:", { newStock, nuevoStockPrincipal });

        // Encontrar el registro de almacén de la unidad principal
        const almacenPrincipal = producto.almacenes.find(
          (a) => a.unidadMedidaId === unidadPrincipal.unidadMedidaId && a.almacenId === almacenId
        );
        if (!almacenPrincipal) throw new Error("Registro de almacén principal no encontrado");

        // Actualizar estado local optimistamente
        setProductos(updatedProductos);

        // Actualizar unidad secundaria en la API
        const responseSecundario = await fetch(`/api/update-stock`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ almacenRegistroId, stock: newStock }),
        });

        if (!responseSecundario.ok) {
          throw new Error("Error al actualizar el stock secundario");
        }

        // Actualizar unidad principal en la API
        const responsePrincipal = await fetch(`/api/update-stock`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ almacenRegistroId: almacenPrincipal.id, stock: nuevoStockPrincipal }),
        });

        if (responsePrincipal.ok) {
          // Actualizar estado local con el stock principal
          setProductos((prev) =>
            prev.map((p) => {
              if (p.id === productoId) {
                const updatedAlmacenes = p.almacenes.map((a) =>
                  a.id === almacenPrincipal.id ? { ...a, stock: nuevoStockPrincipal } : a
                );
                return { ...p, almacenes: updatedAlmacenes };
              }
              return p;
            })
          );
        } else {
          throw new Error("Error al actualizar el stock principal desde secundaria");
        }
      }
    } catch (error) {
      console.error("Error al actualizar el stock:", error);
      setError("Error al actualizar el stock: " + (error instanceof Error ? error.message : String(error)));
      // Revertir el estado optimista si falla
      await fetchData(); // Recargar datos frescos
      throw error;
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  return { productos, updateStock, usuarioRol, usuarioId, usuarioAlmacenes, loading, error, clearCache };
}