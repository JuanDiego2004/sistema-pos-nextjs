import { Card, CardBody, CardHeader, Chip, Divider, Select, SelectItem, Textarea, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { useMemo, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { Producto } from "@/app/utils/types";

interface ProductoSeleccionado {
  id: string;
  nombre: string;
  cantidad: number;
  tieneIGV: boolean;
  precioUnitario?: number;
  productoConBonificacion?: boolean;
  unidadSeleccionada?: {
    precioVenta: number;
    factorConversion: number;
    unidadMedidaId: string;
    descripcion: string;
  };
}

interface ResumenVentaProps {
  productosSeleccionados: ProductoSeleccionado[];
  productosConBonificacion: Producto[];
  igvPorcentaje: number;
  tipoVentaSeleccionada: string;
  onTipoVentaChange: (tipoVenta: string) => void;
  metodoPagoSeleccionado: string;
  onMetodoPagoChange: (metodoPago: string) => void;
  notas: string;
  onNotasChange: (notas: string) => void;
  onCalcularResumenChange: (resumen: {
    subtotal: number;
    igvTotal: number;
    operacionGravada: number;
    total: number;
  }) => void;
  cantidadesBonificadas: { [key: string]: number };
  onCantidadBonificacionChange: (id: string, cantidadBonificada: number) => void;
}

export const opciones = [
  { key: "factura", label: "Factura" },
  { key: "nota", label: "Nota de Venta" },
  { key: "boleta", label: "Boleta" },
  { key: "notacredito", label: "Nota de Crédito" },
];

export const metodosPago = [
  { key: "efectivo", label: "Efectivo" },
  { key: "tarjeta", label: "Tarjeta" },
  { key: "transferencia", label: "Transferencia Bancaria" },
];

function ResumenVenta({
  productosSeleccionados,
  productosConBonificacion,
  igvPorcentaje,
  tipoVentaSeleccionada,
  onTipoVentaChange,
  metodoPagoSeleccionado,
  onMetodoPagoChange,
  notas,
  onNotasChange,
  onCalcularResumenChange,
  cantidadesBonificadas,
  onCantidadBonificacionChange,
}: ResumenVentaProps) {
  const calcularResumen = useMemo(() => {
    let subtotalSinIGV = 0;
    let igvTotal = 0;
    let operacionGravada = 0;

    productosSeleccionados.forEach((producto) => {
      const precioUnitario = producto.precioUnitario ?? producto.unidadSeleccionada?.precioVenta ?? 0;
      const precioTotalProducto = precioUnitario * producto.cantidad;

      if (producto.tieneIGV) {
        const baseGravada = precioTotalProducto / (1 + igvPorcentaje / 100);
        const igvProducto = precioTotalProducto - baseGravada;
        operacionGravada += baseGravada;
        igvTotal += igvProducto;
      } else {
        const igvProducto = (precioTotalProducto * igvPorcentaje) / 100;
        subtotalSinIGV += precioTotalProducto;
        igvTotal += igvProducto;
      }
    });

    const subtotal = subtotalSinIGV + operacionGravada;
    const total = subtotal + igvTotal;

    return { subtotal, igvTotal, operacionGravada, total };
  }, [productosSeleccionados, igvPorcentaje]);

  useEffect(() => {
    onCalcularResumenChange(calcularResumen);
  }, [calcularResumen, onCalcularResumenChange]);
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="flex flex-col gap-4 p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Tipo de Venta"
            placeholder="Selecciona tipo"
            size="sm"
            color="primary"
            value={tipoVentaSeleccionada}
            onChange={(e) => onTipoVentaChange(e.target.value)}
            className="w-full"
          >
            {opciones.map((opcion) => (
              <SelectItem key={opcion.key} value={opcion.key}>
                {opcion.label}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Método de Pago"
            placeholder="Selecciona método"
            size="sm"
            value={metodoPagoSeleccionado}
            onChange={(e) => onMetodoPagoChange(e.target.value)}
            className="w-full"
          >
            {metodosPago.map((metodo) => (
              <SelectItem key={metodo.key} value={metodo.key}>
                {metodo.label}
              </SelectItem>
            ))}
          </Select>
        </div>
        {productosConBonificacion.length > 0 && (
          <div className="mt-2 w-full">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="shadow"
                  size="md"
                  color="danger"
                  className="w-full text-white font-semibold"
                >
                  Bonificaciones
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Bonificaciones"
                closeOnSelect={false}
                className="w-64 max-h-60 overflow-y-auto"
              >
                {productosConBonificacion.map((producto) => (
                  <DropdownItem
                    key={producto.id}
                    textValue={producto.nombre}
                    className="py-2"
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="truncate flex-1">{producto.nombre}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onClick={() => onCantidadBonificacionChange(producto.id, Math.max(0, (cantidadesBonificadas[producto.id] || 0) - 1))}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          size="sm"
                          value={cantidadesBonificadas[producto.id]?.toString() || "0"}
                          onChange={(e) => onCantidadBonificacionChange(producto.id, parseInt(e.target.value) || 0)}
                          className="w-12 text-center"
                          placeholder="0"
                        />
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onClick={() => onCantidadBonificacionChange(producto.id, (cantidadesBonificadas[producto.id] || 0) + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        )}
      </CardHeader>
      <Divider className="my-2" />
      <CardBody className="p-4 space-y-6">
        <Textarea
          label="Notas"
          placeholder="Escribe tus notas aquí..."
          value={notas}
          onChange={(e) => onNotasChange(e.target.value)}
          minRows={3}
          className="w-full"
          variant="bordered"
        />
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium">${calcularResumen.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>IGV Total</span>
            <span className="font-medium">${calcularResumen.igvTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Op. Gravada</span>
            <span className="font-medium">${calcularResumen.operacionGravada.toFixed(2)}</span>
          </div>
          <Divider />
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold">Total</span>
            <Chip color="primary" variant="shadow" className="text-base font-semibold">
              ${calcularResumen.total.toFixed(2)}
            </Chip>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default ResumenVenta;