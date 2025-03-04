"use client";
import { useState, useEffect } from "react";
import { Edit, Delete, Loader2, SquarePlus, Trash } from "lucide-react";
import { toast } from "sonner";
import ActualizarSucursalModal from "./editar-sucursales";
import { AddNoteIcon } from "@/components/iconos/icons";
import ModalRegistroSucursal from "../registro-sucursal/registro-sucursal";
import { Sucursal } from "@/app/utils/types";
import { usarSucursal } from "@/app/hooks/usarSucursal";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/modal";
import { Squada_One } from "next/font/google";
import { Card, CardBody, CardHeader, Tooltip } from "@heroui/react";
import AlmacenModal from "../almacenes/components/modal-register-alamcen";

interface TablaSucursalProps {
  sucursales: Sucursal[];
  empresaId: string;
  fetchSucursales: () => void;
}


// Componente principal
export default function SucursalesTable({ sucursales, empresaId, fetchSucursales} : TablaSucursalProps) {
  const [editarSucursal, setEditarSucursal] = useState<Sucursal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSucursalEditar, setLoadingSucursalEditar] = useState(false);
  const [almacenModalOpen, setAlmacenModalOpen] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(
    null
  );
  const { isOpen, onOpenChange } = useDisclosure();

  // Función para manejar la edición de una sucursal
  const handleEdit = (sucursal: Sucursal) => {
    setEditarSucursal(sucursal);
    setIsModalOpen(true);
  };

  const handleAlmacenRegistration = (sucursal: Sucursal) => {
    setSelectedSucursal(sucursal);
    setAlmacenModalOpen(true);
  };

  const handleUpdate = async (updatedSucursal: Sucursal) => {
    setLoadingSucursalEditar(true);
    try {
      const sucursalConEmpresa = { ...updatedSucursal, empresaId };
      const response = await fetch(`/api/sucursales/${sucursalConEmpresa.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sucursalConEmpresa),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar la sucursal");
      }
      toast.success("Sucursal actualizada correctamente");
      setIsModalOpen(false);
      fetchSucursales();
    } catch (error) {
      toast.error("Ocurrió un error al actualizar la sucursal");
    } finally {
      setLoadingSucursalEditar(false);
    }
  };
  


  const handleAlmacenSuccess = () => {
    fetchSucursales(); // Recargar las sucursales después de registrar un almacén
    
    toast.success("Almacén registrado correctamente");
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

  // Renderizar las celdas de la tabla
  const renderCell = (sucursal: Sucursal, columnKey: React.Key) => {
    const key = String(columnKey);
    switch (key) {
      case "actions":
        return (
          <TableCell>
            <div className="flex gap-2">
              <Tooltip className="capitalize" color="primary" content="Editar">
                <button
                  onClick={() => handleEdit(sucursal)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Edit size={20} />
                </button>
              </Tooltip>
              <Tooltip className="capitalize" color="danger" content="Eliminar">
              <button className="text-blue-500 text-xl hover:text-blue-700">
                <Trash color="red" size={20} />
              </button>
              </Tooltip>
              <Tooltip className="capitalize" color="success" content="Registrar Almacén">
              <button
                onClick={() => handleAlmacenRegistration(sucursal)}
                className="text-blue-500 text-xl hover:text-blue-700"
              >
                <SquarePlus color="green" size={20} />
              </button>
              </Tooltip>
             
            </div>
          </TableCell>
        );
      default:
        return (
          <TableCell>{sucursal[key as keyof Sucursal] || "-----"}</TableCell>
        );
    }
  };

  return (
    <>
      {loadingSucursalEditar && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-bold">Actualizando...</p>
          </div>
        </div>
      )}

      {selectedSucursal && (
        <AlmacenModal
          isOpen={almacenModalOpen}
          onOpenChange={() => {
            setAlmacenModalOpen(false);
            setSelectedSucursal(null); // Limpiar la sucursal seleccionada al cerrar
          }}
          sucursalId={selectedSucursal.id}
          sucursalNombre={selectedSucursal.nombre}
          onSuccess={handleAlmacenSuccess}
        />
      )}

      <ActualizarSucursalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sucursal={
          editarSucursal
            ? { ...editarSucursal, empresaId: editarSucursal.empresaId || "" }
            : null
        }
        onActualizar={handleUpdate}
      />

      <div className="mt-7">
       <Card>
         <CardHeader>
         <div className="w-full flex justify-between items-center">
          <h2 className="text-xl font-bold mb-4">Lista de Sucursales</h2>
          <Button color="warning" onClick={onOpenChange}>
            Registrar Sucursal
          </Button>
        </div>
         </CardHeader>
         <CardBody>


        {sucursales.length === 0 ? (
          <p>Cargando sucursales...</p>
        ) : (
          <Table aria-label="Tabla de Sucursales">
            <TableHeader>
              {columns.map(({ key, label }) => (
                <TableColumn key={key}>{label}</TableColumn>
              ))}
            </TableHeader>
            <TableBody>
              {sucursales.map((sucursal) => (
                <TableRow key={sucursal.id}>
                  {columns.map(({ key }) => renderCell(sucursal, key))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
         </CardBody>
       </Card>
      </div>

      <ModalRegistroSucursal
        onOpenChange={onOpenChange}
        isOpen={isOpen}
        cargarSucursales={fetchSucursales}
      />
    </>
  );
}
