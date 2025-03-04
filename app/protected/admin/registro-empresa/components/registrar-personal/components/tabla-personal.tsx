import { Button } from "@heroui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import axios from "axios";
import { Trash, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import RegistrarPersonalModal from "./modal-register-empelado";
import { Usuario } from "@/app/utils/types";

export default function PersonalTable() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/registrosupabase");
      setUsuarios(response.data);

      // Si no hay usuarios, muestra un toast
      if (response.data.length === 0) {
        toast.error("Debe crear usuarios");
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      toast.error("Error al cargar la lista de personal");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;

    try {
      await axios.delete(`/api/usuarios/${id}`);
      toast.success("Usuario eliminado correctamente");
      fetchUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error("Error al eliminar el usuario");
    }
  };

  return (
    <>
    <h2>DEsactivado para evitar carga de datos</h2>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Personal</h2>
        <Button
          color="primary"
          startContent={<UserPlus size={20} />}
          onPress={() => setIsModalOpen(true)}
        >
          Registrar Personal
        </Button>
      </div>

      <RegistrarPersonalModal
        isOpen={isModalOpen}
        onOpenChange={() => setIsModalOpen(false)}
        onSuccess={fetchUsuarios}
      />

      {isLoading ? (
        <div className="text-center py-4 text-gray-500">Cargando...</div>
      ) : usuarios.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No hay usuarios registrados.</div>
      ) : (
        <Table aria-label="Tabla de Personal">
          <TableHeader>
            <TableColumn>NOMBRE</TableColumn>
            <TableColumn>EMAIL</TableColumn>
            <TableColumn>ROL</TableColumn>
            <TableColumn>SUCURSALES</TableColumn>
            <TableColumn>ACCIONES</TableColumn>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.nombre}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>{usuario.rol}</TableCell>
                <TableCell>
                  {usuario.usuarioSucursales
                    ?.map((s) => s.sucursal?.nombre || "Sin sucursal")
                    .join(", ")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(usuario.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
