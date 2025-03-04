import { useState, useEffect } from "react";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Building, MapPin, User, Mail, Globe, Phone, ClipboardCheck, Timer, FileText } from "lucide-react";
import ModalInfoEmpresa from "./modal-info";
import { InfoEmpresa } from "@/app/utils/types";


interface InfoEmpresaContainerProps {
  InfoEmpresa: InfoEmpresa | null;
  loading: boolean;
  error: any;
  cargarEmpresa: () => void;
}

const InfoEmpresaContainer: React.FC<InfoEmpresaContainerProps> = ({ InfoEmpresa, loading, error, cargarEmpresa }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    cargarEmpresa();
  };

  if (loading) return <div className="p-6">Cargando información...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!InfoEmpresa) return <div className="p-6">No se encontró información de la empresa</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg w-full">
      <div className="w-full flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Información de la Empresa</h2>
        <Button color="warning" onPress={() => setIsModalOpen(true)}>
          Actualizar Información
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Empresa */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Building className="text-blue-600" size={24} />
            <h2>Empresa</h2>
          </CardHeader>
          <CardBody>
            <p><strong>RUC:</strong> {InfoEmpresa.ruc}</p>
            <p><strong>Razón Social:</strong> {InfoEmpresa.razonSocial}</p>
            {InfoEmpresa.nombreComercial && <p><strong>Nombre Comercial:</strong> {InfoEmpresa.nombreComercial}</p>}
          </CardBody>
        </Card>

        {/* Ubicación */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <MapPin className="text-green-600" size={24} />
            <h2>Ubicación</h2>
          </CardHeader>
          <CardBody>
            <p><strong>Dirección:</strong> {InfoEmpresa.direccionFiscal}</p>
            <p><strong>Distrito:</strong> {InfoEmpresa.distrito}, {InfoEmpresa.provincia}</p>
            <p><strong>Departamento:</strong> {InfoEmpresa.departamento}</p>
          </CardBody>
        </Card>

        {/* Representante */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <User className="text-purple-600" size={24} />
            <h2>Representante</h2>
          </CardHeader>
          <CardBody>
            <p><strong>Nombre:</strong> {InfoEmpresa.representanteLegal || "No registrado"}</p>
            <p><strong>DNI:</strong> {InfoEmpresa.dniRepresentante || "No registrado"}</p>
          </CardBody>
        </Card>

        {/* Contacto */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Phone className="text-yellow-600" size={24} />
            <h2>Contacto</h2>
          </CardHeader>
          <CardBody>
            <p><strong>Teléfono:</strong> {InfoEmpresa.telefono || "No disponible"}</p>
            <p><strong>Email:</strong> {InfoEmpresa.email || "No disponible"}</p>
            <p><strong>Página Web:</strong> {InfoEmpresa.paginaWeb || "No disponible"}</p>
          </CardBody>
        </Card>

        {/* Estado y Condición */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <ClipboardCheck className="text-red-600" size={24} />
            <h2>Estado</h2>
          </CardHeader>
          <CardBody>
            <p><strong>Estado:</strong> {InfoEmpresa.estado}</p>
            <p><strong>Condición:</strong> {InfoEmpresa.condicion}</p>
          </CardBody>
        </Card>

        {/* Tiempos */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Timer className="text-gray-600" size={24} />
            <h2>Registros</h2>
          </CardHeader>
          <CardBody>
            <p><strong>Creado:</strong> {new Date(InfoEmpresa.createdAt).toLocaleDateString()}</p>
            <p><strong>Última actualización:</strong> {new Date(InfoEmpresa.updatedAt).toLocaleDateString()}</p>
          </CardBody>
        </Card>
      </div>

      {/* Modal de edición */}
      <ModalInfoEmpresa isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default InfoEmpresaContainer;
