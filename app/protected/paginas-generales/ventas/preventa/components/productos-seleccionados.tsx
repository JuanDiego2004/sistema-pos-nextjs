import { Button, Card, CardBody } from "@heroui/react";
import { Trash2, Minus, Plus } from "lucide-react";

interface Producto {
  id: string;
  nombre: string;
  cantidad: number;
  tieneIGV: boolean;
  imagen?: string;
  productoConBonificacion?: boolean;
  unidadSeleccionada?: {
    unidadMedidaId: string;
    precioVenta: number;
    factorConversion: number;
    descripcion: string;
  };
}

interface ProductosSeleccionadosProps {
  productos: Producto[];
  eliminarProducto: (id: string) => void;
  actualizarCantidad: (id: string, nuevaCantidad: number) => void;
  igvPorcentaje: number;
}

export default function ProductosSeleccionados({
  productos,
  eliminarProducto,
  actualizarCantidad,
  igvPorcentaje,
}: ProductosSeleccionadosProps) {
  if (productos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No hay productos seleccionados
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {productos.map((producto) => {
        const precioVenta = producto.unidadSeleccionada?.precioVenta || 0;
        const precioTotalProducto = precioVenta * producto.cantidad;
        let igvProducto = 0;
        let subtotalProducto = 0;
        let totalConIGV = 0;

        if (producto.tieneIGV) {
          totalConIGV = precioTotalProducto;
        } else {
          subtotalProducto = precioTotalProducto;
          igvProducto = (precioTotalProducto * igvPorcentaje) / 100;
          totalConIGV = subtotalProducto + igvProducto;
        }

        return (
          <Card key={producto.id} className="w-full">
            <CardBody className="flex flex-row items-center space-x-3">
              <div className="w-[10vh] h-24 flex-shrink-0">
                <img
                  src={producto.imagen || "/placeholder.jpg"}
                  alt={producto.nombre}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              <div className="w-full">
                <h3 className="text-lg font-semibold">{producto.nombre}</h3>
                <p className="text-sm text-gray-500">
                  Precio Unitario: ${precioVenta.toFixed(2)}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <div className="space-y-1">
                    {producto.tieneIGV ? (
                      <p className="text-sm text-gray-600">
                        Total: ${totalConIGV.toFixed(2)}
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-500">
                          Subtotal: ${subtotalProducto.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          IGV: ${igvProducto.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: ${totalConIGV.toFixed(2)}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Button
                        isIconOnly
                        variant="light"
                        onClick={() =>
                          actualizarCantidad(
                            producto.id,
                            Math.max(1, producto.cantidad - 1)
                          )
                        }
                      >
                        <Minus className="w-5 h-5" />
                      </Button>
                      <span className="font-medium">{producto.cantidad}</span>
                      <Button
                        isIconOnly
                        variant="light"
                        onClick={() =>
                          actualizarCantidad(producto.id, producto.cantidad + 1)
                        }
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                    <Button
                      isIconOnly
                      color="danger"
                      variant="light"
                      onClick={() => eliminarProducto(producto.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}