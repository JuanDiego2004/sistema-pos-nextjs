"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  UserIcon,
} from "lucide-react";
import { audioError, audioExito } from "@/components/sonidos/sonidos-alert";

interface RegistrarClienteFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistroLoadingChange?: (loading: boolean) => void;
  onClienteRegistrado?: () => void; // Nueva prop para notificar el registro
}

interface ClienteData {
  nombre: string;
  tipoCliente: "persona" | "empresa";
  tipoDocumento: "DNI" | "RUC";
  numeroDocumento: string;
  digitoVerificador: string;
  telefono: string;
  direccion: string;
  email: string;
  estado: boolean;
}

export default function RegistrarClienteForm({
  isOpen,
  onOpenChange,
  onRegistroLoadingChange,
  onClienteRegistrado, // Nueva prop opcional
}: RegistrarClienteFormProps) {
  const [loading, setLoading] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [registroLoading, setRegistroLoading] = useState(false);

  const [datos, setDatos] = useState<ClienteData>({
    nombre: "",
    tipoCliente: "persona",
    tipoDocumento: "DNI",
    numeroDocumento: "",
    digitoVerificador: "",
    telefono: "",
    direccion: "",
    email: "",
    estado: true,
  });

  // Función para consultar DNI o RUC
  const consultarDocumento = async () => {
    const { tipoDocumento, numeroDocumento } = datos;

    if (
      !numeroDocumento ||
      (tipoDocumento === "DNI" && numeroDocumento.length !== 8) ||
      (tipoDocumento === "RUC" && numeroDocumento.length !== 11)
    ) {
      toast.error(`Por favor, ingresa un ${tipoDocumento} válido.`);
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        tipoDocumento === "DNI"
          ? `/api/consultardni?dni=${numeroDocumento}`
          : `/api/consultaruc?ruc=${numeroDocumento}`;
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error al consultar el ${tipoDocumento}`);
      }

      if (tipoDocumento === "DNI") {
        setDatos({
          ...datos,
          nombre: data.data.nombreCompleto || "",
          tipoCliente: "persona",
          direccion: data.data.direccionCompleta || "",
        });
      } else {
        if (data.success) {
          setDatos({
            ...datos,
            nombre: data.data.nombre_o_razon_social || "",
            tipoCliente: "empresa",
            direccion: data.data.direccion_completa || "",
            estado: data.data.estado === "ACTIVO",
          });
        } else {
          throw new Error(data.message || "Error al consultar el RUC");
        }
      }

      toast.success(`${tipoDocumento} consultado correctamente.`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Error al consultar el ${tipoDocumento}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para registrar cliente
  const registrarCliente = async () => {
    if (!datos.nombre || !datos.numeroDocumento) {
      toast.error("El nombre y documento son obligatorios.");
      return;
    }

    setIsLoadingSubmit(true);
    setRegistroLoading(true);

    if (onRegistroLoadingChange) {
      onRegistroLoadingChange(true);
    }

    try {
      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        throw new Error("Error al registrar el cliente.");
      }

      const nuevoCliente = await response.json(); // Asumimos que la API devuelve el cliente registrado

      // Actualizar el caché manualmente
      const cached = localStorage.getItem("clientesCache");
      if (cached) {
        const { data: clientesActuales, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          const clientesActualizados = [
            ...clientesActuales,
            {
              id: nuevoCliente.data.id, // Ajusta según la estructura de la respuesta
              nombre: datos.nombre,
              numeroDocumento: datos.numeroDocumento,
            },
          ];
          localStorage.setItem(
            "clientesCache",
            JSON.stringify({ data: clientesActualizados, timestamp })
          );
        }
      }

      audioExito();
      toast.success("Cliente registrado con éxito 🎉");

      setDatos({
        nombre: "",
        tipoCliente: "persona",
        tipoDocumento: "DNI",
        numeroDocumento: "",
        digitoVerificador: "",
        telefono: "",
        direccion: "",
        email: "",
        estado: true,
      });

      onOpenChange(false);

      // Notificar al componente padre si existe la prop
      if (onClienteRegistrado) {
        onClienteRegistrado();
      }
    } catch (error) {
      audioError();
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al registrar el cliente."
      );
    } finally {
      setIsLoadingSubmit(false);
      setRegistroLoading(false);

      if (onRegistroLoadingChange) {
        onRegistroLoadingChange(false);
      }
    }
  };

  // Manejar cambios en los inputs
  const handleInputChange = (
    field: keyof ClienteData,
    value: string | boolean
  ) => {
    setDatos((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false}>
      <ModalContent className="h-full sm:h-auto">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 sticky top-0 bg-background z-10">
              Registrar Cliente
            </ModalHeader>
            <ModalBody className="overflow-y-auto max-h-[calc(90vh-130px)] sm:max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Tipo de Documento"
                  labelPlacement="outside"
                  selectedKeys={[datos.tipoDocumento]}
                  onSelectionChange={(keys) =>
                    handleInputChange(
                      "tipoDocumento",
                      Array.from(keys)[0] as "DNI" | "RUC"
                    )
                  }
                >
                  <SelectItem key="DNI">DNI</SelectItem>
                  <SelectItem key="RUC">RUC</SelectItem>
                </Select>

                <Input
                  label={
                    datos.tipoDocumento === "DNI"
                      ? "Número de DNI"
                      : "Número de RUC"
                  }
                  labelPlacement="outside"
                  placeholder={
                    datos.tipoDocumento === "DNI"
                      ? "Ej. 12345678"
                      : "Ej. 20123456789"
                  }
                  required
                  startContent={<CreditCardIcon className="text-default-400" />}
                  value={datos.numeroDocumento}
                  onChange={(e) =>
                    handleInputChange("numeroDocumento", e.target.value)
                  }
                />

                <Button
                  color="primary"
                  onPress={consultarDocumento}
                  isLoading={loading}
                  className="mt-2"
                >
                  Consultar {datos.tipoDocumento}
                </Button>

                <Input
                  label={
                    datos.tipoDocumento === "DNI"
                      ? "Nombre Completo"
                      : "Razón Social"
                  }
                  labelPlacement="outside"
                  placeholder={
                    datos.tipoDocumento === "DNI"
                      ? "Ej. Juan Pérez"
                      : "Ej. Empresa SAC"
                  }
                  required
                  startContent={<UserIcon className="text-default-400" />}
                  value={datos.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                />

                <Input
                  label="Email"
                  labelPlacement="outside"
                  placeholder="you@example.com"
                  type="email"
                  startContent={<MailIcon className="text-default-400" />}
                  value={datos.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                <Input
                  label="Teléfono"
                  labelPlacement="outside"
                  placeholder="+51 999 999 999"
                  type="tel"
                  startContent={<PhoneIcon className="text-default-400" />}
                  value={datos.telefono}
                  onChange={(e) =>
                    handleInputChange("telefono", e.target.value)
                  }
                />

                <Input
                  label="Dirección"
                  labelPlacement="outside"
                  placeholder="Ej. Av. Principal 123"
                  startContent={<MapPinIcon className="text-default-400" />}
                  value={datos.direccion}
                  onChange={(e) =>
                    handleInputChange("direccion", e.target.value)
                  }
                />
              </div>

              <Checkbox
                isSelected={datos.estado}
                onValueChange={(value) => handleInputChange("estado", value)}
              >
                Cliente Activo
              </Checkbox>
            </ModalBody>

            <ModalFooter className="sticky bottom-0 bg-background z-10">
              <Button color="danger" variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={registrarCliente}
                isLoading={isLoadingSubmit}
              >
                Guardar Cliente
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}