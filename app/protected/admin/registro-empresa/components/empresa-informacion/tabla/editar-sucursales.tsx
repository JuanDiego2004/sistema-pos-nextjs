
import { usarSucursal } from "@/app/hooks/usarSucursal";
import { Sucursal } from "@/app/utils/types";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { useEffect, useState } from "react";

interface ActualizarSucursalModalProps {
    isOpen: boolean;
    onClose: () => void;
    sucursal: Sucursal | null;
    onActualizar: (actualizarSucursal: Sucursal) => void;
}

export default function ActualizarSucursalModal({
    isOpen,
    onClose,
    sucursal,
    onActualizar,
} : ActualizarSucursalModalProps) {
   const [formData, setFormData ] = useState<Sucursal>({
    id: "",
    nombre: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    pais: "",
    telefono: "",
    empresaId: "",
    email: "",
   });

   const {empresaId } = usarSucursal();

   useEffect(() => {
    if (sucursal) {
        setFormData(sucursal);
    }
   }, [sucursal]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleActualizar = () => {
    onActualizar(formData);
    onClose();
   }

   return (
    <Modal
    scrollBehavior="inside"
    placement="center"
     isOpen={isOpen} 
     onOpenChange={onClose}>
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader className="flex flex-col gap-1">
            Actualizar Sucursal
          </ModalHeader>
          <ModalBody>
            <Input
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ingrese el nombre de la sucursal"
            />
            <Input
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Ingrese la dirección"
            />
            <Input
              label="Ciudad"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              placeholder="Ingrese la ciudad"
            />
            <Input
              label="Estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              placeholder="Ingrese el estado"
            />
            <Input
              label="Código Postal"
              name="codigoPostal"
              value={formData.codigoPostal}
              onChange={handleChange}
              placeholder="Ingrese el código postal"
            />
            <Input
              label="País"
              name="pais"
              value={formData.pais}
              onChange={handleChange}
              placeholder="Ingrese el país"
            />
            <Input
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Ingrese el teléfono"
            />
            <Input
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ingrese el email"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleActualizar}>
              Guardar Cambios
            </Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
   )
}