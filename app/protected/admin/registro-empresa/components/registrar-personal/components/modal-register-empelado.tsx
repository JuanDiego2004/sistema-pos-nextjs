import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import * as z from "zod";
import axios from "axios";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { toast } from "sonner";
import { Rol } from "@prisma/client";

interface PersonalModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSuccess?: () => void;
}

export default function RegistrarPersonalModal({
  isOpen,
  onOpenChange,
  onSuccess,
}: PersonalModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState<Rol>(Rol.EMPLEADO); // Usa el enum de Prisma
  const [sucursalIds, setSucursalIds] = useState<string[]>([]);
  const [almacenIds, setAlmacenIds] = useState<string[]>([]);
  const [sucursales, setSucursales] = useState<
    { id: string; nombre: string }[]
  >([]);
  const [almacenes, setAlmacenes] = useState<{ id: string; nombre: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sucursalRes, almacenRes] = await Promise.all([
          axios.get("/api/sucursales"),
          axios.get("/api/almacenes"),
        ]);

        setSucursales(sucursalRes.data);
        setAlmacenes(almacenRes.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchData();
  }, []);

  const RolEnum = z.enum([
    "ADMIN",
    "EMPLEADO",
    "GERENTE",
    "INVENTARISTA",
    "VENDEDOR",
  ]);

  // Schema actualizado para coincidir con el modelo de Prisma
  const schema = z.object({
    email: z.string().email("Correo electrónico inválido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    rol: RolEnum,
    sucursalIds: z
      .array(z.string())
      .min(1, "Debes seleccionar al menos una sucursal"),
    almacenIds: z
      .array(z.string())
      .min(1, "Debes seleccionar al menos un almacén"),
  });

  const handleRegister = async (onClose: () => void) => {
    try {
      setIsLoading(true);
      setError("");

      console.log("Datos antes de validación:", {
        email,
        password,
        nombre,
        rol,
        sucursalIds,
        almacenIds,
      });

      // Validar los datos
      const validatedData = schema.parse({
        email,
        password,
        nombre,
        rol: rol as Rol, // Asegurarnos de que rol sea tratado como un string del enum
        sucursalIds,
        almacenIds,
      });

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw new Error(authError.message);

      const userId = authData.user?.id;
      if (!userId) throw new Error("No se pudo obtener el ID del usuario");

      // Crear el objeto de datos para Prisma
      const prismaData = {
        id: userId,
        email: validatedData.email,
        nombre: validatedData.nombre,
        rol: validatedData.rol,
        usuarioSucursales: {
          create: validatedData.sucursalIds.map((sucursalId) => ({
            id: crypto.randomUUID(),
            sucursalId,
          })),
        },
        usuarioAlmacenes: {
          create: validatedData.almacenIds.map((almacenId) => ({
            id: crypto.randomUUID(),
            almacenId,
          })),
        },
      };

      await axios.post("/api/registrosupabase", prismaData);

      toast.success("Usuario registrado exitosamente");
      onClose();
      if (onSuccess) onSuccess();

      // Limpiar el formulario
      setEmail("");
      setPassword("");
      setNombre("");
      setRol("EMPLEADO");
      setSucursalIds([]);
      setAlmacenIds([]);
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error("ZodError details:", err.errors);
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido al registrar el usuario");
      }
      console.error("Error en el registro:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Registrar Nuevo Personal</ModalHeader>
            <ModalBody>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Input
                  type="email"
                  label="Email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />

                <Input
                  type="password"
                  label="Contraseña"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />

                <Input
                  type="text"
                  label="Nombre"
                  placeholder="Nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={isLoading}
                />

                <Select
                  label="Rol"
                  placeholder="Selecciona un rol"
                  selectedKeys={[rol]} // Usar selectedKeys en lugar de value
                  onSelectionChange={(keys) => {
                    // keys será un Set con el valor seleccionado
                    const selectedValue = Array.from(keys)[0] as Rol;
                    console.log("Rol seleccionado:", selectedValue);
                    setRol(selectedValue);
                  }}
                  disabled={isLoading}
                >
                  <SelectItem key="ADMIN" value="ADMIN">
                    Administrador
                  </SelectItem>
                  <SelectItem key="EMPLEADO" value="EMPLEADO">
                    Empleado
                  </SelectItem>
                  <SelectItem key="GERENTE" value="GERENTE">
                    Gerente
                  </SelectItem>
                  <SelectItem key="VENDEDOR" value="VENDEDOR">
                    Vendedor
                  </SelectItem>
                  <SelectItem key="INVENTARISTA" value="INVENTARISTA">
                    Inventarista
                  </SelectItem>
                </Select>
                {/* Selección de Sucursal */}
                <Select
                  label="Sucursal"
                  placeholder="Selecciona sucursales"
                  selectedKeys={sucursalIds}
                  onSelectionChange={(keys) => {
                    const selectedKeys = Array.from(keys as Set<string>);
                    console.log("Sucursales seleccionadas:", selectedKeys);
                    setSucursalIds(selectedKeys);
                  }}
                  multiple
                  disabled={isLoading}
                >
                  {sucursales.map((sucursal) => (
                    <SelectItem key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Almacén"
                  placeholder="Selecciona almacenes"
                  selectedKeys={almacenIds}
                  onSelectionChange={(keys) => {
                    const selectedKeys = Array.from(keys as Set<string>);
                    console.log("Almacenes seleccionados:", selectedKeys);
                    setAlmacenIds(selectedKeys);
                  }}
                  multiple
                  disabled={isLoading}
                >
                  {almacenes.map((almacen) => (
                    <SelectItem key={almacen.id} value={almacen.id}>
                      {almacen.nombre}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={() => handleRegister(onClose)}
                isLoading={isLoading}
              >
                Registrar Personal
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
