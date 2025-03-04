"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@heroui/react";
import { Input } from "@heroui/input";
import { toast } from "sonner";
import { Sucursal } from "@/app/utils/types";
import { usarSucursal } from "@/app/hooks/usarSucursal";

interface ModalRegistroSucursalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  cargarSucursales: () => void;
}

export default function ModalRegistroSucursal({ isOpen, onOpenChange, cargarSucursales }: ModalRegistroSucursalProps) {
  const { empresaId } = usarSucursal();
  const [currentSucursal, setCurrentSucursal] = useState<Sucursal>({
    id: "",
    nombre: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    pais: "",
    telefono: "",
    email: "",
    empresaId: "",
  });

  const handleSucursalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSucursal((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegistroSucursal = async () => {
    if (!empresaId) {
      toast.error("Primero debes registrar la empresa.");
      return;
    }

    const sucursalData = { ...currentSucursal, empresaId };

    try {
      const response = await fetch("/api/sucursales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sucursalData),
      });

      if (!response.ok) throw new Error("Error al registrar la sucursal.");

      toast.success("Sucursal registrada correctamente.");
      setCurrentSucursal({
        id: "",
        nombre: "",
        direccion: "",
        ciudad: "",
        estado: "",
        codigoPostal: "",
        pais: "",
        telefono: "",
        email: "",
        empresaId: "",
      });

      await cargarSucursales();
      onOpenChange(false); // Cerrar modal después de registrar
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocurrió un error desconocido.");
    }
  };

  return (
    <Modal 
    scrollBehavior="inside"
    isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Registrar Sucursal</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nombre" name="nombre" placeholder="Ej: Sucursal Central" isRequired type="text" value={currentSucursal.nombre} onChange={handleSucursalChange} />
                <Input label="Dirección" name="direccion" placeholder="Ej: Av. Principal 123" isRequired type="text" value={currentSucursal.direccion} onChange={handleSucursalChange} />
                <Input label="Ciudad" name="ciudad" placeholder="Ej: Lima" isRequired type="text" value={currentSucursal.ciudad} onChange={handleSucursalChange} />
                <Input label="Estado/Región" name="estado" placeholder="Ej: Lima" type="text" value={currentSucursal.estado} onChange={handleSucursalChange} />
                <Input label="Código Postal" name="codigoPostal" placeholder="Ej: 15001" type="text" value={currentSucursal.codigoPostal} onChange={handleSucursalChange} />
                <Input label="País" name="pais" placeholder="Ej: Perú" type="text" value={currentSucursal.pais} onChange={handleSucursalChange} />
                <Input label="Teléfono" name="telefono" placeholder="Ej: +51 1 234-5678" type="tel" value={currentSucursal.telefono} onChange={handleSucursalChange} />
                <Input label="Email" name="email" placeholder="Ej: sucursal@empresa.com" type="email" value={currentSucursal.email} onChange={handleSucursalChange} />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>Cancelar</Button>
              <Button color="primary" onPress={handleRegistroSucursal}>Guardar</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
