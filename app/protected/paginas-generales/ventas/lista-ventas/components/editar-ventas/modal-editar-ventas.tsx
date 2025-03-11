"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Card,
  CardBody,
  Spinner,
} from "@heroui/react";
import { Preventa, Producto as ProductoType } from "@/app/utils/types";
import { Plus, Minus } from "lucide-react";
import usarProductosVentas from "../../../nueva-venta/hook/usarProductosVentas";
import { actualizarPreventa } from "../../server-actions/preventas";

// Interfaz para productos en la tabla de ventas
interface Producto {
  id: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  tieneIGV: boolean;
  unidadSeleccionada: {
    precioVenta: number;
    unidadMedida: string;
    factorConversion: number;
  };
}

// Interfaz para bonificaciones
interface Bonificacion {
  id?: string;
  productoId: string;
  nombre: string;
  cantidad: number;
  unidadMedida: string;
  createdAt?: string;
}

interface EditarVentaModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  preventa: Preventa | null;
  onSave: (updatedPreventa: Preventa) => void;
}

export default function EditarVentaModal({
  isOpen,
  onOpenChange,
  preventa,
  onSave,
}: EditarVentaModalProps) {
  const [formData, setFormData] = useState({
    cliente: preventa?.cliente?.nombre || "",
    total: preventa?.total.toString() || "",
    estado: preventa?.estado || "",
    metodoPago: preventa?.metodoPago || "",
  });

  const [productos, setProductos] = useState<Producto[]>([]);
  const [bonificaciones, setBonificaciones] = useState<Bonificacion[]>([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoType | null>(null);
  const [unidadElegida, setUnidadElegida] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para el loader

  const {
    productos: productosDisponibles,
    productosConBonificacion,
    setBusqueda,
    loading,
    error,
  } = usarProductosVentas();

  useEffect(() => {
    if (preventa) {
      setFormData({
        cliente: preventa.cliente?.nombre || "",
        total: preventa.total.toString(),
        estado: preventa.estado,
        metodoPago: preventa.metodoPago,
      });
      setProductos(
        preventa.detallePreventas.map((detalle) => ({
          id: detalle.productoId,
          nombre: detalle.producto?.nombre || "Producto desconocido",
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          tieneIGV: detalle.tipoAfectacionIGV === "10",
          unidadSeleccionada: {
            precioVenta: detalle.precioUnitario,
            unidadMedida: detalle.unidadMedida,
            factorConversion: 1,
          },
        }))
      );
      setBonificaciones(
        preventa.bonificaciones.map((bonif) => ({
          id: bonif.id,
          productoId: bonif.productoId,
          nombre: bonif.producto.nombre,
          cantidad: bonif.cantidad,
          unidadMedida: bonif.producto.unidadesMedida?.[0]?.unidadMedida.descripcion || "UN",
          createdAt: bonif.createdAt,
        }))
      );
    }
  }, [preventa]);

  // Función para calcular subtotales e IGV
  const calcularResumen = () => {
    let subtotalSinIGV = 0;
    let igvTotal = 0;

    productos.forEach((producto) => {
      const precioTotalProducto = producto.precioUnitario * producto.cantidad;

      if (producto.tieneIGV) {
        const baseImponible = precioTotalProducto / 1.18; // IGV 18%
        const igvProducto = precioTotalProducto - baseImponible;
        subtotalSinIGV += baseImponible;
        igvTotal += igvProducto;
      } else {
        const igvProducto = precioTotalProducto * 0.18; // 18% IGV
        subtotalSinIGV += precioTotalProducto;
        igvTotal += igvProducto;
      }
    });

    const total = subtotalSinIGV + igvTotal;
    return { subtotal: subtotalSinIGV, igv: igvTotal, total };
  };

  const resumen = calcularResumen();

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSeleccionarProducto = (producto: ProductoType) => {
    if (productos.some((p) => p.id === producto.id)) {
      setMensajeError("El producto ya está en la lista.");
      setTimeout(() => setMensajeError(null), 3000);
      return;
    }
    setProductoSeleccionado(producto);
    setUnidadElegida(producto.unidadesMedida[0]?.id || "");
  };

  const handleAgregarProducto = () => {
    if (!productoSeleccionado || !unidadElegida) return;

    const unidad = productoSeleccionado.unidadesMedida.find(
      (u) => u.id === unidadElegida
    );

    const nuevoProducto: Producto = {
      id: productoSeleccionado.id,
      nombre: productoSeleccionado.nombre,
      cantidad: 1,
      precioUnitario: unidad?.precioVentaBase || 0,
      tieneIGV: productoSeleccionado.tieneIGV || true,
      unidadSeleccionada: {
        precioVenta: unidad?.precioVentaBase || 0,
        unidadMedida: unidad?.unidadMedida.descripcion || "UN",
        factorConversion: unidad?.factorConversion || 1,
      },
    };

    setProductos((prev) => [...prev, nuevoProducto]);
    setBusquedaProducto("");
    setProductoSeleccionado(null);
    setUnidadElegida("");
  };

  const handleEliminarProducto = (productoId: string) => {
    setProductos((prev) => prev.filter((p) => p.id !== productoId));
  };

  const handleCantidadChange = (productoId: string, cantidad: number) => {
    setProductos((prev) =>
      prev.map((p) =>
        p.id === productoId ? { ...p, cantidad: Math.max(1, cantidad) } : p
      )
    );
  };

  const handleBonificacionCantidadChange = (productoId: string, cantidad: number) => {
    const cantidadAjustada = Math.max(0, cantidad);
    setBonificaciones((prev) => {
      const existe = prev.some((b) => b.productoId === productoId);
      if (existe) {
        if (cantidadAjustada === 0) {
          return prev.filter((b) => b.productoId !== productoId);
        }
        return prev.map((b) =>
          b.productoId === productoId ? { ...b, cantidad: cantidadAjustada } : b
        );
      } else if (cantidadAjustada > 0) {
        const producto = productosConBonificacion.find((p) => p.id === productoId);
        if (producto) {
          return [
            ...prev,
            {
              productoId: producto.id,
              nombre: producto.nombre,
              cantidad: cantidadAjustada,
              unidadMedida: producto.unidadesMedida[0]?.unidadMedida.descripcion || "UN",
            },
          ];
        }
      }
      return prev;
    });
  };

  const handleEliminarBonificacion = (productoId: string) => {
    setBonificaciones((prev) => prev.filter((b) => b.productoId !== productoId));
  };

  const handleSubmit = async (formData: FormData) => {
    if (!preventa) return;

    setIsSubmitting(true); // Activar el loader
    try {
      formData.append("preventaId", preventa.id);
      formData.append("productos", JSON.stringify(productos));
      formData.append("bonificaciones", JSON.stringify(bonificaciones));

      const result = await actualizarPreventa(formData);
      if (result.success) {
        onSave(result.preventa);
        onOpenChange(); // Cerrar el modal solo si tiene éxito
      } else {
        setMensajeError("Error al guardar los cambios");
        setTimeout(() => setMensajeError(null), 3000);
      }
    } catch (err) {
      setMensajeError("Error inesperado al actualizar la preventa");
      setTimeout(() => setMensajeError(null), 3000);
      console.error("Error en handleSubmit:", err);
    } finally {
      setIsSubmitting(false); // Desactivar el loader siempre, incluso si hay error
    }
  };

  return (
    <Modal
      isDismissable={false}
      isOpen={isOpen}
      scrollBehavior="inside"
      onOpenChange={onOpenChange}
      size="xl"
      className="max-h-[90vh]"
    >
      <ModalContent className="relative">
        {(onClose) => (
          <>
            <form action={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">Editar Venta</ModalHeader>
              <ModalBody className="max-h-[70vh] overflow-y-auto">
                <div className="flex flex-col gap-4">
                  <Input
                    label="Cliente"
                    name="cliente"
                    value={formData.cliente}
                    onChange={(e) => handleInputChange("cliente", e.target.value)}
                    isDisabled={isSubmitting} // Deshabilitar durante la actualización
                  />
                  <Input
                    label="Total"
                    type="number"
                    value={formData.total}
                    disabled
                  />
                  <Select
                    label="Estado"
                    name="estado"
                    value={formData.estado}
                    onChange={(e) => handleInputChange("estado", e.target.value)}
                    isDisabled={isSubmitting}
                  >
                    <SelectItem key="pendiente" value="pendiente">
                      Pendiente
                    </SelectItem>
                    <SelectItem key="pagado" value="pagado">
                      Pagado
                    </SelectItem>
                    <SelectItem key="cancelado" value="cancelado">
                      Cancelado
                    </SelectItem>
                  </Select>
                  <Select
                    label="Método de Pago"
                    name="metodoPago"
                    value={formData.metodoPago}
                    onChange={(e) => handleInputChange("metodoPago", e.target.value)}
                    isDisabled={isSubmitting}
                  >
                    <SelectItem key="efectivo" value="efectivo">
                      Efectivo
                    </SelectItem>
                    <SelectItem key="tarjeta" value="tarjeta">
                      Tarjeta
                    </SelectItem>
                    <SelectItem key="transferencia" value="transferencia">
                      Transferencia
                    </SelectItem>
                  </Select>

                  <Input
                    label="Buscar productos"
                    placeholder="Escribe para buscar..."
                    value={busquedaProducto}
                    onChange={(e) => {
                      setBusquedaProducto(e.target.value);
                      setBusqueda(e.target.value);
                    }}
                    isDisabled={isSubmitting}
                  />
                  {busquedaProducto && productosDisponibles.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border rounded">
                      {productosDisponibles.map((prod) => (
                        <div
                          key={prod.id}
                          className={`p-2 hover:bg-gray-100 cursor-pointer ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
                          onClick={() => handleSeleccionarProducto(prod)}
                        >
                          {prod.nombre}
                        </div>
                      ))}
                    </div>
                  )}
                  {loading && busquedaProducto && <p>Cargando productos...</p>}
                  {mensajeError && (
                    <p className="text-red-500 text-sm">{mensajeError}</p>
                  )}
                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        variant="shadow"
                        size="md"
                        color="danger"
                        className="w-full text-white font-semibold mt-2"
                        isDisabled={isSubmitting}
                      >
                        Ver Bonificaciones
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Bonificaciones"
                      closeOnSelect={false}
                      className="w-64 max-h-60 overflow-y-auto"
                      disabledKeys={isSubmitting ? productosConBonificacion.map(p => p.id) : []}
                    >
                      {productosConBonificacion.map((producto) => (
                        <DropdownItem
                          key={producto.id}
                          textValue={producto.nombre ?? ""}
                          className="py-2"
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="truncate flex-1">{producto.nombre ?? "Sin nombre"}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onClick={() => handleBonificacionCantidadChange(producto.id, (bonificaciones.find(b => b.productoId === producto.id)?.cantidad || 0) - 1)}
                                isDisabled={isSubmitting}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <Input
                                type="number"
                                min="0"
                                size="sm"
                                value={bonificaciones.find(b => b.productoId === producto.id)?.cantidad?.toString() || "0"}
                                onChange={(e) => handleBonificacionCantidadChange(producto.id, parseInt(e.target.value) || 0)}
                                className="w-12 text-center"
                                placeholder="0"
                                isDisabled={isSubmitting}
                              />
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onClick={() => handleBonificacionCantidadChange(producto.id, (bonificaciones.find(b => b.productoId === producto.id)?.cantidad || 0) + 1)}
                                isDisabled={isSubmitting}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>

                  {productoSeleccionado && (
                    <div className="flex flex-col gap-2">
                      <p>Selecciona la unidad para {productoSeleccionado.nombre}:</p>
                      <Select
                        label="Unidad de Medida"
                        value={unidadElegida}
                        onChange={(e) => setUnidadElegida(e.target.value)}
                        isDisabled={isSubmitting}
                      >
                        {productoSeleccionado.unidadesMedida.map((unidad) => (
                          <SelectItem key={unidad.id} value={unidad.id}>
                            {`${unidad.unidadMedida.descripcion} - $${unidad.precioVentaBase}`}
                          </SelectItem>
                        ))}
                      </Select>
                      <Button
                        color="primary"
                        onPress={handleAgregarProducto}
                        isDisabled={isSubmitting}
                      >
                        Agregar Producto
                      </Button>
                      <Button
                        color="danger"
                        variant="light"
                        onPress={() => setProductoSeleccionado(null)}
                        isDisabled={isSubmitting}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}

                  <Table aria-label="Productos de la preventa">
                    <TableHeader>
                      <TableColumn>Producto</TableColumn>
                      <TableColumn>Cantidad</TableColumn>
                      <TableColumn>Precio Unitario</TableColumn>
                      <TableColumn>Subtotal</TableColumn>
                      <TableColumn>Acciones</TableColumn>
                    </TableHeader>
                    <TableBody items={productos}>
                      {(producto) => (
                        <TableRow key={producto.id}>
                          <TableCell>{producto.nombre}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={producto.cantidad.toString()}
                              onChange={(e) =>
                                handleCantidadChange(producto.id, parseInt(e.target.value) || 1)
                              }
                              min="1"
                              className="w-20"
                              isDisabled={isSubmitting}
                            />
                          </TableCell>
                          <TableCell>
                            ${(producto.unidadSeleccionada?.precioVenta ?? producto.precioUnitario ?? 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            ${(producto.cantidad * (producto.unidadSeleccionada?.precioVenta ?? producto.precioUnitario ?? 0)).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              color="danger"
                              size="sm"
                              onPress={() => handleEliminarProducto(producto.id)}
                              isDisabled={isSubmitting}
                            >
                              Eliminar
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {bonificaciones.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-semibold mt-4">Bonificaciones</h3>
                      <div className="max-h-40 overflow-y-auto">
                        <Table aria-label="Bonificaciones de la preventa">
                          <TableHeader>
                            <TableColumn>Producto</TableColumn>
                            <TableColumn>Unidad de Medida</TableColumn>
                            <TableColumn>Cantidad</TableColumn>
                            <TableColumn>Acciones</TableColumn>
                          </TableHeader>
                          <TableBody items={bonificaciones}>
                            {(bonificacion) => (
                              <TableRow key={bonificacion.productoId}>
                                <TableCell>{bonificacion.nombre}</TableCell>
                                <TableCell>{bonificacion.unidadMedida}</TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={bonificacion.cantidad.toString()}
                                    onChange={(e) =>
                                      handleBonificacionCantidadChange(
                                        bonificacion.productoId,
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    min="0"
                                    className="w-20"
                                    isDisabled={isSubmitting}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    color="danger"
                                    size="sm"
                                    onPress={() => handleEliminarBonificacion(bonificacion.productoId)}
                                    isDisabled={isSubmitting}
                                  >
                                    Eliminar
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  <Card className="mt-4">
                    <CardBody className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span>Subtotal (sin IGV):</span>
                        <span>${resumen.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IGV (18%):</span>
                        <span>${resumen.igv.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${resumen.total.toFixed(2)}</span>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  isDisabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isDisabled={isSubmitting}
                  isLoading={isSubmitting} // Mostrar un pequeño loader en el botón también
                >
                  Guardar Cambios
                </Button>
              </ModalFooter>
            </form>

            {/* Overlay y Loader */}
            {isSubmitting && (
              <div className="absolute inset-0 bg-gray-600 bg-opacity-60 flex items-center justify-center z-50">
                <Spinner size="lg" color="white" label="Guardando cambios..." />
              </div>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}