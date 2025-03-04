import { Select, SelectItem, Chip, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Input } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { Plus, Minus } from "lucide-react";

interface Producto {
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
  productosSeleccionados: Producto[];
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

export default function ResumenVentaMobile({
  productosSeleccionados,
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
  const [mostrarNotas, setMostrarNotas] = useState(false);

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

  const productosConBonificacion = productosSeleccionados.filter((p) => p.productoConBonificacion);

  return (
    <div className="w-full space-y-4">
      {/* Selección de tipo de venta y método de pago */}
      <div className="flex flex-wrap gap-4 justify-between">
        <Select
          placeholder="Tipo Venta"
          className="w-[130px]"
          color="primary"
          value={tipoVentaSeleccionada}
          onChange={(e) => onTipoVentaChange(e.target.value)}
        >
          {opciones.map((opcion) => (
            <SelectItem key={opcion.key}>{opcion.label}</SelectItem>
          ))}
        </Select>
        <Select
          placeholder="Método de Pago"
          className="w-[150px]"
          value={metodoPagoSeleccionado}
          onChange={(e) => onMetodoPagoChange(e.target.value)}
        >
          {metodosPago.map((metodo) => (
            <SelectItem key={metodo.key}>{metodo.label}</SelectItem>
          ))}
        </Select>
      </div>

      {/* Dropdown para bonificaciones */}
      {productosConBonificacion.length > 0 && (
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
            className="w-[90vw] max-h-60 overflow-y-auto"
          >
            {productosConBonificacion.map((producto) => (
              <DropdownItem
                key={producto.id}
                textValue={producto.nombre}
                className="py-2"
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="truncate flex-1 text-sm">{producto.nombre}</span>
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
      )}

      {/* Botón para mostrar notas */}
      <Button
        variant="ghost"
        className="w-full text-left"
        onPress={() => setMostrarNotas(!mostrarNotas)}
      >
        {mostrarNotas ? "Ocultar Notas" : "Añadir Notas"}
      </Button>

      {/* Campo de notas (opcional) */}
      {mostrarNotas && (
        <textarea
          rows={3}
          value={notas}
          onChange={(e) => onNotasChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          placeholder="Escribe tus notas aquí..."
        />
      )}

      {/* Resumen de la venta */}
      <div className="bg-gray-100 p-4 rounded-md space-y-2">
        <p className="text-sm font-medium">
          Subtotal: <span className="font-bold">${calcularResumen.subtotal.toFixed(2)}</span>
        </p>
        <p className="text-sm font-medium">
          IGV Total: <span className="font-bold">${calcularResumen.igvTotal.toFixed(2)}</span>
        </p>
        <p className="text-sm font-medium">
          Operación Gravada: <span className="font-bold">${calcularResumen.operacionGravada.toFixed(2)}</span>
        </p>
        <Chip color="primary" className="w-full flex justify-between">
          Total: <span className="font-bold">${calcularResumen.total.toFixed(2)}</span>
        </Chip>
      </div>
    </div>
  );
}