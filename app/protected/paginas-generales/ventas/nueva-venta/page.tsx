"use client";

import dynamic from "next/dynamic";
import {
  ScrollShadow,
  Image,
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  User,
  cn,
  useDisclosure,
  ModalContent,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion"; // Añadimos framer-motion
import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, Search } from "lucide-react";
import {
  AddNoteIcon,
  CopyDocumentIcon,
  DeleteDocumentIcon,
  EditDocumentIcon,
} from "@/components/iconos/icons";
import RegistrarClienteForm from "./components/agregar-clientes";
import ProductosSeleccionados from "./components/productos-seleccionados";
import BuscadorClientes from "./components/buscador-clientes";
import ResumenVenta from "./components/resumen-venta";
import ConsultarDNI from "../components/consulta-dni";
import ProductosSeleccionadosMobile from "./components/mobile/producto-seleccionado-mobile";
import DetallesVentaModalMobile from "./components/mobile/modal-detalles-venta-mobile";
import { toast } from "sonner";
import usarProductosVentas from "./hook/usarProductosVentas";
import { createClient } from "@/utils/supabase/client";
import { truncate } from "node:fs";
import { audioError, audioExito } from "@/components/sonidos/sonidos-alert";

const CategoriaSlider = dynamic(
  () => import("../components/slider/categoria-slider"),
  {
    loading: () => <p>Cargando categorías...</p>,
    ssr: false,
  }
);

const ProductoLista = dynamic(() => import("../components/producto-lista"), {
  loading: () => <p>Cargando productos...</p>,
  ssr: false,
});

interface Cliente {
  id: string;
  nombre: string;
  numeroDocumento: string;
}

export default function NuevaVenta() {
  const {
    categorias,
    productos,
    categoriaSeleccionada,
    productosConBonificacion,
    setCategoriaSeleccionada,
    loading,
    error,
    busqueda,
    setBusqueda,
  } = usarProductosVentas();

  const [productosSeleccionados, setProductosSeleccionados] = useState<any[]>([]);
  const [cantidadesBonificadas, setCantidadesBonificadas] = useState<{
    [key: string]: number;
  }>({});
  const [busquedaCliente, setBusquedaCliente] = useState<string>("");
  const [clientesFiltrados, setClientesFiltrados] = useState<any[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);


  const agregarProducto = (producto: any) => {
    const existe = productosSeleccionados.find((p) => p.id === producto.id);
    if (existe) {
      setProductosSeleccionados((prev) =>
        prev.map((p) =>
          p.id === producto.id
            ? {
                ...p,
                precioVenta: producto.precioVenta,
                unidadSeleccionada: producto.unidadSeleccionada || {
                  unidadMedida: "unidad",
                  factorConversion: 1,
                  precioVenta: producto.precioVenta,
                },
              }
            : p
        )
      );
    } else {
      setProductosSeleccionados((prev) => [
        ...prev,
        {
          ...producto,
          cantidad: 1,
          unidadSeleccionada: producto.unidadSeleccionada || {
            unidadMedida: "unidad",
            factorConversion: 1,
            precioVenta: producto.precioVenta,
          },
        },
      ]);
    }
    setIsProductosModalOpen(true);
  };

  const eliminarProducto = (id: string) => {
    setProductosSeleccionados((prev) => prev.filter((p) => p.id !== id));
    setCantidadesBonificadas((prev) => {
      const nuevo = { ...prev };
      delete nuevo[id];
      return nuevo;
    });
  };

  const actualizarCantidad = (id: string, nuevaCantidad: number) => {
    setProductosSeleccionados((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cantidad: nuevaCantidad } : p))
    );
  };

  const iconClasses = "text-xl text-default-500 pointer-events-none flex-shrink-0";
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isProductosModalOpen, setIsProductosModalOpen] = useState(false);
  const [isModalDetalles, setIsModalDetalles] = useState(false);
  const [isModalDNIConsultaOpen, setIsModalDNIConsultaOpen] = useState(false);
  const [isVentaInProgress, setIsVentaInProgress] = useState(false);
  const [registroClienteLoading, setRegistroClienteLoading] = useState(false);

  const handleClienteSeleccionado = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setBusquedaCliente(`${cliente.nombre} - ${cliente.numeroDocumento}`);
  };

  const [tipoVenta, setTipoVenta] = useState("factura");
  const [notas, setNotas] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const igvPorcentaje = 18;
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [sucursalId, setSucursalId] = useState<string | null>(null);
  const [almacenId, setAlmacenId] = useState<string | null>(null);
  const [ubicacion, setUbicacion] = useState<{
    latitud: number | null;
    longitud: number | null;
  }>({
    latitud: null,
    longitud: null,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/usuario", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Error al obtener datos del usuario");
        setUsuarioId(data.usuarioId);
        setSucursalId(data.sucursalId);
        setAlmacenId(data.almacenId);
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        toast.error(error instanceof Error ? error.message : "No se pudo obtener datos del usuario");
      }
    };
    fetchUserData();
  }, []);


  const registrarVenta = async () => {
    if (productosSeleccionados.length === 0) {
      toast.error("Debe seleccionar al menos un producto");
      return;
    }
    if (!metodoPago) {
      toast.error("Debe seleccionar un método de pago");
      return;
    }
    if (!tipoVenta) {
      toast.error("Debe seleccionar un tipo de venta");
      return;
    }
    if (!usuarioId || !sucursalId || !almacenId) {
      toast.error("Falta información del usuario, sucursal o almacén");
      return;
    }
    if (!clienteSeleccionado) {
      toast.error("Debe seleccionar un cliente");
      return;
    }
  
    try {
      const obtenerCoordenadas = () => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("La geolocalización no es soportada por este navegador"));
          } else {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  latitud: position.coords.latitude,
                  longitud: position.coords.longitude,
                });
              },
              (error) => {
                reject(new Error("No se pudo obtener la ubicación: " + error.message));
              }
            );
          }
        });
      };
  
      let coordenadas: { latitud: number | null; longitud: number | null } = { latitud: null, longitud: null };
      try {
        coordenadas = (await obtenerCoordenadas()) as { latitud: number | null; longitud: number | null };
      } catch (geoError) {
        toast.error("No se pudo obtener la ubicación, se registrará sin coordenadas");
        console.warn(geoError instanceof Error ? geoError.message : "Error desconocido");
      }
  
      // Generar las bonificaciones a partir de todas las cantidades bonificadas especificadas
      const bonificaciones = Object.entries(cantidadesBonificadas)
        .filter(([, cantidad]) => cantidad > 0) // Solo incluir productos con cantidad bonificada mayor a 0
        .map(([productoId, cantidad]) => {
          console.log(`Producto ${productoId} tiene ${cantidad} bonificaciones`); // Depuración
          return {
            productoId,
            cantidad,
          };
        });
  
      console.log("Bonificaciones a enviar:", bonificaciones); // Depuración para verificar
  
      const requestBody = {
        productos: productosSeleccionados.map((producto) => ({
          id: producto.id,
          cantidad: producto.cantidad,
          cantidadBonificada: cantidadesBonificadas[producto.id] || 0, // Cantidad bonificada para productos seleccionados
          unidadSeleccionada: producto.unidadSeleccionada
            ? {
                precioVenta: producto.unidadSeleccionada.precioVenta,
                unidadMedida: producto.unidadSeleccionada.unidadMedida,
                factorConversion: producto.unidadSeleccionada.factorConversion,
              }
            : null,
          tieneIGV: producto.tieneIGV,
          nombre: producto.nombre, // Para el XML
        })),
        clienteId: clienteSeleccionado.id,
        usuarioId,
        sucursalId,
        almacenId,
        metodoPago,
        tipoVenta,
        notas,
        subtotal: resumenCalculado.subtotal,
        impuesto: resumenCalculado.igvTotal,
        total: resumenCalculado.total,
        bonificaciones, // Enviar todas las bonificaciones
        descuento: 0,
        baseImponible: resumenCalculado.subtotal,
        valorVenta: resumenCalculado.subtotal,
        igv: resumenCalculado.igvTotal,
        tipoOperacion: "0101",
        estadoSunat: "PENDIENTE",
        latitud: coordenadas.latitud,
        longitud: coordenadas.longitud,
      };
  
      const response = await fetch("/api/preventa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
  
      const data = await response.json();
      if (response.ok) {
        toast.success("Venta registrada exitosamente");
        audioExito();
        setProductosSeleccionados([]);
        setClienteSeleccionado(null);
        setCantidadesBonificadas({});
        setBusquedaCliente("");
      } else {
        toast.error(data.error || "Error al registrar la venta");
        audioError();
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor");
      audioError();
      console.error("Error en registrarVenta:", error);
    }
  };

  const handleRegistrarVenta = async () => {
    setIsVentaInProgress(true);
    try {
      await registrarVenta();
      setIsModalDetalles(false);
    } catch (error) {
      console.error("Error al registrar la venta:", error);
    } finally {
      setIsVentaInProgress(false);
    }
  };

  const handleBonificacionChange = (id: string, cantidadBonificada: number) => {
    setCantidadesBonificadas((prev) => ({
      ...prev,
      [id]: cantidadBonificada,
    }));
  };

  const [resumenCalculado, setResumenCalculado] = useState({
    subtotal: 0,
    igvTotal: 0,
    operacionGravada: 0,
    total: 0,
  });

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden relative">
      {/* Overlay con loader mientras se cargan los productos */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loading-overlay"
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-white text-center">
              <svg
                className="animate-spin h-10 w-10 mx-auto mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h-8z"
                />
              </svg>
              <p>Cargando productos...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de Productos */}
      <div
        className={`flex-1 transition-all duration-500 ease-in-out dark:bg-black dark:text-white ${
          productosSeleccionados.length > 0 && !isMobile()
            ? "md:w-[calc(100%-24rem)]"
            : "w-full"
        }`}
      >
        <div className="sticky top-0 z-10 bg-white dark:bg-black pb-4">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-white dark:bg-gray-600"
            />
          </div>
          <div className="mb-6">
            <CategoriaSlider
              categorias={categorias}
              categoriaSeleccionada={categoriaSeleccionada}
              setCategoriaSeleccionada={setCategoriaSeleccionada}
            />
          </div>
        </div>
        <ScrollShadow
          className="h-[calc(100vh-12rem)] overflow-y-auto"
          hideScrollBar
          size={20}
        >
          {loading ? (
            <p className="p-6 text-center">Cargando productos...</p> // Este texto será reemplazado por el overlay
          ) : error ? (
            <p className="p-6 text-red-500 text-center">Error: {error}</p>
          ) : (
            <ProductoLista
              productos={productos.map((producto) => ({
                ...producto,
                unidadesMedida: producto.unidadesMedida.map((unidad) => ({
                  ...unidad,
                  descripcion: unidad.descripcion || "",
                  codigo: unidad.codigo || "",
                })),
              }))}
              onProductoSeleccionado={agregarProducto}
              isMobile={isMobile()}
            />
          )}
        </ScrollShadow>
      </div>

      {/* Contenedor de Productos Seleccionados */}
      {isMobile() && productosSeleccionados.length > 0 ? (
        <div className="h-3/5">
          <Modal
            isOpen={isProductosModalOpen}
            isDismissable={false}
            onOpenChange={setIsProductosModalOpen}
            size="lg"
          >
            <ModalContent className="w-full h-full">
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    <div className="w-full h-[9vh] flex items-center justify-between p-3">
                      <div className="w-3/5">
                        <BuscadorClientes
                          busquedaCliente={busquedaCliente}
                          setBusquedaCliente={setBusquedaCliente}
                          clientesFiltrados={clientesFiltrados}
                          setClientesFiltrados={setClientesFiltrados}
                          onClienteSeleccionado={handleClienteSeleccionado}
                        />
                      </div>
                      <div className="w-1/3">
                        <Dropdown>
                          <DropdownTrigger>
                            <Button variant="bordered">Menu</Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Dropdown menu with icons" variant="faded">
                            <DropdownItem
                              key="new"
                              shortcut="⌘N"
                              startContent={<AddNoteIcon className={iconClasses} />}
                              onPress={onOpen}
                            >
                              Registrar Cliente
                            </DropdownItem>
                            <DropdownItem
                              onPress={() => setIsModalDNIConsultaOpen(true)}
                              key="copy"
                              shortcut="⌘C"
                              startContent={<CopyDocumentIcon className={iconClasses} />}
                            >
                              Consulta Reniec
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </div>
                  </ModalHeader>
                  <ModalBody className="overflow-hidden">
                    {registroClienteLoading && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
                        <p className="text-white text-lg font-bold">Registro en progreso...</p>
                      </div>
                    )}
                    <RegistrarClienteForm
                      isOpen={isOpen}
                      onOpenChange={onOpenChange}
                      onRegistroLoadingChange={setRegistroClienteLoading}
                    />
                    <ScrollShadow
                      className="h-[calc(100vh-20rem)] overflow-y-auto"
                      hideScrollBar
                      size={20}
                    >
                      <ProductosSeleccionadosMobile
                        productos={productosSeleccionados}
                        eliminarProducto={eliminarProducto}
                        actualizarCantidad={actualizarCantidad}
                        igvPorcentaje={igvPorcentaje}
                      />
                    </ScrollShadow>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={() => setIsProductosModalOpen(false)}>
                      Cerrar
                    </Button>
                    <Button color="primary" onPress={() => setIsModalDetalles(true)}>
                      Abrir Detalles
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>

          {isVentaInProgress && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
              <p className="text-white text-lg font-bold">Venta en progreso...</p>
            </div>
          )}

          <DetallesVentaModalMobile
            isOpen={isModalDetalles}
            productosConBonificacion={productosConBonificacion}
            onOpenChange={setIsModalDetalles}
            productosSeleccionados={productosSeleccionados}
            igvPorcentaje={igvPorcentaje}
            tipoVentaSeleccionada={tipoVenta}
            onTipoVentaChange={setTipoVenta}
            metodoPagoSeleccionado={metodoPago}
            onMetodoPagoChange={setMetodoPago}
            notas={notas}
            onNotasChange={setNotas}
            registrarVenta={handleRegistrarVenta}
            onCalcularResumenChange={setResumenCalculado}
            cantidadesBonificadas={cantidadesBonificadas}
            onCantidadBonificacionChange={handleBonificacionChange}
          />
        </div>
      ) : (
        <div
          className={`w-96 dark:bg-gray-900 shadow-lg bg-white transition-all duration-500 ease-in-out ${
            productosSeleccionados.length > 0 ? "translate-y-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          <div className="w-full h-[9vh] flex items-center justify-between p-3">
            <div className="w-3/5">
              <BuscadorClientes
                busquedaCliente={busquedaCliente}
                setBusquedaCliente={setBusquedaCliente}
                clientesFiltrados={clientesFiltrados}
                setClientesFiltrados={setClientesFiltrados}
                onClienteSeleccionado={handleClienteSeleccionado}
              />
            </div>
            <div className="w-1/3">
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered">Open Menu</Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Dropdown menu with icons" variant="faded">
                  <DropdownItem
                    key="new"
                    shortcut="⌘N"
                    startContent={<AddNoteIcon className={iconClasses} />}
                    onPress={onOpen}
                  >
                    Registrar Cliente
                  </DropdownItem>
                  <DropdownItem
                    onPress={() => setIsModalDNIConsultaOpen(true)}
                    key="copy"
                    shortcut="⌘C"
                    startContent={<CopyDocumentIcon className={iconClasses} />}
                  >
                    Consulta Reniec
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
          <RegistrarClienteForm isOpen={isOpen} onOpenChange={onOpenChange} />
          <ConsultarDNI isOpen={isModalDNIConsultaOpen} onOpenChange={setIsModalDNIConsultaOpen} />
          <ScrollShadow
            className="h-[calc(72vh-20rem)] overflow-y-auto"
            hideScrollBar
            size={20}
          >
            <ProductosSeleccionados
              productos={productosSeleccionados}
              eliminarProducto={eliminarProducto}
              actualizarCantidad={actualizarCantidad}
              igvPorcentaje={igvPorcentaje}
            />
          </ScrollShadow>
          <div className="flex flex-col gap-4">
            <ResumenVenta
              productosSeleccionados={productosSeleccionados}
              igvPorcentaje={igvPorcentaje}
              productosConBonificacion={productosConBonificacion}
              tipoVentaSeleccionada={tipoVenta}
              onTipoVentaChange={setTipoVenta}
              metodoPagoSeleccionado={metodoPago}
              onMetodoPagoChange={setMetodoPago}
              notas={notas}
              onNotasChange={setNotas}
              onCalcularResumenChange={setResumenCalculado}
              cantidadesBonificadas={cantidadesBonificadas}
              onCantidadBonificacionChange={handleBonificacionChange}
            />
            <Button onClick={registrarVenta} color="primary" className="self-end">
              Registrar Venta
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function isMobile(): boolean {
  return typeof window !== "undefined" && window.innerWidth < 768;
}