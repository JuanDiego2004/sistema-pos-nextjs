import { NextResponse } from "next/server";

// Reemplaza con tu token real de Factiliza
const FACTILIZA_TOKEN = process.env.FACTILIZA_API_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzODE2MCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6ImNvbnN1bHRvciJ9.3kxCrMZtiUOkSI6AjlqubZxSbwPibZwXoZIZZWJm3hY";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dni = searchParams.get("dni");

    if (!dni || dni.length !== 8 || !/^\d+$/.test(dni)) {
      return NextResponse.json(
        { error: "DNI inválido. Debe ser un número de 8 dígitos." },
        { status: 400 }
      );
    }

    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${FACTILIZA_TOKEN}`,
      },
    };

    const response = await fetch(`https://api.factiliza.com/v1/dni/info/${dni}`, options);
    if (!response.ok) {
      throw new Error(`Error al consultar Factiliza: ${response.statusText}`);
    }

    const data = await response.json();

    // Verificar si la respuesta tiene éxito
    if (!data.success || data.status !== 200) {
      return NextResponse.json(
        { error: data.message || "Error al obtener datos del DNI" },
        { status: 400 }
      );
    }

    // Devolver los datos en un formato limpio
    return NextResponse.json(
      {
        exito: true,
        data: {
          numero: data.data.numero,
          nombres: data.data.nombres,
          apellidoPaterno: data.data.apellido_paterno,
          apellidoMaterno: data.data.apellido_materno,
          nombreCompleto: data.data.nombre_completo,
          departamento: data.data.departamento,
          provincia: data.data.provincia,
          distrito: data.data.distrito,
          direccion: data.data.direccion,
          direccionCompleta: data.data.direccion_completa,
          ubigeoReniec: data.data.ubigeo_reniec,
          ubigeoSunat: data.data.ubigeo_sunat,
          ubigeo: data.data.ubigeo,
          fechaNacimiento: data.data.fecha_nacimiento,
          sexo: data.data.sexo,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al consultar DNI:", error);
    return NextResponse.json(
      { error: "Error interno al consultar el DNI" },
      { status: 500 }
    );
  }
}