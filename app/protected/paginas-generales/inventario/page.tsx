"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, Tab, Pagination } from "@heroui/react";
import FormAddProducto from "./components/registrar-producto/form-add-productos";
import EditProductoModal from "./components/edit-producto-modal";

import { toast } from "sonner";
import ProductoDetallesModal from "./components/producto-detalles";
import React from "react";
import { Producto } from "@prisma/client";
import { usarProductos } from "@/app/hooks/usar-producto";
import { ProductoConCategoria } from "@/app/utils/types";
import { usarProveedores } from "@/app/hooks/usarProveedores";
import { usarAlmacen } from "@/app/hooks/usarAlmacen";
import TablaProductos from "./components/tabla-productos";
import { audioError, audioExito } from "@/components/sonidos/sonidos-alert";

export default function PaginaInventario() {
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [productoEditando, setProductoEditando] = useState<ProductoConCategoria | null>(null);
  const [productoDetalles, setProductoDetalles] = useState<ProductoConCategoria | null>(null);
  const toggleDrawer = () => setDrawerAbierto(!drawerAbierto);

  const [refreshKey, setRefreshKey] = useState(0);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = React.useState("todas");
  const [mostrarMensajeDemora, setMostrarMensajeDemora] = useState(false);

  const {
    productos,
    categoriasCompletas,
    pagination,
    isLoading,
    handlePageChange,
    handleSearchChange,
    eliminarProducto,
    registrarProducto, // Añadir esta función al destructuring
  } = usarProductos({
    categoriaId: categoriaSeleccionada,
    page: 1,
    limit: 10,
    refreshKey,
  });

  const [searchValue, setSearchValue] = useState("");
  const { proveedores } = usarProveedores();
  const { almacenes } = usarAlmacen();

  const actualizarProducto = async (productoActualizado: ProductoConCategoria) => {
    setGuardando(true);
    try {
      const respuesta = await fetch(`/api/productos/${productoActualizado.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productoActualizado,
          categoriaId: productoActualizado.categoria ? productoActualizado.categoria.id : null,
        }),
      });

      const resultado = await respuesta.json();
      if (resultado.exito) {
        toast.success("Producto actualizado", {
          description: "Los cambios se han guardado correctamente.",
        });
        setRefreshKey((prev) => prev + 1);
      } else {
        toast.error("Error", {
          description: "No se pudo actualizar el producto. Inténtalo de nuevo.",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Hubo un problema al conectar con el servidor.",
      });
      console.error("Error actualizando producto:", error);
    } finally {
      setGuardando(false);
    }
  };

  const handleCategoriaChange = (categoriaId: string) => {
    setCategoriaSeleccionada(categoriaId);
    handlePageChange(1);
    setRefreshKey((prev) => prev + 1);
  };

  // Temporizador para mostrar mensaje si demora más de 3 segundos
  useEffect(() => {
    let temporizador: NodeJS.Timeout;
    if (guardando) {
      temporizador = setTimeout(() => {
        setMostrarMensajeDemora(true);
      }, 10000); // 3 segundos
    } else {
      setMostrarMensajeDemora(false);
    }
    return () => clearTimeout(temporizador); // Limpieza al desmontar o cambiar estado
  }, [guardando]);

  const handleRegistrarProducto = async (formData: any) => {
    setGuardando(true);
    try {
      await registrarProducto(formData);
      toggleDrawer();
      setRefreshKey((prev) => prev + 1);
      toast.success("Producto registrado correctamente");
      audioExito();
    } catch (error) {
      toast.error("Error al registrar el producto");
      audioError();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="light:bg-white dark:bg-black">
      <AnimatePresence>
        {guardando && (
          <motion.div
            key="saving-overlay"
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-white text-center">
              <img alt="registrando" src="/assets/loader.gif" height={40} width={40} />
              {mostrarMensajeDemora && (
                <p className="mt-2 text-sm">
                  Esto está tomando más tiempo de lo esperado. Puede ser un problema de internet o del servidor.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drawerAbierto && (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 bg-black/50 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleDrawer}
            />
            <motion.div
              key="drawer"
              className="fixed top-0 right-0 h-screen bg-white w-full sm:w-2/4 z-[100] overflow-y-auto shadow-xl"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 light:bg-white dark:bg-black">
                <FormAddProducto
                  onSuccess={() => {
                    toggleDrawer();
                    handlePageChange(1);
                    setRefreshKey((prev) => prev + 1);
                  }}
                  onClose={toggleDrawer}
                  registrarProducto={handleRegistrarProducto} // Pasar la función
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="mt-4 light:bg-white dark:bg-black">
        <Tabs
          selectedKey={categoriaSeleccionada}
          onSelectionChange={(key) => {
            setCategoriaSeleccionada(String(key));
            handlePageChange(1);
            setRefreshKey((prev) => prev + 1);
          }}
          aria-label="Categorías"
        >
          <Tab key="todas" title="Todas las categorías" />
          {categoriasCompletas.map((categoria) => (
            <Tab key={categoria.id} title={categoria.nombre} />
          ))}
        </Tabs>
      </div>

      <div className="mt-6">
        <TablaProductos
          productos={productos}
          categoriasCompletas={categoriasCompletas}
          onEditarProducto={(producto: React.SetStateAction<ProductoConCategoria | null>) => setProductoEditando(producto)}
          onAbrirDrawer={toggleDrawer}
          handleSearchChange={handleSearchChange}
          handleCategoriaChange={handleCategoriaChange}
          searchValue={searchValue}
          categoriaSeleccionada={categoriaSeleccionada}
          eliminarProducto={eliminarProducto}
        />
      </div>

      <Pagination
        page={pagination?.page || 1}
        total={pagination?.totalPages || 0}
        onChange={handlePageChange}
        loop
        showControls
      />

      {productoEditando && (
        <EditProductoModal
          categorias={categoriasCompletas}
          producto={productoEditando}
          onActualizar={actualizarProducto}
          onClose={() => setProductoEditando(null)}
          proveedores={proveedores}
          almacenes={almacenes}
        />
      )}
    </div>
  );
}