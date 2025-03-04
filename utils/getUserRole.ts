
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/client";

export type Rol = "ADMIN" | "EMPLEADO" | "GERENTE" | "INVENTARISTA" | "VENDEDOR";

function isValidRol(rol: any): rol is Rol {
  return ["ADMIN", "EMPLEADO", "GERENTE", "INVENTARISTA", "VENDEDOR"].includes(rol);
}

export async function getUserRole(): Promise<Rol> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return "EMPLEADO"; // Rol por defecto si no hay usuario
  }

  try {
    const usuarioData = await prisma.usuario.findUnique({
      where: { email: user.email },
      select: { rol: true },
    });

    if (usuarioData?.rol && isValidRol(usuarioData.rol)) {
      return usuarioData.rol;
    }

    return "EMPLEADO"; // Rol por defecto en caso de error
  } catch (error) {
    console.error("Error obteniendo el usuario desde Prisma:", error);
    return "EMPLEADO";
  }
}
