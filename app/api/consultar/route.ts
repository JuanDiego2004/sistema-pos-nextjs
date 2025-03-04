import { NextResponse } from "next/server";
import axios from "axios";

// Definir las interfaces para las respuestas de la API
interface DNIResponse {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipoDocumento: string;
  numeroDocumento: string;
  digitoVerificador?: string;
}

interface RUCResponse {
  razonSocial: string;
  tipoDocumento: string;
  numeroDocumento: string;
  estado: string;
  condicion: string;
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const numero = url.searchParams.get("numero");
  const tipo = url.searchParams.get("tipo"); // "DNI" o "RUC"
  const token = "apis-token-13045.EbXDOIM4hNDffai1OIERH3wI6P2S2JQZ";

  if (!numero || !tipo) {
    return NextResponse.json(
      { error: "Debe proporcionar un número y tipo de documento (DNI o RUC)." },
      { status: 400 }
    );
  }

  let apiUrl = "";
  if (tipo === "DNI") {
    if (numero.length !== 8) {
      return NextResponse.json({ error: "El DNI debe tener 8 dígitos." }, { status: 400 });
    }
    apiUrl = `https://api.apis.net.pe/v2/reniec/dni?numero=${numero}`;
  } else if (tipo === "RUC") {
    if (numero.length !== 11) {
      return NextResponse.json({ error: "El RUC debe tener 11 dígitos." }, { status: 400 });
    }
    apiUrl = `https://api.apis.net.pe/v2/sunat/ruc?numero=${numero}`;
  } else {
    return NextResponse.json({ error: "Tipo de documento inválido." }, { status: 400 });
  }

  try {
    const response = await axios.get<DNIResponse | RUCResponse>(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    let errorMessage = "Error al consultar el documento.";
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
      statusCode = error.response?.status || 500;

      if (error.response?.status === 404) {
        errorMessage = tipo === "DNI" ? "DNI no encontrado." : "RUC no encontrado.";
      }
    }

    console.error("Error al consultar la API:", errorMessage);

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
