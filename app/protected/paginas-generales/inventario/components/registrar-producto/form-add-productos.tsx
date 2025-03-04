import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { DetallesProductoSection } from "./detalles-productos-seccion";
import { SubirImagen } from "./image-upload";
import { SubmitButton } from "./submit-button";
import { useDatosIniciales } from "../../hooks/usar-datos-iniciales";
import {
  ProductoAlmacenUnidadMedida,
  ProductoUnidadMedida,
} from "@/app/utils/types";
import RegistroUnidades from "./registro-unidades";
import { Button } from "@heroui/button";
import { XCircle } from "lucide-react";
import { bebas } from "@/app/utils/fonts";
import { Checkbox } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";

const FormSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium text-gray-700">{title}</h3>
    {children}
  </div>
);

interface FormData {
  nombre: string;
  categoriaId: string;
  almacenes: Array<{ almacenId: string; stock: number; stockTotal?: number }>;
  imagen?: File | null;
  codigoBarras: string;
  codigoInterno: string;
  tieneIGV: boolean;
  marca?: string;
  dimensiones?: string;
  peso?: number;
  impuestosAdicionales?: number;
  descuento?: number;
  fechaVencimiento?: string;
  fechaFabricacion?: string;
  proveedorId?: string;
  lote?: string;
  estado: string;
  ubicacionAlmacen?: string;
  costoAlmacenamiento?: number;
  notas?: string;
  unidadesMedida: ProductoUnidadMedida[];
  productoConBonificacion?: boolean; // Campo agregado
}

const initialFormData: FormData = {
  nombre: "",
  categoriaId: "",
  almacenes: [],
  codigoBarras: "",
  codigoInterno: "",
  tieneIGV: false,
  marca: "",
  dimensiones: "",
  peso: 0,
  impuestosAdicionales: 0,
  descuento: 0,
  estado: "activo",
  unidadesMedida: [],
  productoConBonificacion: false, // Valor inicial
};

export default function FormAddProducto({
  onSuccess,
  onClose,
  registrarProducto,
}: {
  onSuccess?: () => void;
  onClose?: () => void;
  registrarProducto: (nuevoProducto: any) => Promise<void>;
}) {
  const { categorias, almacenes, proveedores, isLoading } = useDatosIniciales();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const [mostrarMensajeDemora, setMostrarMensajeDemora] = useState(false); // Estado para el mensaje de demora

  // Temporizador para mostrar mensaje si demora más de 3 segundos
  useEffect(() => {
    let temporizador: NodeJS.Timeout;
    if (loading) {
      temporizador = setTimeout(() => {
        setMostrarMensajeDemora(true);
      }, 3000); // 3 segundos
    } else {
      setMostrarMensajeDemora(false);
    }
    return () => clearTimeout(temporizador); // Limpieza
  }, [loading]);

  const handleUnidadesChange = (
    unidades: ProductoUnidadMedida[],
    almacenesProducto: ProductoAlmacenUnidadMedida[]
  ) => {
    const updatedUnidades = unidades.map((unidad) => {
      const preciosPorAlmacen = almacenesProducto
        .filter((ap) => ap.unidadMedidaId === unidad.unidadMedidaId)
        .map((ap) => ({
          almacenId: ap.almacenId,
          stock: ap.stock,
          precioCompra: ap.precioCompra,
          precioVenta: ap.precioVenta,
        }));
      return { ...unidad, preciosPorAlmacen };
    });
    setFormData((prev) => ({
      ...prev,
      unidadesMedida: updatedUnidades,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const requiredFields: (keyof FormData)[] = [
        "nombre",
        "categoriaId",
        "codigoBarras",
        "codigoInterno",
      ];
      const missingFields = requiredFields.filter((field) => !formData[field]);
      if (missingFields.length > 0) {
        toast.error(`Faltan campos requeridos: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }

      const almacenesData = formData.almacenes.map((almacen) => {
        const precios = formData.unidadesMedida.map((unidad) => {
          const precioPorAlmacen = unidad.preciosPorAlmacen?.find(
            (p) => p.almacenId === almacen.almacenId
          );
          return {
            unidadMedidaId: unidad.unidadMedidaId,
            stock: precioPorAlmacen?.stock || 0,
            precioCompra:
              precioPorAlmacen?.precioCompra || unidad.precioCompraBase,
            precioVenta:
              precioPorAlmacen?.precioVenta || unidad.precioVentaBase,
          };
        });

        return {
          almacenId: almacen.almacenId,
          stockTotal: almacen.stock || 0,
          precios,
        };
      });

      const productoData = {
        ...formData,
        impuestosAdicionales: formData.impuestosAdicionales || 0,
        descuento: formData.descuento || 0,
        estado: formData.estado || "activo",
        tieneIGV: formData.tieneIGV || false,
        productoConBonificacion: formData.productoConBonificacion || false, // Incluir el campo
        unidadesMedida: formData.unidadesMedida,
        almacenes: almacenesData,
      };

      console.log("ProductoData antes de enviar:", productoData);

      await registrarProducto(productoData);

      toast.success("Producto registrado con éxito");
      setFormData(initialFormData);
      onSuccess?.();
    } catch (error) {
      console.error("Error al registrar el producto:", error);
      toast.error("Error al registrar el producto");
    }

    setLoading(false);
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
   <div className="relative">
      <form
      onSubmit={handleSubmit}
      className="space-y-6 light:bg-white dark:bg-black text-black dark:text-white"
    >
      <div className="flex justify-between items-center">
        <h2 className={`${bebas.className} text-lg`}>Detalles de Producto</h2>
        <Button isIconOnly size="sm" onClick={onClose}>
          <XCircle size={24} />
        </Button>
      </div>
      <FormSection title="">
        <DetallesProductoSection
          formData={formData}
          setFormData={setFormData}
          categorias={categorias}
          almacenes={almacenes.map((alm) => ({
            ...alm,
            id: alm.id.toString(),
          }))}
          proveedores={proveedores}
        />
        {/* Checkbox para producto con bonificación */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="productoConBonificacion"
            defaultSelected={formData.productoConBonificacion || false}
            color="success"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                productoConBonificacion: e.target.checked,
              }))
            }
          >
            ¿Producto con bonificación?
          </Checkbox>
        </div>
      </FormSection>

      <FormSection title="Imagen">
        <SubirImagen
          onImageSelect={(file) =>
            setFormData((prev) => ({ ...prev, imagen: file }))
          }
        />
      </FormSection>

      <FormSection title="Unidades de Medida">
        <RegistroUnidades
          almacenes={formData.almacenes.map((selectedAlm) => {
            const matchingAlmacen = almacenes.find(
              (alm) => alm.id.toString() === selectedAlm.almacenId
            );
            return matchingAlmacen
              ? {
                  id: matchingAlmacen.id.toString(),
                  nombre: matchingAlmacen.nombre,
                }
              : { id: selectedAlm.almacenId, nombre: "Unknown" };
          })}
          unidadesMedida={formData.unidadesMedida}
          almacenesProducto={formData.unidadesMedida.flatMap(
            (unidad) =>
              unidad.preciosPorAlmacen?.map((p) => {
                const matchingAlmacen = almacenes.find(
                  (alm) => alm.id.toString() === p.almacenId
                );
                return {
                  id: `${unidad.unidadMedidaId}-${p.almacenId}`,
                  productoId: "",
                  unidadMedidaId: unidad.unidadMedidaId,
                  almacenId: p.almacenId,
                  stock: p.stock || 0,
                  precioCompra: p.precioCompra || unidad.precioCompraBase,
                  precioVenta: p.precioVenta || unidad.precioVentaBase,
                  almacen: matchingAlmacen
                    ? {
                        id: matchingAlmacen.id.toString(),
                        nombre: matchingAlmacen.nombre,
                        codigo: matchingAlmacen.codigo || "",
                        direccion: matchingAlmacen.direccion || "",
                      }
                    : {
                        id: p.almacenId,
                        nombre: "Unknown",
                        codigo: "",
                        direccion: "",
                      },
                  unidadMedida: unidad.unidadMedida,
                };
              }) || []
          )}
          onChange={handleUnidadesChange}
        />
      </FormSection>

      <div className="flex justify-end space-x-4">
        <SubmitButton loading={loading} />
        <Button
        color="danger"
          variant="flat"
          onClick={onClose}
          className="flex items-center gap-2"
        >
          <XCircle size={20} />
          Cerrar
        </Button>
      </div>
    </form>


   {/* Overlay opaco mientras se guarda */}
   <AnimatePresence>
        {loading && (
          <motion.div
            key="loading-overlay"
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
              <p>Guardando producto...</p>
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
}
