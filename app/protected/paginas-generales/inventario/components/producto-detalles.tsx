// components/ProductDetails.tsx
import { Categoria } from "@/app/utils/types";
import React from "react";

interface ProductoDetallesProps {
  productoSeleccionado: any;
  onClose: () => void;
  categoriasCompletas: Categoria[];
}

// Subcomponente reutilizable para secciones
const ProductDetailsSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{title}</h3>
    <div className="p-4 bg-gray-50 rounded-md shadow-sm">{children}</div>
  </div>
);

export default function ProductoDetalles({
  productoSeleccionado,
  onClose,
  categoriasCompletas,
}: ProductoDetallesProps) {
  return (
    <div className="bg-white p-6 rounded-lg max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {productoSeleccionado.nombre}
        </h2>
        <button
          onClick={onClose}
          className="text-xl text-gray-500 hover:text-red-500 transition-colors"
        >
          &times;
        </button>
      </div>

      {/* Detalles generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ProductDetailsSection title="Detalles Generales">
          <p className="mb-2">
            <strong>Código de Barras:</strong> {productoSeleccionado.codigoBarras}
          </p>
          <p className="mb-2">
            <strong>Código Interno:</strong> {productoSeleccionado.codigoInterno}
          </p>
          <p className="mb-2">
            <strong>Marca:</strong> {productoSeleccionado.marca || "—"}
          </p>
          <p className="mb-2">
            <strong>Categoría:</strong>{" "}
            {categoriasCompletas.find((cat) => cat.id === productoSeleccionado.categoriaId)?.nombre ||
              "—"}
          </p>
          <p className="mb-2">
            <strong>Proveedor:</strong> {productoSeleccionado.proveedor?.nombre || "—"}
          </p>
        </ProductDetailsSection>

        <ProductDetailsSection title="Información Adicional">
          <p className="mb-2">
            <strong>Lote:</strong> {productoSeleccionado.lote || "—"}
          </p>
          <p className="mb-2">
            <strong>Fecha Vencimiento:</strong>{" "}
            {productoSeleccionado.fechaVencimiento
              ? new Date(productoSeleccionado.fechaVencimiento).toLocaleDateString()
              : "—"}
          </p>
          <p className="mb-2">
            <strong>Fecha Fabricación:</strong>{" "}
            {productoSeleccionado.fechaFabricacion
              ? new Date(productoSeleccionado.fechaFabricacion).toLocaleDateString()
              : "—"}
          </p>
          <p className="mb-2">
            <strong>Ubicación:</strong> {productoSeleccionado.ubicacionAlmacen || "—"}
          </p>
          <p className="mb-2">
            <strong>Tiene IGV:</strong> {productoSeleccionado.tieneIGV ? "Sí" : "No"}
          </p>
        </ProductDetailsSection>
      </div>

      {/* Descripción */}
      {productoSeleccionado.descripcion && (
        <ProductDetailsSection title="Descripción">
          <p className="text-gray-700 dark:text-gray-300">{productoSeleccionado.descripcion}</p>
        </ProductDetailsSection>
      )}

      {/* Datos físicos y costos */}
      <ProductDetailsSection title="Datos Físicos y Costos">
        <div className="grid grid-cols-2 gap-4">
          <p>
            <strong>Peso:</strong> {productoSeleccionado.peso ? `${productoSeleccionado.peso} kg` : "—"}
          </p>
          <p>
            <strong>Dimensiones:</strong> {productoSeleccionado.dimensiones || "—"}
          </p>
          <p>
            <strong>Costo Almacenamiento:</strong>{" "}
            {productoSeleccionado.costoAlmacenamiento
              ? `$${productoSeleccionado.costoAlmacenamiento.toFixed(2)}`
              : "—"}
          </p>
          <p>
            <strong>Impuestos Adicionales:</strong>{" "}
            {productoSeleccionado.impuestosAdicionales
              ? `${productoSeleccionado.impuestosAdicionales}%`
              : "0%"}
          </p>
          <p>
            <strong>Descuento:</strong>{" "}
            {productoSeleccionado.descuento ? `${productoSeleccionado.descuento}%` : "0%"}
          </p>
        </div>
      </ProductDetailsSection>

      {/* Unidades de medida */}
      <ProductDetailsSection title="Unidades de Medida">
        {productoSeleccionado.unidadesMedida && productoSeleccionado.unidadesMedida.length > 0 ? (
          productoSeleccionado.unidadesMedida.map((unidad: any) => (
            <div key={unidad.id} className="p-3 border rounded bg-gray-50 mb-2">
              <div className="grid grid-cols-2 gap-2">
                <p>
                  <strong>Unidad:</strong> {unidad.unidadMedida.descripcion}
                </p>
                <p>
                  <strong>Factor Conversión:</strong> {unidad.factorConversion}
                </p>
                <p>
                  <strong>Precio Compra:</strong> ${unidad.precioCompra.toFixed(2)}
                </p>
                <p>
                  <strong>Precio Venta:</strong> ${unidad.precioVenta.toFixed(2)}
                </p>
                <p>
                  <strong>Stock:</strong> {unidad.stock}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No hay unidades de medida definidas</p>
        )}
      </ProductDetailsSection>

      {/* Almacenes */}
      {productoSeleccionado.almacenes && productoSeleccionado.almacenes.length > 0 && (
        <ProductDetailsSection title="Almacenes">
          {productoSeleccionado.almacenes.map((item: any) => (
            <div key={item.id} className="p-3 border rounded bg-gray-50 mb-2">
              <p>
                <strong>Almacén:</strong> {item.almacen?.nombre || item.almacenId}
              </p>
              <p>
                <strong>Stock:</strong> {item.stock}
              </p>
            </div>
          ))}
        </ProductDetailsSection>
      )}

      {/* Notas */}
      {productoSeleccionado.notas && (
        <ProductDetailsSection title="Notas">
          <p>{productoSeleccionado.notas}</p>
        </ProductDetailsSection>
      )}

      {/* Botón de cierre */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}