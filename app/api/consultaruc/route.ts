import prisma from "@/lib/prisma";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ruc = url.searchParams.get("ruc");

  if (!ruc) {
    return NextResponse.json({ error: "El RUC es requerido" }, { status: 400 });
  }

  try {
    const response = await axios.get(`https://api.factiliza.com/v1/ruc/info/${ruc}`, {
      headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzODE2MCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6ImNvbnN1bHRvciJ9.3kxCrMZtiUOkSI6AjlqubZxSbwPibZwXoZIZZWJm3hY",
      },
    });

    if (response.status !== 200 || !response.data.success) {
      return NextResponse.json({ error: "Error al consultar el RUC" }, { status: response.status });
    }

    const data = response.data.data; // ✅ Aquí extraemos los datos reales dentro de "data"

    // Verificamos si data existe antes de mapearlo
    if (!data) {
      return NextResponse.json({ error: "No se encontraron datos para el RUC proporcionado" }, { status: 404 });
    }

    // Mapear los datos correctamente
    const resultado = {
      ruc: data.numero,
      razonSocial: data.nombre_o_razon_social,
      tipoContribuyente: data.tipo_contribuyente,
      estado: data.estado === "SUSPENSION TEMPORAL" ? "INACTIVO" : "ACTIVO",
      condicion: data.condicion,
      departamento: data.departamento,
      provincia: data.provincia,
      distrito: data.distrito,
      direccionFiscal: data.direccion,
      ubigeo: data.ubigeo_sunat,
    };

    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    console.error("Error al consultar RUC:", error);
    return NextResponse.json({ error: "Ocurrió un error al consultar el RUC" }, { status: 500 });
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