import { Producto } from '@/app/utils/types';
import prisma from '@/lib/prisma';
import { NextApiRequest } from 'next';
import { NextRequest, NextResponse } from 'next/server';

interface InvoiceDetailRequest {
  productId: string;
  unitMeasure: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  igvType: string;
}

interface UnidadSeleccionada {
  precioVenta: number;
  unidadMedida: string;
  factorConversion: number;
}

interface ProductoVenta {
  id: string;
  cantidad: number;
  unidadSeleccionada: UnidadSeleccionada;
  tieneIGV: boolean;
}

interface VentaRequestBody {
  productos: {
    nombre: string;
    id: string;
    cantidad: number;
    cantidadBonificada: number;
    unidadSeleccionada: {
      precioVenta: number;
      unidadMedida: string;
      factorConversion: number;
    } | null;
    tieneIGV: boolean;
  }[];
  clienteId: string | "";
  usuarioId: string;
  sucursalId: string;
  almacenId: string;
  metodoPago: string;
  tipoVenta: string;
  notas?: string;
  subtotal: number;
  impuesto: number;
  total: number;
  bonificaciones: { productoId: string; cantidad: number }[];
  descuento: number;
  baseImponible: number;
  valorVenta: number;
  igv: number;
  tipoOperacion: string;
  estadoSunat: string;
  latitud?: number;
  longitud?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: VentaRequestBody = await request.json();
    console.log("Datos recibidos en la API:", JSON.stringify(body, null, 2));

    const {
      productos,
      clienteId,
      usuarioId,
      sucursalId,
      almacenId,
      metodoPago,
      tipoVenta,
      notas,
      subtotal,
      latitud,
      longitud,
      impuesto,
      total,
      bonificaciones,
      descuento,
      baseImponible,
      valorVenta,
      igv,
      tipoOperacion,
      estadoSunat,
    } = body;

    // Validar campos obligatorios
    if (!usuarioId || !sucursalId || !almacenId) {
      return NextResponse.json(
        { error: "Falta información del usuario, sucursal o almacén" },
        { status: 400 }
      );
    }
    if (!clienteId) {
      return NextResponse.json({ error: "Debe especificar un cliente" }, { status: 400 });
    }

    // Obtener datos de la empresa
    const empresa = await prisma.infoEmpresa.findFirst();
    if (!empresa) {
      return NextResponse.json({ error: "No hay ninguna empresa registrada" }, { status: 404 });
    }

    // Obtener datos del cliente
    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    // Obtener o crear la serie del documento
    const tipoComprobante = tipoVenta === "factura" ? "01" : "03";
    let serieDocumento = await prisma.serieDocumento.findFirst({
      where: { tipoVenta: tipoComprobante },
      orderBy: { serie: "desc" },
    });

    if (!serieDocumento) {
      const primeraSerie = tipoComprobante === "01" ? "F001" : "B001";
      serieDocumento = await prisma.serieDocumento.create({
        data: {
          tipoVenta: tipoComprobante,
          serie: primeraSerie,
          ultimoCorrelativo: 0,
        },
      });
    }

    const LIMITE_CORRELATIVO = 9999;
    if (serieDocumento.ultimoCorrelativo >= LIMITE_CORRELATIVO) {
      const letraPrefijo = tipoComprobante === "01" ? "F" : "B";
      const numeroSerieActual = parseInt(serieDocumento.serie.slice(1));
      const nuevaSerie = `${letraPrefijo}${String(numeroSerieActual + 1).padStart(3, "0")}`;
      serieDocumento = await prisma.serieDocumento.create({
        data: {
          tipoVenta: tipoComprobante,
          serie: nuevaSerie,
          ultimoCorrelativo: 0,
        },
      });
    }

    const nuevoCorrelativo = serieDocumento.ultimoCorrelativo + 1;
    await prisma.serieDocumento.update({
      where: { id: serieDocumento.id },
      data: { ultimoCorrelativo: nuevoCorrelativo },
    });

    const numeroComprobante = `${serieDocumento.serie}-${String(nuevoCorrelativo).padStart(4, "0")}`;

    // Crear la preventa con todos los campos
    console.log("Creando preventa...");
    const preventa = await prisma.preventa.create({
      data: {
        serieDocumentoId: serieDocumento.id,
        clienteId,
        usuarioId,
        sucursalId,
        almacenId,
        metodoPago,
        tipoComprobante,
        subtotal,
        impuesto,
        descuento,
        total,
        baseImponible,
        valorVenta,
        igv,
        estado: "pendiente",
        notas,
        moneda: "PEN",
        tipoOperacion,
        estadoSunat,
        latitud: latitud ?? null,
        longitud: longitud ?? null,
        detallePreventas: {
          create: productos.map((producto) => ({
            productoId: producto.id,
            unidadMedida: producto.unidadSeleccionada?.unidadMedida || "UN",
            cantidad: producto.cantidad,
            precioUnitario: producto.unidadSeleccionada?.precioVenta || 0,
            total: producto.cantidad * (producto.unidadSeleccionada?.precioVenta || 0),
            tipoAfectacionIGV: producto.tieneIGV ? "10" : "20",
            descuento: 0,
          })),
        },
        bonificaciones: {
          create: bonificaciones.length > 0
            ? bonificaciones.map((bonificacion) => {
                console.log("Creando bonificación:", bonificacion);
                return {
                  productoId: bonificacion.productoId,
                  cantidad: bonificacion.cantidad,
                };
              })
            : [],
        },
      },
      include: { detallePreventas: true, bonificaciones: true },
    });

    console.log("Preventa creada:", preventa);

    // Actualizar stock
    for (const producto of productos) {
      const stockActual = await prisma.productoAlmacenUnidadMedida.findUnique({
        where: {
          productoId_almacenId_unidadMedidaId: {
            productoId: producto.id,
            almacenId,
            unidadMedidaId: producto.unidadSeleccionada?.unidadMedida || "UN",
          },
        },
      });

      if (stockActual) {
        const nuevoStock = stockActual.stock - producto.cantidad;
        await prisma.productoAlmacenUnidadMedida.update({
          where: { id: stockActual.id },
          data: { stock: nuevoStock },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        preventaId: preventa.id,
        numeroComprobante,
        fecha: preventa.fecha,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error al crear preventa:", { message: errorMessage, error });
    return NextResponse.json(
      {
        error: "Error al procesar la venta",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Obtener todas las preventas con sus relaciones
    const preventas = await prisma.preventa.findMany({
      orderBy: { fecha: "desc" },
      select: {
        id: true,
        fecha: true,
        total: true,
        estado: true,
        latitud: true,
        longitud: true,
        cliente: {
          select: {
            id: true,
            nombre: true,
          }
        }
      }
    });

    // Filtrar solo preventas con coordenadas
    const preventasConCoordenadas = preventas.filter(
      p => p.latitud !== null && p.longitud !== null
    );

    console.log(`Total preventas: ${preventas.length}, Con coordenadas: ${preventasConCoordenadas.length}`);

    // Obtener los estados únicos para el filtro
    const estadosUnicos = await prisma.preventa.findMany({
      select: { estado: true },
      distinct: ["estado"],
    });
    const estados = estadosUnicos.map((p) => p.estado);

    return NextResponse.json(
      {
        preventas: preventasConCoordenadas,
        estadosSistema: estados,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener preventas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}