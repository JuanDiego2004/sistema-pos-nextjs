import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Obtener todas las categorías
export async function GET(request: NextRequest) {
  try {
    // Consultar todas las categorías en la base de datos
    const categorias = await prisma.categoria.findMany();

    // Si no hay categorías, devolver un mensaje informativo con estado 200
    if (!categorias || categorias.length === 0) {
      return NextResponse.json(
        { message: "No se encontraron categorías" },
        { status: 200 }
      );
    }

    // Devolver las categorías con estado 200
    return NextResponse.json(categorias, { status: 200 });
  } catch (error) {
    console.error("Error al obtener las categorías:", error);

    // Devolver un mensaje de error con detalles técnicos (opcional)
    return NextResponse.json(
      { error: "Error al obtener las categorías", details: (error as any).message },
      { status: 500 }
    );
  }
}

// POST: Crear una nueva categoría
export async function POST(request: Request) {
  try {
    const { nombre } = await request.json();
    console.log("Datos recibidos en el backend:", { nombre });

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    const nuevaCategoria = await prisma.categoria.create({
      data: { nombre },
    });
    console.log("Categoría creada:", nuevaCategoria);

    return NextResponse.json(nuevaCategoria, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear la categoría" },
      { status: 500 }
    );
  }
}