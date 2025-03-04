"use client";
import { useState, useEffect } from "react";
import { Select, SelectItem, Input, Button, Tabs, Tab } from "@heroui/react";
import { ProductoUnidadMedida, UnidadMedida, ProductoAlmacenUnidadMedida } from "@/app/utils/types";
import { v4 as uuidv4 } from "uuid";

interface UnidadesMedidaSectionProps {
  unidadesMedida: ProductoUnidadMedida[];
  almacenes: Array<{ id: string; nombre: string }>;
  almacenesProducto: ProductoAlmacenUnidadMedida[];
  onChange: (unidades: ProductoUnidadMedida[], almacenesProducto: ProductoAlmacenUnidadMedida[]) => void;
}

export default function RegistroUnidades({
  unidadesMedida: initialUnidadesMedida,
  almacenes,
  almacenesProducto: initialAlmacenesProducto,
  onChange,
}: UnidadesMedidaSectionProps) {
  const [unidadesMedida, setUnidadesMedida] = useState<ProductoUnidadMedida[]>(
    initialUnidadesMedida.length > 0
      ? initialUnidadesMedida
      : [
        {
          id: uuidv4(),
          unidadMedidaId: "",
          factorConversion: 1,
          esUnidadPrincipal: true,
          precioCompraBase: 0,
          precioVentaBase: 0,
          productoId: "",
          unidadMedida: {
            id: "",
            codigo: "",
            descripcion: "",
            unidadMedida: {
              id: "",
              codigo: "",
              descripcion: "",
            },
          },
          preciosPorAlmacen: [], // Agregar esta propiedad opcional para completar el tipo
        },
      ]
  );
  const [almacenesProducto, setAlmacenesProducto] = useState<ProductoAlmacenUnidadMedida[]>(
    initialAlmacenesProducto || []
  );
  const [listaUnidadesMedida, setListaUnidadesMedida] = useState<UnidadMedida[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("general");

  useEffect(() => {
    const fetchUnidadesMedida = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/unidadesmedida");
        if (!response.ok) throw new Error("Error al obtener las unidades de medida");
        const data: UnidadMedida[] = await response.json();
        setListaUnidadesMedida(data);
      } catch (error) {
        console.error("Error cargando unidades de medida:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUnidadesMedida();
  }, []);

  // Sincronizar automáticamente los stocks de unidades secundarias
  useEffect(() => {
    if (almacenes.length && unidadesMedida.length > 1) {
      const unidadPrincipal = unidadesMedida[0];
      const unidadesSecundarias = unidadesMedida.slice(1);
      let actualizados = false;
      
      const nuevasAlmacenesProducto = [...almacenesProducto];

      // Para cada almacén
      almacenes.forEach(almacen => {
        // Buscar el stock de la unidad principal para este almacén
        const almacenPrincipal = almacenesProducto.find(
          ap => ap.unidadMedidaId === unidadPrincipal.unidadMedidaId && ap.almacenId === almacen.id
        );
        
        if (almacenPrincipal) {
          const stockPrincipal = almacenPrincipal.stock;
          
          // Para cada unidad secundaria
          unidadesSecundarias.forEach(unidad => {
            // Calcular el stock basado en el factor de conversión
            const stockCalculado = Number((stockPrincipal * unidad.factorConversion).toFixed(2));
            
            // Buscar si ya existe una entrada para esta unidad y almacén
            const index = nuevasAlmacenesProducto.findIndex(
              ap => ap.unidadMedidaId === unidad.unidadMedidaId && ap.almacenId === almacen.id
            );
            
            if (index === -1) {
              // Si no existe, crear una nueva entrada
              nuevasAlmacenesProducto.push({
                id: uuidv4(),
                productoId: unidadPrincipal.productoId || "",
                unidadMedidaId: unidad.unidadMedidaId,
                almacenId: almacen.id,
                stock: stockCalculado,
                precioCompra: unidad.precioCompraBase,
                precioVenta: unidad.precioVentaBase,
                almacen: almacen,
                unidadMedida: listaUnidadesMedida.find(um => um.id === unidad.unidadMedidaId) || {
                  id: unidad.unidadMedidaId,
                  codigo: "",
                  descripcion: "",
                },
              });
              actualizados = true;
            }
          });
        }
      });
      
      if (actualizados) {
        setAlmacenesProducto(nuevasAlmacenesProducto);
        onChange(unidadesMedida, nuevasAlmacenesProducto);
      }
    }
  }, [almacenesProducto, unidadesMedida, almacenes, listaUnidadesMedida, onChange]);

  const calcularValoresSecundarios = (unidades: ProductoUnidadMedida[]) => {
    const unidadPrincipal = unidades[0];
    return unidades.map((unidad, index) => {
      if (index === 0) return unidad;
      return {
        ...unidad,
        precioCompraBase: Number((unidadPrincipal.precioCompraBase / unidad.factorConversion).toFixed(2)),
        precioVentaBase: Number((unidadPrincipal.precioVentaBase / unidad.factorConversion).toFixed(2)),
      };
    });
  };

  const agregarUnidadMedida = () => {
    const nuevasUnidades = [
      ...unidadesMedida,
      {
        id: uuidv4(),
        unidadMedidaId: "",
        factorConversion: 1,
        esUnidadPrincipal: false,
        precioCompraBase: 0,
        precioVentaBase: 0,
        productoId: "",
        unidadMedida: { id: "", codigo: "", descripcion: "", unidadMedida: { id: "", codigo: "", descripcion: "" } },
      },
    ];
    const unidadesActualizadas = calcularValoresSecundarios(nuevasUnidades);
    setUnidadesMedida(unidadesActualizadas);
    onChange(unidadesActualizadas, almacenesProducto);
  };

  const actualizarUnidadMedida = (
    index: number,
    campo: keyof ProductoUnidadMedida,
    valor: any
  ) => {
    const nuevasUnidades = [...unidadesMedida];
    nuevasUnidades[index] = {
      ...nuevasUnidades[index],
      [campo]:
        campo === "unidadMedidaId"
          ? valor
          : campo === "factorConversion" ||
            campo === "precioCompraBase" ||
            campo === "precioVentaBase"
          ? parseFloat(valor) || 0
          : valor,
    };
    const unidadesActualizadas = calcularValoresSecundarios(nuevasUnidades);
    setUnidadesMedida(unidadesActualizadas);
    
    // Si se cambia el factor de conversión, actualizar también los stocks
    if (campo === "factorConversion" && index > 0) {
      sincronizarStocksUnidadesSecundarias(nuevasUnidades);
    } else {
      onChange(unidadesActualizadas, almacenesProducto);
    }
  };

  // Función para sincronizar stocks cuando cambian factores de conversión
  const sincronizarStocksUnidadesSecundarias = (unidades: ProductoUnidadMedida[]) => {
    const unidadPrincipal = unidades[0];
    const nuevasAlmacenesProducto = [...almacenesProducto];
    
    almacenes.forEach(almacen => {
      const almacenPrincipal = nuevasAlmacenesProducto.find(
        ap => ap.unidadMedidaId === unidadPrincipal.unidadMedidaId && ap.almacenId === almacen.id
      );
      
      if (almacenPrincipal) {
        const stockPrincipal = almacenPrincipal.stock;
        
        unidades.slice(1).forEach(unidad => {
          const stockCalculado = Number((stockPrincipal * unidad.factorConversion).toFixed(2));
          const index = nuevasAlmacenesProducto.findIndex(
            ap => ap.unidadMedidaId === unidad.unidadMedidaId && ap.almacenId === almacen.id
          );
          
          if (index === -1) {
            // Crear nueva entrada
            nuevasAlmacenesProducto.push({
              id: uuidv4(),
              productoId: unidadPrincipal.productoId || "",
              unidadMedidaId: unidad.unidadMedidaId,
              almacenId: almacen.id,
              stock: stockCalculado,
              precioCompra: unidad.precioCompraBase,
              precioVenta: unidad.precioVentaBase,
              almacen: almacen,
              unidadMedida: listaUnidadesMedida.find(um => um.id === unidad.unidadMedidaId) || {
                id: unidad.unidadMedidaId,
                codigo: "",
                descripcion: "",
              },
            });
          } else {
            // Actualizar stock existente
            nuevasAlmacenesProducto[index] = {
              ...nuevasAlmacenesProducto[index],
              stock: stockCalculado
            };
          }
        });
      }
    });
    
    setAlmacenesProducto(nuevasAlmacenesProducto);
    onChange(unidades, nuevasAlmacenesProducto);
  };

  const eliminarUnidadMedida = (index: number) => {
    const nuevasUnidades = [...unidadesMedida];
    const unidadEliminada = nuevasUnidades[index];
    nuevasUnidades.splice(index, 1);
    const unidadesActualizadas = calcularValoresSecundarios(nuevasUnidades);
    
    // Eliminar también los registros de almacén asociados a esta unidad
    const nuevasAlmacenesProducto = almacenesProducto.filter(
      ap => ap.unidadMedidaId !== unidadEliminada.unidadMedidaId
    );
    
    setUnidadesMedida(unidadesActualizadas);
    setAlmacenesProducto(nuevasAlmacenesProducto);
    onChange(unidadesActualizadas, nuevasAlmacenesProducto);
  };

  const actualizarPrecioPorAlmacen = (
    unidadId: string,
    almacenId: string,
    campo: "stock" | "precioCompra" | "precioVenta",
    valor: number
  ) => {
    const nuevasAlmacenesProducto = [...almacenesProducto];
    const unidadPrincipal = unidadesMedida.find(u => u.esUnidadPrincipal);
    const unidadActual = unidadesMedida.find((um) => um.unidadMedidaId === unidadId);
  
    // Buscar o crear registro para la unidad actual
    let index = nuevasAlmacenesProducto.findIndex(
      (ap) => ap.unidadMedidaId === unidadId && ap.almacenId === almacenId
    );
  
    if (index === -1) {
      const precioCompraBase = unidadActual?.esUnidadPrincipal 
        ? unidadActual.precioCompraBase 
        : (unidadPrincipal?.precioCompraBase ?? 0) / (unidadActual?.factorConversion || 1);
      const precioVentaBase = unidadActual?.esUnidadPrincipal 
        ? unidadActual.precioVentaBase 
        : unidadPrincipal?.precioVentaBase ?? 0  / (unidadActual?.factorConversion || 1);
  
      nuevasAlmacenesProducto.push({
        id: uuidv4(),
        productoId: unidadesMedida[0].productoId || "",
        unidadMedidaId: unidadId,
        almacenId,
        stock: campo === "stock" ? valor : 0,
        precioCompra: campo === "precioCompra" ? valor : precioCompraBase || 0,
        precioVenta: campo === "precioVenta" ? valor : precioVentaBase || 0,
        almacen: almacenes.find((a) => a.id === almacenId) || { id: almacenId, nombre: "" },
        unidadMedida: listaUnidadesMedida.find((um) => um.id === unidadId) || {
          id: unidadId,
          codigo: "",
          descripcion: "",
        },
      });
      index = nuevasAlmacenesProducto.length - 1;
    } else {
      nuevasAlmacenesProducto[index] = {
        ...nuevasAlmacenesProducto[index],
        [campo]: valor,
      };
    }
  
    // Si se actualiza la unidad principal, recalcular secundarias
    if (unidadActual?.esUnidadPrincipal) {
      unidadesMedida.forEach((unidad) => {
        if (!unidad.esUnidadPrincipal && unidad.unidadMedidaId) {
          const factorConversion = unidad.factorConversion || 1;
          const indexSecundario = nuevasAlmacenesProducto.findIndex(
            (ap) => ap.unidadMedidaId === unidad.unidadMedidaId && ap.almacenId === almacenId
          );
  
          if (campo === "stock") {
            const stockCalculado = Number((valor * factorConversion).toFixed(2));
            if (indexSecundario !== -1) {
              nuevasAlmacenesProducto[indexSecundario].stock = stockCalculado;
            }
          } else {
            const precioCalculado = Number((valor / factorConversion).toFixed(2));
            if (indexSecundario === -1) {
              nuevasAlmacenesProducto.push({
                id: uuidv4(),
                productoId: unidadesMedida[0].productoId || "",
                unidadMedidaId: unidad.unidadMedidaId,
                almacenId,
                stock: 0,
                precioCompra: campo === "precioCompra" ? precioCalculado : unidad.precioCompraBase,
                precioVenta: campo === "precioVenta" ? precioCalculado : unidad.precioVentaBase,
                almacen: almacenes.find((a) => a.id === almacenId) || { id: almacenId, nombre: "" },
                unidadMedida: listaUnidadesMedida.find((um) => um.id === unidad.unidadMedidaId) || {
                  id: unidad.unidadMedidaId,
                  codigo: "",
                  descripcion: "",
                },
              });
            } else {
              nuevasAlmacenesProducto[indexSecundario][campo] = precioCalculado;
            }
          }
        }
      });
    }
  
    setAlmacenesProducto(nuevasAlmacenesProducto);
    onChange(unidadesMedida, nuevasAlmacenesProducto);
  };

  const getValorPorAlmacen = (
    unidadId: string,
    almacenId: string,
    campo: "stock" | "precioCompra" | "precioVenta"
  ): number => {
    const unidad = unidadesMedida.find((um) => um.unidadMedidaId === unidadId);
    const unidadPrincipal = unidadesMedida.find(u => u.esUnidadPrincipal);
  
    // Buscar registro explícito
    const almProd = almacenesProducto.find(
      (ap) => ap.unidadMedidaId === unidadId && ap.almacenId === almacenId
    );
    if (almProd) {
      return almProd[campo];
    }
  
    // Si no hay registro
    if (!unidad || !unidadPrincipal) {
      return 0; // No hay datos suficientes
    }
  
    // Obtener datos de la unidad principal para este almacén
    const almProdPrincipal = almacenesProducto.find(
      (ap) => ap.unidadMedidaId === unidadPrincipal.unidadMedidaId && ap.almacenId === almacenId
    );
  
    const factorConversion = unidad.factorConversion || 1;
  
    if (campo === "stock") {
      const stockPrincipal = almProdPrincipal ? almProdPrincipal.stock : 0;
      return unidad.esUnidadPrincipal 
        ? stockPrincipal 
        : Number((stockPrincipal * factorConversion).toFixed(2));
    } else {
      // Precios: usar precio del almacén principal si existe, si no, el base
      const precioPrincipal = almProdPrincipal 
        ? almProdPrincipal[campo]
        : (campo === "precioCompra" 
            ? unidadPrincipal.precioCompraBase 
            : unidadPrincipal.precioVentaBase);
      
      return unidad.esUnidadPrincipal 
        ? precioPrincipal 
        : Number((precioPrincipal / factorConversion).toFixed(2));
    }
  };

  if (loading) return <div>Cargando unidades de medida...</div>;

  return (
    <div className="space-y-6 light:bg-white dark:bg-black light:text-black dark:text-white">
      <Tabs
        aria-label="Unidades de Medida"
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
      >
        <Tab key="general" title="Configuración General">
          <div className="border border-gray-600 p-4 rounded-lg mt-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Unidad Principal (Base)
            </h3>
            <div className="flex gap-4 items-center">
              <Select
                className="max-w-xs"
                label="Unidad Base"
                placeholder="Selecciona una unidad"
                selectedKeys={
                  unidadesMedida[0]?.unidadMedidaId
                    ? [unidadesMedida[0].unidadMedidaId]
                    : []
                }
                onChange={(e) =>
                  actualizarUnidadMedida(0, "unidadMedidaId", e.target.value || "")
                }
              >
                {listaUnidadesMedida.map((unidadMedida) => (
                  <SelectItem
                    key={unidadMedida.id}
                    value={unidadMedida.id}
                    className="dark:text-gray-300"
                  >
                    {unidadMedida.descripcion}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="flex gap-4 items-center mt-4">
              <Input
                type="number"
                step="0.01"
                label="Precio compra base"
                value={unidadesMedida[0]?.precioCompraBase.toFixed(2) || "0"}
                min={0}
                onChange={(e) =>
                  actualizarUnidadMedida(0, "precioCompraBase", e.target.value || "0")
                }
                className="w-24"
              />
              <Input
                type="number"
                step="0.01"
                label="Precio venta base"
                value={unidadesMedida[0]?.precioVentaBase.toFixed(2) || "0"}
                min={0}
                onChange={(e) =>
                  actualizarUnidadMedida(0, "precioVentaBase", e.target.value || "0")
                }
                className="w-24"
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Unidades Secundarias
            </h3>
            {unidadesMedida.slice(1).map((unidad, index) => (
              <div key={unidad.id} className="mb-4 pb-4 border-b border-gray-200">
                <Select
                  className="max-w-xs"
                  label={`Unidad ${index + 2}`}
                  placeholder="Selecciona una unidad"
                  selectedKeys={unidad.unidadMedidaId ? [unidad.unidadMedidaId] : []}
                  onChange={(e) =>
                    actualizarUnidadMedida(index + 1, "unidadMedidaId", e.target.value || "")
                  }
                >
                  {listaUnidadesMedida.map((unidadMedida) => (
                    <SelectItem
                      key={unidadMedida.id}
                      value={unidadMedida.id}
                      className="dark:text-gray-300"
                    >
                      {unidadMedida.descripcion}
                    </SelectItem>
                  ))}
                </Select>

                <div className="flex justify-between items-center gap-2 mt-5">
                  <Input
                    type="number"
                    step="0.01"
                    label="Precio compra base"
                    value={unidad.precioCompraBase.toFixed(2)}
                    disabled
                    className="w-24"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    label="Precio venta base"
                    value={unidad.precioVentaBase.toFixed(2)}
                    disabled
                    className="w-24"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    label="Factor conversión"
                    value={unidad.factorConversion.toString() || "1"}
                    min={0}
                    onChange={(e) =>
                      actualizarUnidadMedida(index + 1, "factorConversion", e.target.value || "1")
                    }
                    className="w-24"
                  />
                </div>

                <Button
                  className="mt-3"
                  variant="flat"
                  color="danger"
                  onClick={() => eliminarUnidadMedida(index + 1)}
                >
                  Eliminar
                </Button>
              </div>
            ))}

            <Button
              onClick={agregarUnidadMedida}
              variant="light"
              className="text-blue-500 hover:text-blue-700"
            >
              + Agregar unidad secundaria
            </Button>
          </div>
        </Tab>

        <Tab key="almacenes" title="Precios por Almacén">
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-4">
              Configure precios y stock específicos para cada almacén y unidad de medida.
            </p>

            {almacenes.length === 0 ? (
              <p className="text-amber-500">
                Primero debe seleccionar almacenes en la sección de detalles del producto.
              </p>
            ) : (
              almacenes.map((almacen) => (
                <div key={almacen.id} className="mb-6 pb-4 border-b border-gray-300">
                  <h4 className="font-medium mb-3">Almacén: {almacen.nombre}</h4>
                  {unidadesMedida.map((unidad, unidadIndex) => {
                    const unidadDescripcion =
                      listaUnidadesMedida.find((um) => um.id === unidad.unidadMedidaId)?.descripcion ||
                      `Unidad ${unidadIndex + 1}`;

                    return (
                      <div
                        key={`${almacen.id}-${unidad.id}`}
                        className="flex gap-4 mb-3 items-center"
                      >
                        <span className="w-24">{unidadDescripcion}</span>
                        <Input
                          type="number"
                          step="0.01"
                          label="Stock"
                          value={getValorPorAlmacen(unidad.unidadMedidaId, almacen.id, "stock").toFixed(2)}
                          min={0}
                          onChange={(e) =>
                            actualizarPrecioPorAlmacen(
                              unidad.unidadMedidaId,
                              almacen.id,
                              "stock",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          label="Precio compra"
                          value={getValorPorAlmacen(unidad.unidadMedidaId, almacen.id, "precioCompra").toFixed(2)}
                          min={0}
                          onChange={(e) =>
                            actualizarPrecioPorAlmacen(
                              unidad.unidadMedidaId,
                              almacen.id,
                              "precioCompra",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          label="Precio venta"
                          value={getValorPorAlmacen(unidad.unidadMedidaId, almacen.id, "precioVenta").toFixed(2)}
                          min={0}
                          onChange={(e) =>
                            actualizarPrecioPorAlmacen(
                              unidad.unidadMedidaId,
                              almacen.id,
                              "precioVenta",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24"
                        />
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}