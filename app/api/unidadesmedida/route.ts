// app/api/unidad-medida/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

type UnidadMedida = {
  id: string;
  codigo: string;
  descripcion: string;
};

// GET: Obtener todas las unidades de medida
export async function GET() {
  try {
    const unidades = await prisma.unidadMedida.findMany();
    return NextResponse.json(unidades);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener las unidades de medida' }, { status: 500 });
  }
}

// POST: Crear una nueva unidad de medida
export async function POST(request: Request) {
  try {
    const { codigo, descripcion }: Partial<UnidadMedida> = await request.json();
    if (!codigo || !descripcion) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const nuevaUnidad = await prisma.unidadMedida.create({
      data: { codigo, descripcion },
    });
    return NextResponse.json(nuevaUnidad, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear la unidad de medida' }, { status: 500 });
  }
}

// PUT: Actualizar una unidad de medida existente
export async function PUT(request: Request) {
  try {
    const { id, codigo, descripcion }: Partial<UnidadMedida> = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    const unidadActualizada = await prisma.unidadMedida.update({
      where: { id },
      data: { codigo, descripcion },
    });
    return NextResponse.json(unidadActualizada);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar la unidad de medida' }, { status: 500 });
  }
}

// DELETE: Eliminar una unidad de medida
export async function DELETE(request: Request) {
  try {
    const { id }: Partial<UnidadMedida> = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    await prisma.unidadMedida.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Unidad de medida eliminada correctamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar la unidad de medida' }, { status: 500 });
  }
}