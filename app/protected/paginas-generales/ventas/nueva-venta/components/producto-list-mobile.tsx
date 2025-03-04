"use client";
import { ProductoExtendido, ProductoSeleccionado, UnidadMedida } from "@/app/utils/types";
import { Select, SelectItem } from "@heroui/react";
import { useState, useEffect } from "react";

interface Props {
  producto: ProductoExtendido;
  onProductoSeleccionado: (producto: ProductoSeleccionado) => void;
}

export default function ProductoListItem({ producto, onProductoSeleccionado }: Props) {
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<UnidadMedida | null>(null);
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);

  useEffect(() => {
    if (producto.unidadesMedida && Array.isArray(producto.unidadesMedida)) {
      const unidades = producto.unidadesMedida;
      setUnidadesMedida(unidades);
      const unidadPrincipal = unidades.find((u) => u.esUnidadPrincipal) || unidades[0];
      if (unidadPrincipal) {
        setUnidadSeleccionada(unidadPrincipal);
      }
    }
  }, [producto]);

  const handleUnidadChange = (keys: Set<string>) => {
    const unidadKey = Array.from(keys)[0];
    console.log("Valor recibido en onSelectionChange:", unidadKey);

    const unidad = unidadesMedida.find((u) => u.unidadMedida.codigo === unidadKey);
    if (unidad) {
      console.log("Unidad encontrada:", unidad);
      setUnidadSeleccionada(unidad);
      onProductoSeleccionado({
        ...producto,
        precioVenta: unidad.precioVentaBase ?? 0,
        unidadSeleccionada: {
          unidadMedida: unidad.unidadMedida.codigo,
          factorConversion: unidad.factorConversion ?? 1,
          precioVenta: unidad.precioVentaBase ?? 0,
        },
      });
    } else {
      console.error("Unidad no encontrada para clave:", unidadKey);
    }
  };

  const handleSeleccionarProducto = () => {
    onProductoSeleccionado({
      ...producto,
      precioVenta: unidadSeleccionada?.precioVentaBase || unidadesMedida[0]?.precioVentaBase || 0,
      unidadSeleccionada: unidadSeleccionada
        ? {
            unidadMedida: unidadSeleccionada.unidadMedida.codigo,
            factorConversion: unidadSeleccionada.factorConversion ?? 1,
            precioVenta: unidadSeleccionada.precioVentaBase ?? 0,
          }
        : undefined,
    });
  };

  const precioPredeterminado = unidadSeleccionada?.precioVentaBase || unidadesMedida[0]?.precioVentaBase || 0;

  return (
    <li
      className="flex items-center gap-3 p-3 border-b border-gray-300 cursor-pointer hover:bg-gray-100 dark:bg-gray-700 rounded-md"
      onClick={handleSeleccionarProducto}
    >
      <div className="flex-1">
        <b className="text-sm">{producto.nombre}</b>
        <p className="text-gray-500 dark:text-gray-300 text-sm font-md">
          Precio: ${precioPredeterminado.toFixed(2)}
        </p>
        {unidadesMedida.length > 0 && (
          <Select
            label="Medida"
            placeholder="Selecciona una unidad"
            onSelectionChange={(keys) => handleUnidadChange(keys as Set<string>)}
            selectedKeys={unidadSeleccionada ? [unidadSeleccionada.unidadMedida.codigo] : []}
            classNames={{
              base: "max-w-xs mt-1",
              trigger: "dark:bg-blue-500",
              listboxWrapper: "dark:bg-gray-800 dark:text-white text-black",
              listbox: "dark:bg-gray-800 dark:text-white",
              popoverContent: "dark:bg-gray-800 dark:text-white text-white",
            }}
          >
            {unidadesMedida.map((unidad) => (
              <SelectItem
                className="dark:hover:bg-gray-700 dark:text-white"
                key={unidad.unidadMedida.codigo}
                value={unidad.unidadMedida.codigo}
              >
                {`${unidad.unidadMedida.descripcion} (${unidad.factorConversion}) - $${unidad.precioVentaBase}`}
              </SelectItem>
            ))}
          </Select>
        )}
      </div>
    </li>
  );
}