import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ 1️⃣ OBTENER TODOS LOS PROVEEDORES
export async function GET() {
  try {
    const proveedores = await prisma.proveedor.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(proveedores);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener proveedores" }, { status: 500 });
  }
}

// ✅ 2️⃣ REGISTRAR UN NUEVO PROVEEDOR
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nuevoProveedor = await prisma.proveedor.create({
      data: body,
    });

    return NextResponse.json(nuevoProveedor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al registrar proveedor" }, { status: 500 });
  }
}

// ✅ 3️⃣ EDITAR UN PROVEEDOR POR ID
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body; // Extraer ID y datos a actualizar

    if (!id) {
      return NextResponse.json({ error: "ID del proveedor es requerido" }, { status: 400 });
    }

    const proveedorActualizado = await prisma.proveedor.update({
      where: { id },
      data,
    });

    return NextResponse.json(proveedorActualizado);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar proveedor" }, { status: 500 });
  }
}
