import { Button, Input } from "@heroui/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { useState, ChangeEvent, useEffect } from "react";
import { toast } from "sonner";
import { usarCategorias } from "@/app/hooks/usarCategoria";

interface Categoria {
  id: string;
  nombre: string;
}

export default function TablaCategoria() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [nuevaCategoria, setNuevaCategoria] = useState<Categoria>({ id: "", nombre: "" });
  const [guardando, setGuardando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const { categorias, isLoading, error, crearCategoria, actualizarCategoria } = usarCategorias();

  useEffect(() => {
    if (error) {
      toast.error("Error al cargar las categorías");
    }
  }, [error]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNuevaCategoria({ ...nuevaCategoria, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      if (modoEdicion) {
        await actualizarCategoria(nuevaCategoria.id, nuevaCategoria);
      } else {
        await crearCategoria({ nombre: nuevaCategoria.nombre });
      }
      onOpenChange();
      setNuevaCategoria({ id: "", nombre: "" });
      setModoEdicion(false);
    } finally {
      setGuardando(false);
    }
  };

  const handleAgregar = () => {
    setNuevaCategoria({ id: "", nombre: "" });
    setModoEdicion(false);
    onOpen();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Tabla Categoría</h1>
        <Button color="primary" onPress={handleAgregar}>
          Agregar Categoría
        </Button>
      </div>

      <Table removeWrapper aria-label="Tabla de Categorías">
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>Nombre</TableColumn>
          <TableColumn>Acciones</TableColumn>
        </TableHeader>
        <TableBody>
          {categorias.map((categoria) => (
            <TableRow key={categoria.id}>
              <TableCell>{categoria.id}</TableCell>
              <TableCell>{categoria.nombre}</TableCell>
              <TableCell>
                <Button size="sm" color="secondary" onPress={() => {
                  setNuevaCategoria({ id: categoria.id, nombre: categoria.nombre });
                  setModoEdicion(true);
                  onOpen();
                }}>
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{modoEdicion ? "Editar Categoría" : "Registrar Categoría"}</ModalHeader>
              <ModalBody>
                <Input
                  label="Nombre"
                  name="nombre"
                  placeholder="Ingrese el nombre de la categoría"
                  value={nuevaCategoria.nombre}
                  onChange={handleInputChange}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>Cancelar</Button>
                <Button color="primary" onPress={handleGuardar} isLoading={guardando}>
                  {guardando ? (modoEdicion ? "Editando..." : "Guardando...") : "Guardar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
