import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Datos recibidos en el endpoint:', body);
    
    const { id, email, nombre, rol, usuarioSucursales, usuarioAlmacenes } = body;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario con este email ya existe' },
        { status: 400 }
      );
    }

    // Crear el usuario con sus relaciones
    const usuario = await prisma.usuario.create({
      data: {
        id,
        email,
        nombre,
        rol,
        usuarioSucursales,
        usuarioAlmacenes,
      },
      include: {
        usuarioSucursales: true,
        usuarioAlmacenes: true,
      },
    });

    console.log('Usuario creado en Prisma:', usuario);
    return NextResponse.json({ usuario }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error detallado:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      return NextResponse.json(
        { error: err.message },
        { status: 500 }
      );
    } else {
      console.error('Error desconocido:', err);
      return NextResponse.json(
        { error: 'Error desconocido al crear el usuario' },
        { status: 500 }
      );
    }
  }
}

// Obtener todos los usuarios
export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        preventas: true,
        notificaciones: true,
        usuarioSucursales: {
          include:{
            sucursal: true
          }
        },
        usuarioAlmacenes: true,
      },
    });
    return NextResponse.json(usuarios, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error obteniendo los usuarios" }, { status: 500 });
  }
}
