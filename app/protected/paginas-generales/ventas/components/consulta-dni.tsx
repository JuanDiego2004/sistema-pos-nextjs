"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { CreditCardIcon } from "lucide-react";

interface ConsultarDNIProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DNIData {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipoDocumento: string;
  numeroDocumento: string;
  digitoVerificador: string;
}

export default function ConsultarDNI({ isOpen, onOpenChange }: ConsultarDNIProps) {
  const [dni, setDni] = useState("");
  const [datos, setDatos] = useState<DNIData | null>(null);
  const [loading, setLoading] = useState(false);

  const consultarDNI = async () => {
    if (!dni || dni.length !== 8) {
      toast.error("Por favor, ingresa un DNI válido de 8 dígitos.");
      return;
    }

    setLoading(true);
    setDatos(null);

    try {
      const response = await fetch(`/api/consultardni?numero=${dni}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al consultar el DNI");
      }

      setDatos(data);
      toast.success("Datos del DNI consultados correctamente.");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Error al consultar el DNI");
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar los datos del usuario al modificar un input
  const handleInputChange = (field: keyof DNIData, value: string) => {
    if (datos) {
      setDatos({ ...datos, [field]: value });
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Consultar DNI
            </ModalHeader>
            <ModalBody>
              {/* Input para ingresar el número de DNI */}
              <Input
                label="Número de DNI"
                labelPlacement="outside"
                placeholder="Ej. 12345678"
                required
                startContent={<CreditCardIcon className="text-default-400" />}
                value={dni}
                onChange={(e) => setDni(e.target.value)}
              />

              {/* Mostrar los datos en inputs editables */}
              {datos && (
                <div className="mt-4 space-y-2">
                  <Input
                    label="Nombres"
                    value={datos.nombres}
                    onChange={(e) => handleInputChange("nombres", e.target.value)}
                  />
                  <Input
                    label="Apellido Paterno"
                    value={datos.apellidoPaterno}
                    onChange={(e) => handleInputChange("apellidoPaterno", e.target.value)}
                  />
                  <Input
                    label="Apellido Materno"
                    value={datos.apellidoMaterno}
                    onChange={(e) => handleInputChange("apellidoMaterno", e.target.value)}
                  />
                  <Input
                    label="Tipo de Documento"
                    value={datos.tipoDocumento}
                    onChange={(e) => handleInputChange("tipoDocumento", e.target.value)}
                  />
                  <Input
                    label="Número de Documento"
                    value={datos.numeroDocumento}
                    onChange={(e) => handleInputChange("numeroDocumento", e.target.value)}
                  />
                  <Input
                    label="Dígito Verificador"
                    value={datos.digitoVerificador}
                    onChange={(e) => handleInputChange("digitoVerificador", e.target.value)}
                  />
                  <Input
                    label="Direccion"
                   />
                </div>
              )}
              <Button color="primary">
                  Registrar Cliente
              </Button>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={consultarDNI}
                isLoading={loading}
              >
                Consultar DNI
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
