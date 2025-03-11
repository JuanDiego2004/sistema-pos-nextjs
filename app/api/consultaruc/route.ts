import prisma from "@/lib/prisma";
import axios from "axios";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request) {
  // Extraer el parámetro 'ruc' de la query string
  const { searchParams } = new URL(req.url);
  const ruc = searchParams.get("ruc");

  // Validar que el parámetro 'ruc' esté presente
  if (!ruc) {
    return NextResponse.json({ error: "RUC es requerido" }, { status: 400 });
  }

  try {
    // Obtener el token de autorización desde una variable de entorno
    const token = process.env.FACTILIZA_API_TOKEN;
    if (!token) {
      throw new Error("Token de autorización no configurado");
    }

    // Configurar las opciones de la solicitud a una API externa
    const options: RequestInit = {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    };

    // Hacer la solicitud a la API externa
    const response = await fetch(
      `https://api.factiliza.com/v1/ruc/info/${ruc}`,
      options
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al consultar la API");
    }

    // Devolver la respuesta exitosa
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Manejar solicitudes POST para registrar un proveedor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      nombre,
      ruc,
      contacto,
      telefono,
      email,
      direccion,
      ciudad,
      estado,
      pais,
      web,
      notas,
      estadoProveedor,
    } = body;

    // Validar que los campos obligatorios estén presentes
    if (!nombre || !estadoProveedor) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Crear el proveedor en la base de datos
    const nuevoProveedor = await prisma.proveedor.create({
      data: {
        nombre,
        ruc,
        contacto,
        telefono,
        email,
        direccion,
        ciudad,
        estado,
        pais,
        web,
        notas,
        estadoProveedor,
      },
    });

    return NextResponse.json(
      { message: "Proveedor registrado con éxito", proveedor: nuevoProveedor },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar proveedor:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al registrar el proveedor" },
      { status: 500 }
    );
  }
}