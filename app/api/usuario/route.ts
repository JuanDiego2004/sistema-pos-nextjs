// app/api/usuario/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";



export async function GET(request: NextRequest) {
  try {
    // Crear cliente de Supabase para el servidor
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: async (name) => (await cookieStore).get(name)?.value,
          set: (name, value, options) => {
            // No necesitamos establecer cookies en una API Route
          },
          remove: (name, options) => {
            // No necesitamos eliminar cookies en una API Route
          },
        },
      }
    );

    // Obtener el usuario autenticado desde Supabase
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json(
        { error: "No se pudo obtener el usuario autenticado" },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Obtener sucursal del usuario con Prisma
    const usuarioSucursal = await prisma.usuarioSucursal.findFirst({
      where: { usuarioId: userId },
      select: { sucursalId: true },
    });

    if (!usuarioSucursal) {
      return NextResponse.json(
        { error: "No se encontró una sucursal asociada al usuario" },
        { status: 404 }
      );
    }

    // Obtener almacén del usuario con Prisma
    const usuarioAlmacen = await prisma.usuarioAlmacen.findFirst({
      where: { usuarioId: userId },
      select: { almacenId: true },
    });

    if (!usuarioAlmacen) {
      return NextResponse.json(
        { error: "No se encontró un almacén asociado al usuario" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      usuarioId: userId,
      sucursalId: usuarioSucursal.sucursalId,
      almacenId: usuarioAlmacen.almacenId,
    });
  } catch (error) {
    console.error("Error en /api/usuario:", error);
    return NextResponse.json(
      { error: "Error al obtener datos del usuario" },
      { status: 500 }
    );
  }
}

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const email = searchParams.get("email");

//     if (!email) {
//       return NextResponse.json({ error: "Email es requerido" }, { status: 400 });
//     }

//     const usuario = await prisma.usuario.findUnique({
//       where: { email },
//       select: {
//         rol: true,
//         usuarioAlmacenes: {
//           select: { almacenId: true },
//         },
//       },
//     });

//     if (!usuario) {
//       return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
//     }

//     return NextResponse.json(
//       {
//         exito: true,
//         rol: usuario.rol,
//         usuarioAlmacenes: usuario.usuarioAlmacenes,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error al obtener el usuario:", error);
//     return NextResponse.json(
//       { error: "Error al obtener el usuario" },
//       { status: 500 }
//     );
//   }
// }