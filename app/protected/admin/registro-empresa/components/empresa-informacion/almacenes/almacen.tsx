import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  ModalFooter,
  Button,
  Input,
  Card,
  CardHeader,
  CardBody,
} from "@heroui/react";
import { Edit, Delete } from "lucide-react";

import { Almacen } from "@/app/utils/types";
import { useState } from "react";
import { bebas, monstserrat, ubuntu } from "@/app/utils/fonts";


export default function AlmacenesTable({
  almacenes,
  editarAlmacen,
eliminarAlmacen}
 : {
almacenes: Almacen[];
editarAlmacen: (id: string, almacen: Almacen) => void;
eliminarAlmacen: (id: string) => void;  
}) {
 const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState<Almacen | null>(null);

  if (!almacenes) return <p>Cargando almacenes...</p>;

  const handleEditClick = (almacen: Almacen) => {
    console.log("Abriendo modal con:", almacen);
    setAlmacenSeleccionado(almacen);
    onOpen();
  };

  const handleSave = () => {
    if (almacenSeleccionado) {
      editarAlmacen(almacenSeleccionado.id, almacenSeleccionado);
      onOpenChange(); // Cierra el modal después de guardar
    }
  };

  const columns = [
    { key: "nombre", label: "NOMBRE" },
    { key: "direccion", label: "DIRECCIÓN" },
    { key: "ciudad", label: "CIUDAD" },
    { key: "estado", label: "ESTADO" },
    { key: "codigoPostal", label: "CÓDIGO POSTAL" },
    { key: "pais", label: "PAÍS" },
    { key: "telefono", label: "TELÉFONO" },
    { key: "email", label: "EMAIL" },
    { key: "actions", label: "ACCIONES" },
  ];

  return (
    <>
      {/* Tabla de Almacenes */}
     <div className="mt-7">
      <Card>
         <CardHeader>
           <h2 className={`${ubuntu.className} text-2xl`}>Lista de Almacenes</h2>
         </CardHeader>
         <CardBody>
         <Table aria-label="Tabla de Almacenes">
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={almacenes}>
          {(almacen) => (
            <TableRow key={almacen.id}>
              {(columnKey) =>
                columnKey === "actions" ? (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button isIconOnly variant="faded" onPress={() => handleEditClick(almacen)}>
                        <Edit />
                      </Button>
                      <Button
                        isIconOnly
                        variant="faded"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (window.confirm(`¿Estás seguro de que deseas eliminar el almacén "${almacen.nombre}"?`)) {
                            eliminarAlmacen(almacen.id);
                          }
                        }}
                      >
                        <Delete size={20} />
                      </Button>
                    </div>
                  </TableCell>
                ) : (
                  <TableCell>{getKeyValue(almacen, columnKey)}</TableCell>
                )
              }
            </TableRow>
          )}
        </TableBody>
      </Table>
         </CardBody>
      </Card>
     
     </div>

      {/* Modal para editar almacén */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Editar Almacén</ModalHeader>
              <ModalBody>
                {almacenSeleccionado && (
                  <div className="flex flex-col gap-2">
                    <Input
                      label="Nombre"
                      value={almacenSeleccionado.nombre || ""}
                      onChange={(e) =>
                        setAlmacenSeleccionado({ ...almacenSeleccionado, nombre: e.target.value })
                      }
                    />
                    <Input
                      label="Dirección"
                      value={almacenSeleccionado.direccion || ""}
                      onChange={(e) =>
                        setAlmacenSeleccionado({ ...almacenSeleccionado, direccion: e.target.value })
                      }
                    />
                    <Input
                      label="Ciudad"
                      value={almacenSeleccionado.ciudad || ""}
                      onChange={(e) =>
                        setAlmacenSeleccionado({ ...almacenSeleccionado, ciudad: e.target.value })
                      }
                    />
                    <Input
                      label="Estado"
                      value={almacenSeleccionado.estado || ""}
                      onChange={(e) =>
                        setAlmacenSeleccionado({ ...almacenSeleccionado, estado: e.target.value })
                      }
                    />
                    <Input
                      label="Código Postal"
                      value={almacenSeleccionado.codigoPostal || ""}
                      onChange={(e) =>
                        setAlmacenSeleccionado({
                          ...almacenSeleccionado,
                          codigoPostal: e.target.value,
                        })
                      }
                    />
                    <Input
                      label="País"
                      value={almacenSeleccionado.pais || ""}
                      onChange={(e) =>
                        setAlmacenSeleccionado({ ...almacenSeleccionado, pais: e.target.value })
                      }
                    />
                    <Input
                      label="Teléfono"
                      value={almacenSeleccionado.telefono || ""}
                      onChange={(e) =>
                        setAlmacenSeleccionado({ ...almacenSeleccionado, telefono: e.target.value })
                      }
                    />
                    <Input
                      label="Email"
                      value={almacenSeleccionado.email || ""}
                      onChange={(e) =>
                        setAlmacenSeleccionado({ ...almacenSeleccionado, email: e.target.value })
                      }
                    />
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={handleSave}>
                  Guardar cambios
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}