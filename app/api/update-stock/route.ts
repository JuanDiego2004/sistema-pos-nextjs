// app/api/update-stock/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const { almacenRegistroId, stock } = await request.json();

    if (!almacenRegistroId || stock === undefined) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    const updatedAlmacen = await prisma.productoAlmacenUnidadMedida.update({
      where: { id: almacenRegistroId },
      data: { stock: Number(stock) },
    });

    return NextResponse.json(
      { exito: true, almacen: updatedAlmacen },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar el stock:", error);
    return NextResponse.json(
      { error: "Error al actualizar el stock" },
      { status: 500 }
    );
  }
}