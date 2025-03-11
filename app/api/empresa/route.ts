import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const empresa = await prisma.infoEmpresa.findFirst(); // Obtener la única empresa
    if (!empresa) {
      return NextResponse.json({ error: "No hay ninguna empresa registrada" }, { status: 404 });
    }

    return NextResponse.json(empresa, { status: 200 });
  } catch (error) {
    console.error("Error al obtener la empresa:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  const {
    ruc,
    razonSocial,
    direccionFiscal,
    distrito,
    provincia,
    departamento,
    ubigeo,
    telefono,
    email,
    paginaWeb,
    representanteLegal,
    dniRepresentante,
    tipoContribuyente,
  } = body;

  try {
    // Verificar si la empresa ya existe
    const empresaExistente = await prisma.infoEmpresa.findUnique({
      where: { ruc },
    });

    if (empresaExistente) {
      // Si existe, actualizar la información
      const empresaActualizada = await prisma.infoEmpresa.update({
        where: { ruc },
        data: {
          razonSocial,
          direccionFiscal,
          distrito,
          provincia,
          departamento,
          ubigeo,
          telefono,
          email,
          paginaWeb,
          representanteLegal,
          dniRepresentante,
          tipoContribuyente,
        },
      });

      return NextResponse.json(empresaActualizada, { status: 200 });
    }

    // Si no existe, crearla
    const nuevaEmpresa = await prisma.infoEmpresa.create({
      data: {
        ruc,
        razonSocial,
        direccionFiscal,
        distrito,
        provincia,
        departamento,
        ubigeo,
        telefono,
        email,
        paginaWeb,
        representanteLegal,
        dniRepresentante,
        tipoContribuyente,
      },
    });

    return NextResponse.json(nuevaEmpresa, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al registrar la empresa" },
      { status: 500 }
    );
  }
}


