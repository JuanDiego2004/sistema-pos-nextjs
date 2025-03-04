"use client";

import InventarioTable from "./components/inventario-tabla";
import { usarProductosInventario } from "./hook/usarProductosInventario";

export default function InventarioPage() {
  const {
    productos,
    usuarioRol,
    usuarioId,
    usuarioAlmacenes,
    loading,
    error,
    updateStock,
    clearCache,
  } = usarProductosInventario();

  if (loading) {
    return (
      <div className="bg-opacity-20 flex justify-center items-center h-screen w-screen">
        <img src="/assets/loader.gif" alt="cargando" className="w-16 h-16" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <h1 className="text-2xl font-bold mb-4">Inventario</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* <h1 className="text-2xl font-bold mb-4">Inventario</h1>
      <p className="mb-2">Rol del usuario: {usuarioRol}</p>
      <p className="mb-2">ID del usuario: {usuarioId}</p> */}
      <div className="mb-4">
        {usuarioAlmacenes.length > 0 ? (
          <ul className="list-disc pl-5">
            {usuarioAlmacenes.map((ua) => (
              <li key={ua.id}>
                ID Relación: {ua.id}, Almacén ID: {ua.almacenId}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay almacenes asignados.</p>
        )}
      </div>
      <button
        onClick={clearCache}
        className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Limpiar Caché y Recargar
      </button>
      {productos.length > 0 ? (
        <InventarioTable updateStock={updateStock} productos={productos} />
      ) : (
        <p>No tienes permisos para ver productos o no hay productos disponibles en tus almacenes.</p>
      )}
    </div>
  );
}