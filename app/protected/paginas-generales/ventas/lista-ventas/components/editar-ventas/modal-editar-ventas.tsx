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
} from "@heroui/react";
import { Preventa } from "@/app/utils/types";
import { usarProductos } from "@/app/hooks/usar-producto";

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
  createdAt: any;
  id?: string; // Opcional porque puede no existir al crear una nueva
  productoId: string;
  nombre: string;
  cantidad: number;
  unidadMedida: string;
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
  const [bonificaciones, setBonificaciones] = useState<Bonificacion[]>([]); // Estado para bonificaciones
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any | null>(null);
  const [unidadElegida, setUnidadElegida] = useState<string>("");

  const { productos: productosDisponibles, handleSearchChange, isLoading } = usarProductos({
    limit: 5,
  });

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
          createdAt: bonif.createdAt,
          id: bonif.id,
          productoId: bonif.productoId,
          nombre: bonif.producto.nombre,
          cantidad: bonif.cantidad,
          unidadMedida: bonif.producto.unidadesMedida?.[0]?.unidadMedida.descripcion || "UN", // Asumimos la primera unidad por defecto
        }))
      );
    }
  }, [preventa]);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSeleccionarProducto = (producto: any) => {
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
      (u: any) => u.id === unidadElegida
    );

    const nuevoProducto: Producto = {
      id: productoSeleccionado.id,
      nombre: productoSeleccionado.nombre,
      cantidad: 1,
      precioUnitario: unidad.precioVentaBase,
      tieneIGV: productoSeleccionado.tieneIGV || true,
      unidadSeleccionada: {
        precioVenta: unidad.precioVentaBase,
        unidadMedida: unidad.unidadMedida.descripcion,
        factorConversion: unidad.factorConversion || 1,
      },
    };

    setProductos((prev) => [...prev, nuevoProducto]);

    // Si tiene bonificación, agregarlo a la tabla de bonificaciones
    if (productoSeleccionado.productoConBonificacion) {
      const nuevaBonificacion: Bonificacion = {
        productoId: productoSeleccionado.id,
        nombre: productoSeleccionado.nombre,
        cantidad: 1, // Cantidad inicial editable
        unidadMedida: unidad.unidadMedida.descripcion,
        createdAt: undefined
      };
      setBonificaciones((prev) => [...prev, nuevaBonificacion]);
    }

    setBusquedaProducto("");
    setProductoSeleccionado(null);
    setUnidadElegida("");
  };

  const handleEliminarProducto = (productoId: string) => {
    setProductos((prev) => prev.filter((p) => p.id !== productoId));
    // También eliminar de bonificaciones si existe
    setBonificaciones((prev) => prev.filter((b) => b.productoId !== productoId));
  };

  const handleCantidadChange = (productoId: string, cantidad: number) => {
    setProductos((prev) =>
      prev.map((p) =>
        p.id === productoId ? { ...p, cantidad: Math.max(1, cantidad) } : p
      )
    );
  };

  const handleBonificacionCantidadChange = (productoId: string, cantidad: number) => {
    setBonificaciones((prev) =>
      prev.map((b) =>
        b.productoId === productoId ? { ...b, cantidad: Math.max(0, cantidad) } : b
      )
    );
  };

  const handleEliminarBonificacion = (productoId: string) => {
    setBonificaciones((prev) => prev.filter((b) => b.productoId !== productoId));
  };

  const recalcularTotales = () => {
    const subtotal = productos.reduce(
      (sum, p) => sum + (p.unidadSeleccionada?.precioVenta ?? p.precioUnitario ?? 0) * p.cantidad,
      0
    );
    const igv = productos.reduce(
      (sum, p) => sum + (p.tieneIGV ? (p.unidadSeleccionada?.precioVenta ?? p.precioUnitario ?? 0) * p.cantidad * 0.18 : 0),
      0
    );
    const total = subtotal + igv;
    return { subtotal, igv, total };
  };

  const handleSave = () => {
    if (!preventa) return;

    const { subtotal, igv, total } = recalcularTotales();
    const updatedPreventa: Preventa = {
      ...preventa,
      cliente: {
        ...preventa.cliente,
        id: preventa.cliente?.id || "",
        nombre: formData.cliente,
        tipoDocumento: preventa.cliente?.tipoDocumento || "DNI",
        numeroDocumento: preventa.cliente?.numeroDocumento || "00000000",
      },
      total,
      estado: formData.estado,
      metodoPago: formData.metodoPago,
      subtotal,
      igv,
      baseImponible: subtotal,
      valorVenta: subtotal,
      impuesto: igv,
      descuento: preventa.descuento,
      tipoComprobante: preventa.tipoComprobante,
      notas: preventa.notas,
      detallePreventas: productos.map((p) => ({
        productoId: p.id,
        unidadMedida: p.unidadSeleccionada?.unidadMedida || "UN",
        cantidad: p.cantidad,
        precioUnitario: p.unidadSeleccionada?.precioVenta ?? p.precioUnitario ?? 0,
        total: p.cantidad * (p.unidadSeleccionada?.precioVenta ?? p.precioUnitario ?? 0),
        tipoAfectacionIGV: p.tieneIGV ? "10" : "20",
        descuento: 0,
        id: preventa.detallePreventas.find((d) => d.productoId === p.id)?.id || undefined,
        producto: { nombre: p.nombre },
      })),
      bonificaciones: bonificaciones.map((b) => ({
        id: b.id, // Mantener el ID si existe (para edición)
        productoId: b.productoId,
        cantidad: b.cantidad,
        fecha: new Date().toISOString(), // Fecha actual para nuevas bonificaciones
        createdAt: b.id ? b.createdAt : new Date().toISOString(), // Mantener si existe
        updatedAt: new Date().toISOString(),
        producto: { nombre: b.nombre },
      })),
    };

    onSave(updatedPreventa);
    onOpenChange();
  };

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" onOpenChange={onOpenChange} size="xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Editar Venta</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <Input
                  label="Cliente"
                  value={formData.cliente}
                  onChange={(e) => handleInputChange("cliente", e.target.value)}
                />
                <Input
                  label="Total"
                  type="number"
                  value={formData.total}
                  disabled
                />
                <Select
                  label="Estado"
                  value={formData.estado}
                  onChange={(e) => handleInputChange("estado", e.target.value)}
                >
                  <SelectItem key="pendiente" value="pendiente">Pendiente</SelectItem>
                  <SelectItem key="pagado" value="pagado">Pagado</SelectItem>
                  <SelectItem key="cancelado" value="cancelado">Cancelado</SelectItem>
                </Select>
                <Select
                  label="Método de Pago"
                  value={formData.metodoPago}
                  onChange={(e) => handleInputChange("metodoPago", e.target.value)}
                >
                  <SelectItem key="efectivo" value="efectivo">Efectivo</SelectItem>
                  <SelectItem key="tarjeta" value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem key="transferencia" value="transferencia">Transferencia</SelectItem>
                </Select>

                <Input
                  label="Buscar productos"
                  placeholder="Escribe para buscar..."
                  value={busquedaProducto}
                  onChange={(e) => {
                    setBusquedaProducto(e.target.value);
                    handleSearchChange(e.target.value);
                  }}
                />
                {busquedaProducto && productosDisponibles.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border rounded">
                    {productosDisponibles.map((prod) => (
                      <div
                        key={prod.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSeleccionarProducto(prod)}
                      >
                        {prod.nombre}
                      </div>
                    ))}
                  </div>
                )}
                {isLoading && busquedaProducto && <p>Cargando productos...</p>}
                {mensajeError && (
                  <p className="text-red-500 text-sm">{mensajeError}</p>
                )}

                {productoSeleccionado && (
                  <div className="flex flex-col gap-2">
                    <p>Selecciona la unidad para {productoSeleccionado.nombre}:</p>
                    <Select
                      label="Unidad de Medida"
                      value={unidadElegida}
                      onChange={(e) => setUnidadElegida(e.target.value)}
                    >
                      {productoSeleccionado.unidadesMedida.map((unidad: any) => (
                        <SelectItem key={unidad.id} value={unidad.id}>
                          {`${unidad.unidadMedida.descripcion} - $${unidad.precioVentaBase}`}
                        </SelectItem>
                      ))}
                    </Select>
                    <Button color="primary" onPress={handleAgregarProducto}>
                      Agregar Producto
                    </Button>
                    <Button
                      color="danger"
                      variant="light"
                      onPress={() => setProductoSeleccionado(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}

                {/* Tabla de Productos */}
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
                          >
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Tabla de Bonificaciones */}
                {bonificaciones.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mt-4">Bonificaciones</h3>
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
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                color="danger"
                                size="sm"
                                onPress={() => handleEliminarBonificacion(bonificacion.productoId)}
                              >
                                Eliminar
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button color="primary" onPress={handleSave}>
                Guardar Cambios
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}