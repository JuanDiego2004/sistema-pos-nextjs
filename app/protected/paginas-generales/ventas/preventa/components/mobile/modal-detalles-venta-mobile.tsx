import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  ModalHeader,
} from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion"; // Añadimos framer-motion
import { useState, useEffect } from "react";
import ResumenVentaMobile from "./resumen-venta-mobile";

interface DetallesVentaModalProps {
  isOpen: boolean;
  productosConBonificacion: any,
  onOpenChange: (open: boolean) => void;
  productosSeleccionados: any[];
  igvPorcentaje: number;
  tipoVentaSeleccionada: string;
  onTipoVentaChange: (tipo: string) => void;
  metodoPagoSeleccionado: string;
  onMetodoPagoChange: (metodo: string) => void;
  notas: string;
  onNotasChange: (notas: string) => void;
  registrarVenta: () => Promise<void>;
  onCalcularResumenChange: (resumen: { // Añadida esta propiedad
    subtotal: number;
    igvTotal: number;
    operacionGravada: number;
    total: number;
  }) => void;
  cantidadesBonificadas: { [key: string]: number }; // Añadida esta propiedad
  onCantidadBonificacionChange: (id: string, cantidadBonificada: number) => void; // Añadida esta propiedad
}
const DetallesVentaModalMobile: React.FC<DetallesVentaModalProps> = ({
  isOpen,
  onOpenChange,
  productosSeleccionados,
  productosConBonificacion,
  igvPorcentaje,
  tipoVentaSeleccionada,
  onTipoVentaChange,
  metodoPagoSeleccionado,
  onMetodoPagoChange,
  notas,
  onNotasChange,
  registrarVenta,
  onCalcularResumenChange,
  cantidadesBonificadas,
  onCantidadBonificacionChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarMensajeDemora, setMostrarMensajeDemora] = useState(false);

  // Temporizador para mostrar mensaje si la venta demora más de 3 segundos
  useEffect(() => {
    let temporizador: NodeJS.Timeout;
    if (isLoading) {
      temporizador = setTimeout(() => {
        setMostrarMensajeDemora(true);
      }, 3000); // 3 segundos
    } else {
      setMostrarMensajeDemora(false);
    }
    return () => clearTimeout(temporizador); // Limpieza al desmontar o cambiar estado
  }, [isLoading]);

  const handleRegistrarVenta = async () => {
    setIsLoading(true);
    try {
      await registrarVenta();
      onOpenChange(false); // Cierra el modal solo si la venta se completa con éxito
    } catch (error) {
      console.error("Error al registrar la venta:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Modal
        isDismissable={!isLoading} // No se puede cerrar con clic afuera mientras carga
        isKeyboardDismissDisabled={!isLoading} // No se puede cerrar con Esc mientras carga
        backdrop="opaque"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          <ModalHeader>
            <h2>Detalles Venta</h2>
          </ModalHeader>
          <ModalBody>
          <ResumenVentaMobile
              productosSeleccionados={productosSeleccionados}
              productosConBonificacion={productosConBonificacion}
              igvPorcentaje={igvPorcentaje}
              tipoVentaSeleccionada={tipoVentaSeleccionada}
              onTipoVentaChange={onTipoVentaChange}
              metodoPagoSeleccionado={metodoPagoSeleccionado}
              onMetodoPagoChange={onMetodoPagoChange}
              notas={notas}
              onNotasChange={onNotasChange}
              onCalcularResumenChange={onCalcularResumenChange}
              cantidadesBonificadas={cantidadesBonificadas}
              onCantidadBonificacionChange={onCantidadBonificacionChange}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => onOpenChange(false)}
              isDisabled={isLoading}
            >
              Cerrar
            </Button>
            <Button
              color="primary"
              onPress={handleRegistrarVenta}
              isDisabled={isLoading}
            >
              {isLoading ? "Procesando..." : "Registrar Venta"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Overlay opaco mientras se registra la venta */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="venta-loading-overlay"
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
              <p>Registrando venta...</p>
              {mostrarMensajeDemora && (
                <p className="mt-2 text-sm">
                  Esto está tomando más tiempo de lo esperado. Puede ser un problema de internet o del servidor.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DetallesVentaModalMobile;