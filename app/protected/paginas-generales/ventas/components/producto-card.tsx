"use client";
import { ProductoExtendido, ProductoSeleccionado, UnidadMedida } from "@/app/utils/types";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, Image, Select, SelectItem } from "@heroui/react";
import { useState, useEffect } from "react";

interface Props {
  producto: ProductoExtendido;
  onProductoSeleccionado: (producto: ProductoSeleccionado) => void;
}

export default function ProductoCard({ producto, onProductoSeleccionado }: Props) {
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
    } else {
      setUnidadesMedida([]);
      setUnidadSeleccionada(null);
    }
  }, [producto]);

  const handleUnidadChange = (keys: Set<string>) => {
    const unidadKey = Array.from(keys)[0];
    const unidad = unidadesMedida.find((u) => u.unidadMedida.codigo === unidadKey);
    if (unidad) {
      setUnidadSeleccionada(unidad);
      onProductoSeleccionado({
        ...producto,
        precioVenta: unidad.precioVentaBase,
        unidadSeleccionada: {
          unidadMedida: unidad.unidadMedida.codigo,
          factorConversion: unidad.factorConversion,
          precioVenta: unidad.precioVentaBase,
        },
      });
    }
  };

  const handleAgregarProducto = () => {
    if (unidadSeleccionada) {
      onProductoSeleccionado({
        ...producto,
        precioVenta: unidadSeleccionada.precioVentaBase,
        unidadSeleccionada: {
          unidadMedida: unidadSeleccionada.unidadMedida.codigo,
          factorConversion: unidadSeleccionada.factorConversion,
          precioVenta: unidadSeleccionada.precioVentaBase,
        },
      });
    } else {
      onProductoSeleccionado({
        ...producto,
        precioVenta: unidadesMedida[0]?.precioVentaBase || 0,
      });
    }
  };

  const precioPredeterminado = unidadSeleccionada?.precioVentaBase ?? unidadesMedida[0]?.precioVentaBase ?? 0;

  return (
    <Card 
      className="w-full h-full transition-transform hover:scale-105 cursor-pointer sm:cursor-default"
      onClick={(e) => {
        if (window.innerWidth < 640) {
          handleAgregarProducto();
        }
      }}
    >
      <CardBody className="overflow-visible p-0 hidden sm:block">
        <Image
          alt={producto.nombre}
          className="w-full object-cover h-[140px]"
          radius="lg"
          shadow="sm"
          src={producto.imagen || "/placeholder.png"}
          width="100%"
        />
      </CardBody>
      <CardFooter className="text-small flex-col items-start px-2 py-2 gap-2 min-h-[auto] sm:min-h-[120px]">
        <b className="line-clamp-2 text-xs sm:text-sm dark:text-white">{producto.nombre}</b>
        <p className="text-default-500 font-medium text-xs sm:text-sm w-full">
          Precio: ${precioPredeterminado.toFixed(2)}
        </p>
        {unidadesMedida.length > 0 ? (
          <Select
            label="Medida"
            className="w-full text-xs sm:text-sm"
            placeholder="Selecciona una unidad"
            selectedKeys={unidadSeleccionada ? [unidadSeleccionada.unidadMedida.codigo] : []}
            onSelectionChange={(keys) => handleUnidadChange(keys as Set<string>)}
            classNames={{
              base: "w-full mt-1",
              trigger: "dark:bg-blue-500 text-xs sm:text-sm h-8 sm:h-10",
              listboxWrapper: "dark:bg-gray-800 dark:text-white text-black",
              listbox: "dark:bg-gray-800 dark:text-white",
              popoverContent: "dark:bg-gray-800 dark:text-white text-white",
            }}
          >
            {unidadesMedida.map((unidad) => (
              <SelectItem key={unidad.unidadMedida.codigo} value={unidad.unidadMedida.codigo}>
                {`${unidad.unidadMedida.descripcion} (${unidad.factorConversion}) - $${unidad.precioVentaBase ?? 0}`}
              </SelectItem>
            ))}
          </Select>
        ) : (
          <p className="text-gray-500 text-xs sm:text-sm">Sin unidades disponibles</p>
        )}
        <Button
          onPress={handleAgregarProducto}
          color="primary"
          className="mt-1 w-full h-8 sm:h-10 hidden sm:block"
          size="sm"
        >
          Agregar
        </Button>
      </CardFooter>
    </Card>
  );
}