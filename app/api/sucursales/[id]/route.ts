import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params?.id;
    if (!id) return NextResponse.json({ error: "ID no encontrado" }, { status: 400 });

    const body = await request.json();
    console.log("Datos recibidos en el cuerpo:", body); // 🛑 Verifica qué llega en la API

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Datos no proporcionados o vacíos" }, { status: 400 });
    }

    const updatedSucursal = await prisma.sucursal.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedSucursal, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar la sucursal:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}