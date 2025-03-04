import { usarProveedores } from "@/app/hooks/usarProveedores";
import { ubuntu } from "@/app/utils/fonts";
import {
  Button,
  Chip,
  Input,
  Select,
  SelectItem,
  Tooltip,
} from "@heroui/react";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Edit, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TablaProveedores() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [nuevoProveedor, setNuevoProveedor] = useState({
    id: "",
    nombre: "",
    ruc: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    ciudad: "",
    estado: "",
    pais: "Perú",
    web: "",
    notas: "",
    estadoProveedor: "activo",
  });
  const [rucConsulta, setRucConsulta] = useState(""); // Estado para el RUC ingresado
  const [consultandoRuc, setConsultandoRuc] = useState(false); // Estado para controlar la consulta
  const [modoEdicion, setModoEdicion] = useState(false); // Estado para saber si estamos editando
  const { proveedores, isLoading, error, mutate } = usarProveedores();
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error("Error al cargar los proveedores");
    } else if (proveedores.length === 0) {
      toast.info("No hay proveedores disponibles");
    }
  }, [proveedores, error]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNuevoProveedor({ ...nuevoProveedor, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const response = await fetch("/api/proveedores", {
        method: modoEdicion ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoProveedor),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          `Proveedor ${modoEdicion ? "editado" : "registrado"} con éxito`
        );
        onOpenChange(); // Cerrar el modal
        setNuevoProveedor({
          id: "",
          nombre: "",
          ruc: "",
          contacto: "",
          telefono: "",
          email: "",
          direccion: "",
          ciudad: "",
          estado: "",
          pais: "Perú",
          web: "",
          notas: "",
          estadoProveedor: "activo",
        }); // Limpiar el formulario
        setModoEdicion(false); // Resetear el modo de edición
        mutate(); // Actualizar los datos de la tabla
      } else {
        toast.error(
          data.error ||
            `Error al ${modoEdicion ? "editar" : "registrar"} el proveedor`
        );
      }
    } catch (error) {
      console.error("Error al registrar/editar proveedor:", error);
      toast.error("Ocurrió un error al registrar/editar el proveedor");
    } finally {
      setGuardando(false);
    }
  };

  const handleConsultarRuc = async () => {
    if (!rucConsulta) {
      toast.error("Por favor, ingresa un RUC válido");
      return;
    }
    try {
      setConsultandoRuc(true);
      const response = await fetch(`/api/consultaruc?ruc=${rucConsulta}`);
      const data = await response.json();
      if (response.ok) {
        // Actualizar los campos del formulario con los datos del RUC
        setNuevoProveedor({
          ...nuevoProveedor,
          ruc: data.ruc,
          nombre: data.razonSocial,
          direccion: data.direccionFiscal,
          ciudad: data.distrito,
          estado: data.departamento,
        });
        toast.success("Datos del RUC cargados correctamente");
      } else {
        toast.error(data.error || "Error al consultar el RUC");
      }
    } catch (error) {
      console.error("Error al consultar RUC:", error);
      toast.error("Ocurrió un error al consultar el RUC");
    } finally {
      setConsultandoRuc(false);
    }
  };

  const handleEditar = (proveedor: any) => {
    setNuevoProveedor(proveedor); // Cargar los datos del proveedor en el formulario
    setModoEdicion(true); // Activar el modo de edición
    onOpen(); // Abrir el modal
  };

  if (isLoading) {
    return <p>Cargando proveedores...</p>;
  }

  return (
    <div className="">
      <div className="flex justify-between items-center">
        <h2 className={`${ubuntu.className} text-2xl`}>Lista de proveedores</h2>
        <Button color="primary" onPress={onOpen}>
          Agregar proveedor
        </Button>
      </div>
      <div className="flex flex-col gap-3">
      <Table aria-label="Lista de proveedores">
        <TableHeader>
          <TableColumn>Nombre</TableColumn>
          <TableColumn>RUC</TableColumn>
          <TableColumn>Contacto</TableColumn>
          <TableColumn>Teléfono</TableColumn>
          <TableColumn>Email</TableColumn>
          <TableColumn>Ciudad</TableColumn>
          <TableColumn>Dirección</TableColumn>
          <TableColumn>Estado</TableColumn>
          <TableColumn>Est.Proveedor</TableColumn>
          <TableColumn>País</TableColumn>
          <TableColumn>Acciones</TableColumn>
        </TableHeader>
        <TableBody>
          {proveedores.map((proveedor: any) => (
            <TableRow key={proveedor.id}>
              <TableCell>
                <Tooltip
                  content={
                    <div className="px-1 py-2">
                      <div className="text-small font-bold">
                        {proveedor.nombre}
                      </div>
                    </div>
                  }
                  placement="top"
                  delay={500} // Retraso antes de mostrar el tooltip
                >
                  <span className="truncate max-w-[150px] block">
                    {proveedor.nombre.length > 9
                      ? `${proveedor.nombre.substring(0, 9)}...`
                      : proveedor.nombre}
                  </span>
                </Tooltip>
              </TableCell>
              <TableCell>{proveedor.ruc}</TableCell>
              <TableCell>{proveedor.contacto}</TableCell>
              <TableCell>{proveedor.telefono}</TableCell>
              <TableCell>{proveedor.email}</TableCell>
              <TableCell>{proveedor.ciudad}</TableCell>
              <TableCell>
                <Tooltip
                  content={
                    <div className="px-1 py-2">
                      <div className="text-small font-bold">
                        {proveedor.direccion}
                      </div>
                    </div>
                  }
                >
                  <span className="truncate max-w-[150px] block">
                    {proveedor.nombre.length > 10
                      ? `${proveedor.nombre.substring(0, 10)}...`
                      : proveedor.nombre}
                  </span>
                </Tooltip>
              </TableCell>
              <TableCell>{proveedor.estado}</TableCell>
              <TableCell>
                {/* Chip para Estado Proveedor */}
                <Chip
                  color={
                    proveedor.estadoProveedor === "activo"
                      ? "success"
                      : "danger"
                  }
                >
                  {proveedor.estadoProveedor}
                </Chip>
              </TableCell>
              <TableCell>{proveedor.pais}</TableCell>
              <TableCell>
                <Button
                  size="sm"
                  color="secondary"
                  onPress={() => handleEditar(proveedor)}
                >
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      {/* MODAL PARA REGISTRAR/EDITAR PROVEEDOR */}
      <Modal
        scrollBehavior="inside"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {modoEdicion ? "Editar Proveedor" : "Registrar Proveedor"}
              </ModalHeader>
              <ModalBody>
                {/* Input para consultar RUC */}
                <div className="flex gap-2 mb-4">
                  <Input
                    label="Consultar RUC"
                    placeholder="Ingrese el RUC"
                    value={rucConsulta}
                    onChange={(e) => setRucConsulta(e.target.value)}
                  />
                  <Button
                    color="secondary"
                    isLoading={consultandoRuc}
                    onPress={handleConsultarRuc}
                  >
                    Consultar
                  </Button>
                </div>
                {/* Campos del formulario */}
                <Input
                  label="Nombre"
                  name="nombre"
                  placeholder="Ingrese el nombre"
                  value={nuevoProveedor.nombre}
                  onChange={handleInputChange}
                />
                <Input
                  label="RUC"
                  name="ruc"
                  placeholder="Ingrese el RUC"
                  value={nuevoProveedor.ruc}
                  onChange={handleInputChange}
                />
                <Input
                  label="Contacto"
                  name="contacto"
                  placeholder="Nombre del contacto"
                  value={nuevoProveedor.contacto}
                  onChange={handleInputChange}
                />
                <Input
                  label="Teléfono"
                  name="telefono"
                  placeholder="Ingrese el teléfono"
                  value={nuevoProveedor.telefono}
                  onChange={handleInputChange}
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Ingrese el email"
                  value={nuevoProveedor.email}
                  onChange={handleInputChange}
                />
                <Input
                  label="Dirección"
                  name="direccion"
                  placeholder="Ingrese la dirección"
                  value={nuevoProveedor.direccion}
                  onChange={handleInputChange}
                />
                <Input
                  label="Ciudad"
                  name="ciudad"
                  placeholder="Ingrese la ciudad"
                  value={nuevoProveedor.ciudad}
                  onChange={handleInputChange}
                />
                <Input
                  label="Estado"
                  name="estado"
                  placeholder="Ingrese el estado/departamento"
                  value={nuevoProveedor.estado}
                  onChange={handleInputChange}
                />
                <Input
                  label="País"
                  name="pais"
                  placeholder="Ingrese el país"
                  value={nuevoProveedor.pais}
                  onChange={handleInputChange}
                />
                <Input
                  label="Web"
                  name="web"
                  placeholder="Ingrese la web"
                  value={nuevoProveedor.web}
                  onChange={handleInputChange}
                />
                <Input
                  label="Notas"
                  name="notas"
                  placeholder="Notas adicionales"
                  value={nuevoProveedor.notas}
                  onChange={handleInputChange}
                />
                <Select
                  label="Estado Proveedor"
                  name="estadoProveedor"
                  value={nuevoProveedor.estadoProveedor}
                  onChange={handleInputChange}
                >
                  <SelectItem key="activo">Activo</SelectItem>
                  <SelectItem key="inactivo">Inactivo</SelectItem>
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleGuardar}
                  isLoading={guardando}
                >
                  {guardando
                    ? modoEdicion
                      ? "Editando..."
                      : "Guardando..."
                    : "Guardar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
