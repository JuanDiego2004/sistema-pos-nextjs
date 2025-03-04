import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const almacenes = await prisma.almacen.findMany();
    if (!almacenes || almacenes.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron categorías" },
        { status: 404 }
      );
    }
    return NextResponse.json(almacenes, { status: 200 });
  } catch (error) {
    console.error("Error fetching categorías:", error);
    return NextResponse.json(
      { error: "Error al obtener las categorías", details: (error as any).message },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  const body = await request.json();
  const {
    nombre,
    codigo,
    direccion,
    ciudad,
    estadoRegion,
    codigoPostal,
    pais,
    responsable,
    telefono,
    email,
    tipoAlmacen,
    capacidadMaxima,
    metodoValuacion,
    sucursalId,
  } = body;

  try {
    const nuevoAlmacen = await prisma.almacen.create({
      data: {
        nombre,
        codigo,
        direccion,
        ciudad,
        estadoRegion,
        codigoPostal,
        pais,
        responsable,
        telefono,
        email,
        tipoAlmacen,
        capacidadMaxima,
        metodoValuacion,
        sucursal: {
          connect: { id: sucursalId }, // Conecta el almacén a la sucursal
        },
      },
    });
    return NextResponse.json(nuevoAlmacen, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al registrar el almacén' }, { status: 500 });
  }
}

