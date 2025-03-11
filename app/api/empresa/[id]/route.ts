
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Cambiado el enfoque para manejar los parámetros dinámicos
export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    // Obtener el ID de manera segura
    const empresaId = context.params.id;
    
    // Log para depuración
    console.log("ID recibido:", empresaId);
    
    if (!empresaId) {
      return NextResponse.json({ error: "ID de empresa no proporcionado" }, { status: 400 });
    }

    // Procesar los datos del formulario
    const formData = await request.formData();
    
    const data: Record<string, any> = {};
    
    // Procesar cada campo del formulario
    for (const [key, value] of formData.entries()) {
      if (key === "certificadoDigital" || key === "clavePrivada") {
        if (value instanceof File) {
          const buffer = Buffer.from(await value.arrayBuffer());
          data[key] = buffer;
        } else {
          data[key] = null;
        }
      } else {
        data[key] = value;
      }
    }
    
    // Validar que haya datos para actualizar
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No se enviaron datos para actualizar" }, { status: 400 });
    }

    // Verificar que la empresa existe
    const existingEmpresa = await prisma.infoEmpresa.findUnique({ 
      where: { id: empresaId } 
    });
    
    if (!existingEmpresa) {
      return NextResponse.json(
        { error: `No se encontró ninguna empresa con id ${empresaId}` }, 
        { status: 404 }
      );
    }

    // Actualizar la empresa
    const updatedEmpresa = await prisma.infoEmpresa.update({
      where: { id: empresaId },
      data: {
        ruc: data.ruc,
        razonSocial: data.razonSocial,
        nombreComercial: data.nombreComercial,
        direccionFiscal: data.direccionFiscal,
        distrito: data.distrito,
        provincia: data.provincia,
        departamento: data.departamento,
        ubigeo: data.ubigeo,
        telefono: data.telefono,
        email: data.email,
        paginaWeb: data.paginaWeb,
        representanteLegal: data.representanteLegal,
        dniRepresentante: data.dniRepresentante,
        tipoContribuyente: data.tipoContribuyente,
        estado: data.estado,
        condicion: data.condicion,
        logoUrl: data.logoUrl,
        certificadoDigital: data.certificadoDigital,
        clavePrivada: data.clavePrivada,
        certificadoPassword: data.certificadoPassword,
      },
    });
    
    // Respuesta exitosa
    return NextResponse.json({ success: true, data: updatedEmpresa });
    
  } catch (error) {
    // Capturar y manejar el error correctamente
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error updating empresa:", errorMessage);
    
    // IMPORTANTE: Asegurarnos de devolver un objeto válido
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}