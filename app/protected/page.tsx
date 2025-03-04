
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

type Rol = "ADMIN" | "EMPLEADO" | "GERENTE" | "INVENTARISTA" | "VENDEDOR";

function isValidRol(rol: any): rol is Rol {
  return ["ADMIN", "EMPLEADO", "GERENTE", "INVENTARISTA", "VENDEDOR"].includes(rol);
}

export default async function ProtectedPage() {
  const supabase = await createClient();
  
  let role: Rol = "EMPLEADO"; // Valor por defecto

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/(auth-pages)/sign-in');
  }

  if (user?.email) {
    try {
      const usuarioData = await prisma.usuario.findUnique({
        where: { email: user.email },
        select: { rol: true }, // Solo traemos el rol
      });

      console.log("Datos obtenidos de la tabla Usuario:", usuarioData);

      if (usuarioData?.rol && isValidRol(usuarioData.rol)) {
        role = usuarioData.rol; // Asignamos el rol correcto
      }
    } catch (error) {
      console.error("Error obteniendo el usuario desde Prisma:", error);
    }
  }

  return (
    <div>
      <p>Email del usuario: {user?.email}</p>
      <p>El rol del usuario es: {role}</p>
    </div>
  );
}
