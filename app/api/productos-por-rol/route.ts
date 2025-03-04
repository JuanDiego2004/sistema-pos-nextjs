import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

type Rol = "ADMIN" | "EMPLEADO" | "GERENTE" | "INVENTARISTA" | "VENDEDOR";

function isValidRol(rol: any): rol is Rol {
  return ["ADMIN", "EMPLEADO", "GERENTE", "INVENTARISTA", "VENDEDOR"].includes(rol);
}

export async function GET() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No estás autenticado" }, { status: 401 });
    }

    let role: Rol = "EMPLEADO"; // Valor por defecto
    let productosData: any[] = [];
    let usuarioAlmacenesData: { id: string; usuarioId: string; almacenId: string }[] = [];

    if (user?.email) {
      const usuarioData = await prisma.usuario.findUnique({
        where: { email: user.email },
        select: {
          id: true,
          rol: true,
          usuarioAlmacenes: {
            select: {
              id: true,
              usuarioId: true,
              almacenId: true,
            },
          },
        },
      });

      if (!usuarioData) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
      }

      if (usuarioData?.rol && isValidRol(usuarioData.rol)) {
        role = usuarioData.rol;
      }

      usuarioAlmacenesData = usuarioData.usuarioAlmacenes;
      const almacenesAsignados = usuarioAlmacenesData.map((ua) => ua.almacenId);

      if (role === "INVENTARISTA") {
        if (almacenesAsignados.length === 0) {
          return NextResponse.json(
            {
              exito: true,
              rol: role,
              usuarioId: usuarioData.id,
              usuarioAlmacenes: usuarioAlmacenesData,
              mensaje: "No tienes almacenes asignados",
              productos: [],
            },
            { status: 200 }
          );
        }

        productosData = await prisma.producto.findMany({
          where: {
            almacenes: {
              some: {
                almacenId: { in: almacenesAsignados },
              },
            },
          },
          include: {
            categoria: true,
            proveedor: true,
            unidadesMedida: {
              include: { // Eliminamos el filtro por unidad principal
                unidadMedida: true,
              },
            },
            almacenes: {
              where: {
                almacenId: { in: almacenesAsignados }, // Solo filtramos por almacenes asignados
              },
              include: {
                almacen: {
                  select: {
                    id: true,
                    nombre: true,
                    codigo: true,
                    direccion: true,
                    ciudad: true,
                  },
                },
                unidadMedida: true,
              },
            },
          },
        });

        productosData = productosData.filter((producto) => producto.almacenes.length > 0);
      } else {
        productosData = await prisma.producto.findMany({
          include: {
            categoria: true,
            proveedor: true,
            unidadesMedida: {
              include: { // Eliminamos el filtro por unidad principal
                unidadMedida: true,
              },
            },
            almacenes: {
              include: { // Eliminamos el filtro por unidad principal
                almacen: {
                  select: {
                    id: true,
                    nombre: true,
                    codigo: true,
                    direccion: true,
                    ciudad: true,
                  },
                },
                unidadMedida: true,
              },
            },
          },
        });
      }
    }

    return NextResponse.json(
      {
        exito: true,
        rol: role,
        usuarioId: user?.id,
        usuarioAlmacenes: usuarioAlmacenesData,
        productos: productosData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    return NextResponse.json(
      {
        error:
          "Error al obtener los productos: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}