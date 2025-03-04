import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const data = await req.json(); // Datos a actualizar

    // Verificar si el almacén existe
    const almacenExistente = await prisma.almacen.findUnique({
      where: { id },
    });

    if (!almacenExistente) {
      return NextResponse.json({ message: "Almacén no encontrado" }, { status: 404 });
    }

    // Actualizar el almacén con los nuevos datos (reemplaza todo el objeto excepto ID)
    const almacenActualizado = await prisma.almacen.update({
      where: { id },
      data,
    });

    return NextResponse.json(almacenActualizado, { status: 200 });

  } catch (error) {
    console.error("Error al actualizar el almacén:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Verificar si el almacén existe
    const almacenExistente = await prisma.almacen.findUnique({
      where: { id },
    });

    if (!almacenExistente) {
      return NextResponse.json({ message: "Almacén no encontrado" }, { status: 404 });
    }

    // Eliminar el almacén
    await prisma.almacen.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Almacén eliminado correctamente" }, { status: 200 });

  } catch (error) {
    console.error("Error al eliminar el almacén:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
