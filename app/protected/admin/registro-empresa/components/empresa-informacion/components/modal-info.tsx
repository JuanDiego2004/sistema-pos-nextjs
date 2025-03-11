"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";

import { InfoEmpresa } from "@/app/utils/types";
import { toast } from "sonner";
import usarConsultaRuc from "@/app/hooks/usarConsultaRuc";
import { usarEmpresaData } from "../hook/usarEmpresa";

interface ModalEmpresaInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalEmpresaInfo: React.FC<ModalEmpresaInfoProps> = ({
  isOpen,
  onClose,
}) => {
  const { empresaInfo, actualizarEmpresa } = usarEmpresaData();
  const [formData, setFormData] = useState<Partial<InfoEmpresa>>({});
  const [certFile, setCertFile] = useState<File | null>(null); // Para el certificado
  const [keyFile, setKeyFile] = useState<File | null>(null);   // Para la clave privada
  const [loading, setLoading] = useState(false);
  const [isConsultaOpenRuc, setIsConsultaRucOpen] = useState(false);

  const {
    consultarRuc,
    loading: loadingConsultaRuc,
    error: errorConsultaRuc,
    data: rucData,
  } = usarConsultaRuc();
  const [rucConsulta, setRucConsulta] = useState("");

  // Sincronizar formData con empresaInfo al abrir el modal
  useEffect(() => {
    if (empresaInfo) {
      setFormData({
        ruc: empresaInfo.ruc ?? "",
        razonSocial: empresaInfo.razonSocial ?? "",
        nombreComercial: empresaInfo.nombreComercial ?? "",
        direccionFiscal: empresaInfo.direccionFiscal ?? "",
        distrito: empresaInfo.distrito ?? "",
        provincia: empresaInfo.provincia ?? "",
        departamento: empresaInfo.departamento ?? "",
        ubigeo: empresaInfo.ubigeo ?? "",
        telefono: empresaInfo.telefono ?? "",
        email: empresaInfo.email ?? "",
        paginaWeb: empresaInfo.paginaWeb ?? "",
        representanteLegal: empresaInfo.representanteLegal ?? "",
        dniRepresentante: empresaInfo.dniRepresentante ?? "",
        tipoContribuyente: empresaInfo.tipoContribuyente ?? "",
        estado: empresaInfo.estado ?? "",
        condicion: empresaInfo.condicion ?? "",
        logoUrl: empresaInfo.logoUrl ?? "",
        certificadoPassword: empresaInfo.certificadoPassword ?? "",
      });
    }
  }, [empresaInfo, isOpen]);

  // Sincronizar formData con los datos obtenidos del RUC
  useEffect(() => {
    if (rucData) {
      setFormData((prev) => ({
        ...prev,
        ruc: rucData.ruc || "",
        razonSocial: rucData.razonSocial || "",
        direccionFiscal: rucData.direccionFiscal || "",
        departamento: rucData.departamento || "",
        provincia: rucData.provincia || "",
        distrito: rucData.distrito || "",
        ubigeo: rucData.ubigeo || "",
        tipoContribuyente: rucData.tipoContribuyente || "",
        estado: rucData.estado || "",
        condicion: rucData.condicion || "",
        telefono: rucData.telefono || "",
        email: rucData.email || "",
        paginaWeb: rucData.paginaWeb || "",
        representanteLegal: rucData.representanteLegal || "",
        dniRepresentante: rucData.dniRepresentante || "",
        logoUrl: rucData.logoUrl || "",
      }));
    }
  }, [rucData]);

  // Manejar cambios en los inputs de texto
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejar la subida del certificado
  const handleCertFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setCertFile(file);
  };

  // Manejar la subida de la clave privada
  const handleKeyFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setKeyFile(file);
  };

  // Guardar cambios
  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          updatedData.append(key, value.toString());
        }
      });
  
      if (certFile) updatedData.append("certificadoDigital", certFile);
      if (keyFile) updatedData.append("clavePrivada", keyFile);
  
      const empresaId = empresaInfo?.id; // Asegúrate de que empresaInfo tenga el id
      if (!empresaId) throw new Error("No se encontró el ID de la empresa");
  
      await actualizarEmpresa(updatedData, empresaId); // Pasa el id
      toast.success("Datos actualizados correctamente");
      onClose();
    } catch (err) {
      console.error("Error al actualizar empresa:", err);
      toast.error("Error al actualizar la empresa");
    } finally {
      setLoading(false);
    }
  };

  const handleConsultarRuc = async () => {
    if (!rucConsulta) {
      toast.error("Ingrese un RUC válido");
      return;
    }

    try {
      setLoading(true);
      const resultado = await consultarRuc(rucConsulta);
      if (!resultado || !resultado.ruc) {
        toast.error("No se encontraron datos para este RUC");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        ruc: resultado.ruc,
        razonSocial: resultado.razonSocial || "",
        direccionFiscal: resultado.direccionFiscal || "",
        departamento: resultado.departamento || "",
        provincia: resultado.provincia || "",
        distrito: resultado.distrito || "",
        ubigeo: resultado.ubigeo || "",
        tipoContribuyente: resultado.tipoContribuyente || "",
        estado: resultado.estado || "",
        condicion: resultado.condicion || "",
        telefono: resultado.telefono || "",
        email: resultado.email || "",
        paginaWeb: resultado.paginaWeb || "",
        representanteLegal: resultado.representanteLegal || "",
        dniRepresentante: resultado.dniRepresentante || "",
        logoUrl: resultado.logoUrl || "",
      }));

      toast.success("Datos de RUC obtenidos correctamente");
      setIsConsultaRucOpen(false);
    } catch (error) {
      console.error("Error al consultar RUC:", error);
      toast.error("Error al consultar el RUC");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        scrollBehavior="inside"
        isOpen={isConsultaOpenRuc}
        onOpenChange={setIsConsultaRucOpen}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Consultar RUC
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Ingrese RUC"
                  placeholder="Ejemplo: 20552103816"
                  type="text"
                  variant="bordered"
                  value={rucConsulta}
                  onChange={(e) => setRucConsulta(e.target.value)}
                />
                {errorConsultaRuc && (
                  <p className="text-red-500 mt-2">{errorConsultaRuc}</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleConsultarRuc}
                  disabled={loadingConsultaRuc}
                >
                  {loadingConsultaRuc ? "Consultando..." : "Consultar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        scrollBehavior="inside"
        isOpen={isOpen}
        onOpenChange={onClose}
        size="3xl"
      >
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex justify-between">
                <h2>Información de la Empresa</h2>
                <Button
                  color="warning"
                  onPress={() => setIsConsultaRucOpen(true)}
                >
                  <h2>Registro Rápido</h2>
                </Button>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {[
                  { label: "RUC", name: "ruc" },
                  { label: "Razón Social", name: "razonSocial" },
                  { label: "Nombre Comercial", name: "nombreComercial" },
                  { label: "Dirección Fiscal", name: "direccionFiscal" },
                  { label: "Distrito", name: "distrito" },
                  { label: "Provincia", name: "provincia" },
                  { label: "Departamento", name: "departamento" },
                  { label: "Ubigeo", name: "ubigeo" },
                  { label: "Teléfono", name: "telefono" },
                  { label: "Email", name: "email" },
                  { label: "Página Web", name: "paginaWeb" },
                  { label: "Representante Legal", name: "representanteLegal" },
                  { label: "DNI Representante", name: "dniRepresentante" },
                  { label: "Tipo Contribuyente", name: "tipoContribuyente" },
                  { label: "Estado", name: "estado" },
                  { label: "Condición", name: "condicion" },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <Input
                      name={field.name}
                      label={field.label}
                      placeholder={`Ingrese ${field.label.toLowerCase()}`}
                      type="text"
                      variant="underlined"
                      value={String(
                        formData?.[field.name as keyof InfoEmpresa] ?? ""
                      )}
                      onChange={handleChange}
                    />
                  </div>
                ))}
                {/* Nuevos campos para el certificado */}
                <div className="flex flex-col">
                  <label htmlFor="certificadoDigital" className="mb-1">
                    Certificado Digital (.pfx o .cer)
                  </label>
                  <input
                    id="certificadoDigital"
                    type="file"
                    accept=".pfx,.cer"
                    onChange={handleCertFileChange}
                    className="border rounded p-2"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="clavePrivada" className="mb-1">
                    Clave Privada (.key, opcional)
                  </label>
                  <input
                    id="clavePrivada"
                    type="file"
                    accept=".key"
                    onChange={handleKeyFileChange}
                    className="border rounded p-2"
                  />
                </div>
                <div className="flex flex-col">
                  <Input
                    name="certificadoPassword"
                    label="Contraseña del Certificado"
                    placeholder="Ingrese la contraseña (si aplica)"
                    type="password"
                    variant="underlined"
                    value={formData.certificadoPassword ?? ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button color="primary" onPress={handleSave} disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalEmpresaInfo;