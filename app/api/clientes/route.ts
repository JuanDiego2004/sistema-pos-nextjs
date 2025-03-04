import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Body recibido:", body); // <-- Agregar esto para depuración

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "El cuerpo de la solicitud es inválido o está vacío" },
        { status: 400 }
      );
    }

    if (!body.nombre || !body.tipoCliente || !body.tipoDocumento || !body.numeroDocumento) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios (nombre, tipoCliente, tipoDocumento, numeroDocumento)" },
        { status: 400 }
      );
    }

    // Si email es vacío, convertirlo a null (para evitar problemas con @unique)
    const email = body.email?.trim() === "" ? null : body.email;


    const nuevoCliente = await prisma.cliente.create({
      data: {
        nombre: body.nombre,
        tipoCliente: body.tipoCliente,
        tipoDocumento: body.tipoDocumento,
        numeroDocumento: body.numeroDocumento,
        digitoVerificador: body.digitoVerificador || "",
        email,
        telefono: body.telefono,
        direccion: body.direccion,
        estado: body.estado ?? true,
      },
    });

    return NextResponse.json(
      { message: "Cliente registrado", data: nuevoCliente },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en API clientes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filtro = searchParams.get("filtro") || "";

    const clientes = await prisma.cliente.findMany({
      where: {
        OR: [
          { nombre: { contains: filtro, mode: "insensitive" } },
          { numeroDocumento: { contains: filtro } },
        ],
      },
      select: {
        id: true,
        nombre: true,
        tipoDocumento: true,
        numeroDocumento: true,
      },
    });

    return NextResponse.json(
      {
        data: clientes,
        timestamp: Date.now(), // Agregamos un timestamp para el caché
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}