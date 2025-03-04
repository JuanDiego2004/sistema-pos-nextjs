// lib/generarSerie.ts
import prisma from '@/lib/prisma'

export async function generarSeriePorTipo(tipoComprobante: string) {
  // Tipos de comprobante:
  // '01' - Factura
  // '03' - Boleta
  const tipoVenta = tipoComprobante === '01' ? 'FACTURA' : 'BOLETA';

  // Buscar serie existente o crear una nueva
  let serie = await prisma.serieDocumento.findFirst({
    where: { tipoVenta }
  });

  if (!serie) {
    serie = await prisma.serieDocumento.create({
      data: {
        tipoVenta,
        serie: tipoVenta === 'FACTURA' ? 'F001' : 'B001',
        ultimoCorrelativo: 0
      }
    });
  }

  // Incrementar correlativo
  const nuevoCorrelativo = serie.ultimoCorrelativo + 1;

  await prisma.serieDocumento.update({
    where: { id: serie.id },
    data: { ultimoCorrelativo: nuevoCorrelativo }
  });

  // Formatear número de comprobante
  const numeroComprobante = `${serie.serie}-${nuevoCorrelativo.toString().padStart(8, '0')}`;

  return {
    serieDocumentoId: serie.id,
    numeroComprobante
  };
}