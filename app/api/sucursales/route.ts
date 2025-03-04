import prisma from "@/lib/prisma";
import { Params } from "next/dist/server/request/params";
import { NextResponse } from "next/server";
import { string } from "zod";



export async function GET() {
  try {
    const sucursales = await prisma.sucursal.findMany({
      select: {
        id: true,
        nombre: true,
        direccion: true,
        estado: true,
        codigoPostal: true,
        pais: true,
        telefono: true,
        email: true,
        ciudad: true,
      },
    });

    return NextResponse.json(sucursales, { status: 200 });
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}


export async function POST(request: Request) {
    const body = await request.json();
    const { 
        nombre,
         direccion, 
         ciudad, 
         estado,
          codigoPostal, 
          pais, 
          telefono, 
          email, 
          empresaId } = body; 

          try {
            const nuevaSucursal = await prisma.sucursal.create({
              data: {
                nombre,
                direccion,
                ciudad,
                estado,
                codigoPostal,
                pais,
                telefono,
                email,
                empresa: {
                  connect: { id: empresaId }, // Conecta la sucursal a la empresa
                },
              },
            });
            return NextResponse.json(nuevaSucursal, { status: 201 });
          } catch (error) {
            console.error(error);
            return NextResponse.json({ error: 'Error al registrar la sucursal' }, { status: 500 });
          }
}


