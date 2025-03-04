import { useState } from "react";
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
  useDisclosure,
} from "@heroui/react";
import { toast } from "sonner";
import { usarAlmacen } from "@/app/hooks/usarAlmacen";

interface AlmacenModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  sucursalId: string;
  sucursalNombre: string;
  onSuccess?: () => void;
}

export default function AlmacenModal({ 
  isOpen, 
  onOpenChange, 
  sucursalId,
  sucursalNombre,
  onSuccess 
}: AlmacenModalProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    direccion: "",
    ciudad: "",
    estadoRegion: "",
    codigoPostal: "",
    pais: "",
    responsable: "",
    telefono: "",
    email: "",
    tipoAlmacen: "",
    capacidadMaxima: "", // Changed to string
    metodoValuacion: "",
  });

  const [loading, setLoading] = useState(false);
  const { registrarAlmacen } = usarAlmacen();

  const handleSubmit = async (onClose: () => void) => {
    setLoading(true);
    try {
      // Llamar a la función registrarAlmacen del hook
      await registrarAlmacen({
        ...formData,
        sucursalId,
        capacidadMaxima: parseInt(formData.capacidadMaxima) || 0, // Convertir a número
      });

      // Mostrar mensaje de éxito
      toast.success("Almacén registrado correctamente");

      // Cerrar el modal y ejecutar onSuccess si existe
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al registrar el almacén");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // For capacidadMaxima, only allow numbers
    if (field === "capacidadMaxima") {
      // Remove any non-numeric characters except for backspace
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData(prev => ({
        ...prev,
        [field]: numericValue
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal 
    scrollBehavior="inside"
    isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Registrar Nuevo Almacén - Sucursal: {sucursalNombre}
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  placeholder="Nombre del almacén"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                />
                <Input
                  label="Código"
                  placeholder="Código del almacén"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange("codigo", e.target.value)}
                />
                <Input
                  label="Dirección"
                  placeholder="Dirección"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange("direccion", e.target.value)}
                />
                <Input
                  label="Ciudad"
                  placeholder="Ciudad"
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange("ciudad", e.target.value)}
                />
                <Input
                  label="Estado/Región"
                  placeholder="Estado o región"
                  value={formData.estadoRegion}
                  onChange={(e) => handleInputChange("estadoRegion", e.target.value)}
                />
                <Input
                  label="Código Postal"
                  placeholder="Código postal"
                  value={formData.codigoPostal}
                  onChange={(e) => handleInputChange("codigoPostal", e.target.value)}
                />
                <Input
                  label="País"
                  placeholder="País"
                  value={formData.pais}
                  onChange={(e) => handleInputChange("pais", e.target.value)}
                />
                <Input
                  label="Responsable"
                  placeholder="Nombre del responsable"
                  value={formData.responsable}
                  onChange={(e) => handleInputChange("responsable", e.target.value)}
                />
                <Input
                  label="Teléfono"
                  placeholder="Teléfono de contacto"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                />
                <Input
                  label="Email"
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                <Select
                  label="Tipo de Almacén"
                  placeholder="Seleccione el tipo"
                  value={formData.tipoAlmacen}
                  onChange={(e) => handleInputChange("tipoAlmacen", e.target.value)}
                >
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="REFRIGERADO">Refrigerado</SelectItem>
                  <SelectItem value="MATERIA_PRIMA">Materia Prima</SelectItem>
                  <SelectItem value="PRODUCTO_TERMINADO">Producto Terminado</SelectItem>
                </Select>
                <Input
                  type="text"
                  label="Capacidad Máxima"
                  placeholder="Capacidad en unidades"
                  value={formData.capacidadMaxima}
                  onChange={(e) => handleInputChange("capacidadMaxima", e.target.value)}
                />
                <Select
                  label="Método de Valuación"
                  placeholder="Seleccione el método"
                  value={formData.metodoValuacion}
                  onChange={(e) => handleInputChange("metodoValuacion", e.target.value)}
                >
                  <SelectItem value="FIFO">FIFO</SelectItem>
                  <SelectItem value="LIFO">LIFO</SelectItem>
                  <SelectItem value="PROMEDIO">Promedio Ponderado</SelectItem>
                </Select>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button 
                color="primary" 
                onPress={() => handleSubmit(onClose)}
                isLoading={loading}
              >
                Registrar Almacén
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}