"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  SelectItem,
  Select,
  DatePicker,
  Checkbox,
  Textarea,
} from "@heroui/react";

import { CalendarDate, parseDate } from "@internationalized/date";
import { ProductoConCategoria } from "@/app/utils/types";

interface EditProductoModalProps {
  producto: ProductoConCategoria;
  categorias: { id: string; nombre: string }[];
  proveedores: { id: string; nombre: string }[];
  almacenes: { id: string; nombre: string }[];
  onActualizar: (producto: ProductoConCategoria) => void;
  onClose: () => void;
}

export default function EditProductoModal({
  producto,
  categorias,
  proveedores,
  almacenes,
  onActualizar,
  onClose,
}: EditProductoModalProps) {
  const { isOpen, onOpenChange } = useDisclosure({ defaultOpen: true });
  const [productoEditando, setProductoEditando] =
    React.useState<ProductoConCategoria>({
      ...producto,
      categoriaId: producto.categoria?.id || "",
      proveedorId: producto.proveedor?.id || "",
      fechaVencimiento: producto.fechaVencimiento
        ? new Date(producto.fechaVencimiento)
        : null,
      fechaFabricacion: producto.fechaFabricacion
        ? new Date(producto.fechaFabricacion)
        : null,
      almacenes: producto.almacenes || [],
    });

  const [guardando, setGuardando] = React.useState(false);

  const actualizarLocal = (field: string, value: any) => {
    setProductoEditando((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    await onActualizar(productoEditando);
    setGuardando(false);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    onOpenChange();
  };

  const getCalendarDate = (date: Date | string | null): CalendarDate | null => {
    if (!date) return null;
    try {
      if (typeof date === "string") date = new Date(date);
      return parseDate(date.toISOString().split("T")[0]);
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };

  const convertToDate = (calendarDate: CalendarDate | null): Date | null => {
    if (!calendarDate) return null;
    return new Date(
      calendarDate.year,
      calendarDate.month - 1,
      calendarDate.day
    );
  };

  // Obtener los IDs de los almacenes seleccionados
  const almacenIdsSeleccionados = productoEditando.almacenes?.map(
    (almacen) => almacen.almacenId
  );

  return (
    <Modal scrollBehavior="inside" isOpen={isOpen} onOpenChange={handleClose}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="text-black dark:text-gray-400" >Editar Producto</ModalHeader>
            <ModalBody>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <Input
                  label="Nombre"
                  value={productoEditando.nombre}
                  onChange={(e) => actualizarLocal("nombre", e.target.value)}
                  radius="md"
                />

                <Select
                  label="Categoría"
                  radius="md"
                  selectedKeys={[productoEditando.categoriaId]}
                  onChange={(e) =>
                    actualizarLocal("categoriaId", e.target.value)
                  }
                >
                  {categorias.map((categoria) => (
                    <SelectItem className="text-black dark:text-gray-400" key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  label="Código de Barras"
                  value={productoEditando.codigoBarras || ""}
                  onChange={(e) =>
                    actualizarLocal("codigoBarras", e.target.value)
                  }
                  radius="md"
                />

                <Select
                  label="Proveedor"
                  radius="md"
                  selectedKeys={
                    productoEditando.proveedorId
                      ? [productoEditando.proveedorId]
                      : []
                  }
                  onChange={(e) =>
                    actualizarLocal("proveedorId", e.target.value)
                  }
                >
                  {proveedores.map((proveedor) => (
                    <SelectItem className="text-black dark:text-gray-400"  key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre}
                    </SelectItem>
                  ))}
                </Select>

                {/* Selección de múltiples almacenes */}
                <Select
                  label="Almacenes"
                  radius="md"
                  selectionMode="multiple"
                  selectedKeys={new Set(almacenIdsSeleccionados)}
                  onSelectionChange={(keys) => {
                    // This is a common pattern in UI libraries - a dedicated onSelectionChange handler
                    // instead of the standard onChange
                    const selectedValues = Array.from(keys as Set<string>);

                    const nuevosAlmacenes = selectedValues.map((almacenId) => ({
                      id: `${productoEditando.id}-${almacenId}`,
                      productoId: productoEditando.id,
                      almacenId: almacenId,
                      stock: 0,
                    }));
                    actualizarLocal("almacenes", nuevosAlmacenes);
                  }}
                >
                  {almacenes.map((almacen) => (
                    <SelectItem className="text-black dark:text-gray-400"  key={almacen.id} value={almacen.id}>
                      {almacen.nombre}
                    </SelectItem>
                  ))}
                </Select>

                <DatePicker
                  label="Fecha de Vencimiento"
                  value={getCalendarDate(
                    productoEditando.fechaVencimiento ?? null
                  )}
                  onChange={(date) =>
                    actualizarLocal("fechaVencimiento", convertToDate(date))
                  }
                />

                <DatePicker
                  label="Fecha de Fabricación"
                  value={getCalendarDate(
                    productoEditando.fechaFabricacion ?? null
                  )}
                  onChange={(date) =>
                    actualizarLocal("fechaFabricacion", convertToDate(date))
                  }
                />

                <Input
                  label="Lote"
                  value={productoEditando.lote || ""}
                  onChange={(e) => actualizarLocal("lote", e.target.value)}
                  radius="md"
                />

                <Input
                  label="Ubicación en Almacén"
                  value={productoEditando.ubicacionAlmacen || ""}
                  onChange={(e) =>
                    actualizarLocal("ubicacionAlmacen", e.target.value)
                  }
                  radius="md"
                />

                <Input
                  type="number"
                  label="Peso (kg)"
                  value={productoEditando.peso?.toString() || ""}
                  onChange={(e) =>
                    actualizarLocal("peso", parseFloat(e.target.value) || 0)
                  }
                  radius="md"
                />

                <Input
                  label="Dimensiones"
                  value={productoEditando.dimensiones || ""}
                  onChange={(e) =>
                    actualizarLocal("dimensiones", e.target.value)
                  }
                  radius="md"
                />

                <Input
                  type="number"
                  label="Costo de Almacenamiento"
                  value={productoEditando.costoAlmacenamiento?.toString() || ""}
                  onChange={(e) =>
                    actualizarLocal(
                      "costoAlmacenamiento",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  radius="md"
                />

                <Checkbox
                  isSelected={productoEditando.tieneIGV}
                  onChange={(e) =>
                    actualizarLocal("tieneIGV", e.target.checked)
                  }
                >
                  Tiene IGV
                </Checkbox>

                <Input
                  type="number"
                  label="Impuestos Adicionales (%)"
                  value={
                    productoEditando.impuestosAdicionales?.toString() || ""
                  }
                  onChange={(e) =>
                    actualizarLocal(
                      "impuestosAdicionales",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  radius="md"
                />

                <Input
                  type="number"
                  label="Descuento (%)"
                  value={productoEditando.descuento?.toString() || ""}
                  onChange={(e) =>
                    actualizarLocal(
                      "descuento",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  radius="md"
                />

                <Textarea
                  label="Notas"
                  value={productoEditando.notas || ""}
                  onChange={(e) => actualizarLocal("notas", e.target.value)}
                  radius="md"
                />
              </form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={handleClose}>
                Cancelar
              </Button>
              <Button
                color="primary"
                onClick={handleSubmit}
                isLoading={guardando}
              >
                Guardar Cambios
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
