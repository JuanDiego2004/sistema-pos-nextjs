"use client";
import ProductoCard from "./producto-card";
import ProductoListItem from "../nueva-venta/components/producto-list-mobile";
import { ProductoExtendido, ProductoSeleccionado } from "@/app/utils/types";


interface Props {
  productos: ProductoExtendido[];
  onProductoSeleccionado: (producto: ProductoSeleccionado) => void;
  isMobile: boolean;
}

export default function ProductoLista({
  productos,
  onProductoSeleccionado,
  isMobile,
}: Props) {
  console.log(productos);

  if (!Array.isArray(productos)) {
    return (
      <div className="p-4 text-center text-gray-600">
        No hay productos disponibles.
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="p-4 text-center text-gray-600">
        No hay productos en esta categoría.
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto px-4">
      {isMobile ? (
        <ul className="flex flex-col gap-2">
          {productos.map((producto) => (
            <ProductoListItem
              key={producto.id}
              producto={producto}
              onProductoSeleccionado={onProductoSeleccionado}
            />
          ))}
        </ul>
      ) : (
        <div
          className="grid gap-6 justify-items-center"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            maxWidth: "100%",
          }}
        >
          {productos.map((producto) => (
            <div key={producto.id} className="w-full flex justify-center">
              <ProductoCard
                producto={producto}
                onProductoSeleccionado={onProductoSeleccionado}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}