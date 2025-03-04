import { Producto } from '@/app/utils/types';
import prisma from '@/lib/prisma';
import { NextApiRequest } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import { XMLBuilder } from "fast-xml-parser";


interface InvoiceDetailRequest {
  productId: string;
  unitMeasure: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  igvType: string;
}



// Define explicit interfaces for type safety
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
  clienteId: string | ""; // Ajusta según si es opcional
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

    // Generar el XML
    const xmlBuilder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      format: true,
    });

    const xmlData = {
      Invoice: {
        "@_xmlns": "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
        "@_xmlns:cac": "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
        "@_xmlns:cbc": "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
        "@_xmlns:ext": "urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2",
        "ext:UBLExtensions": {
          "ext:UBLExtension": {
            "ext:ExtensionContent": "", // Firma digital se añadiría aquí
          },
        },
        "cbc:UBLVersionID": "2.1",
        "cbc:CustomizationID": "2.0",
        "cbc:ID": numeroComprobante,
        "cbc:IssueDate": new Date().toISOString().split("T")[0],
        "cbc:InvoiceTypeCode": {
          "@_listID": tipoOperacion,
          "#text": tipoComprobante,
        },
        "cbc:DocumentCurrencyCode": "PEN",
        "cac:AccountingSupplierParty": {
          "cac:Party": {
            "cac:PartyIdentification": {
              "cbc:ID": { "@_schemeID": "6", "#text": empresa.ruc },
            },
            "cac:PartyLegalEntity": {
              "cbc:RegistrationName": empresa.razonSocial,
            },
          },
        },
        "cac:AccountingCustomerParty": {
          "cac:Party": {
            "cac:PartyIdentification": {
              "cbc:ID": { "@_schemeID": cliente.tipoDocumento === "RUC" ? "6" : "1", "#text": cliente.numeroDocumento },
            },
            "cac:PartyLegalEntity": {
              "cbc:RegistrationName": cliente.nombre,
            },
          },
        },
        "cac:LegalMonetaryTotal": {
          "cbc:LineExtensionAmount": { "@_currencyID": "PEN", "#text": subtotal },
          "cbc:TaxInclusiveAmount": { "@_currencyID": "PEN", "#text": total },
          "cbc:PayableAmount": { "@_currencyID": "PEN", "#text": total },
        },
        "cac:TaxTotal": {
          "cbc:TaxAmount": { "@_currencyID": "PEN", "#text": igv },
          "cac:TaxSubtotal": {
            "cbc:TaxableAmount": { "@_currencyID": "PEN", "#text": baseImponible },
            "cbc:TaxAmount": { "@_currencyID": "PEN", "#text": igv },
            "cac:TaxCategory": {
              "cac:TaxScheme": {
                "cbc:ID": "1000",
                "cbc:Name": "IGV",
                "cbc:TaxTypeCode": "VAT",
              },
            },
          },
        },
        "cac:InvoiceLine": productos.map((producto, index) => ({
          "cbc:InvoicedQuantity": { "@_unitCode": producto.unidadSeleccionada?.unidadMedida || "NIU", "#text": producto.cantidad },
          "cbc:LineExtensionAmount": {
            "@_currencyID": "PEN",
            "#text": (producto.unidadSeleccionada?.precioVenta || 0) * producto.cantidad,
          },
          "cac:Item": {
            "cbc:Description": producto.nombre || "Producto sin nombre", // Usa el nombre si está disponible
          },
          "cac:Price": {
            "cbc:PriceAmount": { "@_currencyID": "PEN", "#text": producto.unidadSeleccionada?.precioVenta || 0 },
          },
          "cac:TaxTotal": producto.tieneIGV
            ? {
                "cbc:TaxAmount": {
                  "@_currencyID": "PEN",
                  "#text": ((producto.unidadSeleccionada?.precioVenta || 0) * producto.cantidad * 0.18).toFixed(2),
                },
                "cac:TaxSubtotal": {
                  "cbc:TaxableAmount": {
                    "@_currencyID": "PEN",
                    "#text": ((producto.unidadSeleccionada?.precioVenta || 0) * producto.cantidad).toFixed(2),
                  },
                  "cbc:TaxAmount": {
                    "@_currencyID": "PEN",
                    "#text": ((producto.unidadSeleccionada?.precioVenta || 0) * producto.cantidad * 0.18).toFixed(2),
                  },
                  "cac:TaxCategory": {
                    "cbc:Percent": "18",
                    "cbc:TaxExemptionReasonCode": "10", // Gravado
                    "cac:TaxScheme": {
                      "cbc:ID": "1000",
                      "cbc:Name": "IGV",
                      "cbc:TaxTypeCode": "VAT",
                    },
                  },
                },
              }
            : undefined,
        })),
      },
    };

    const xmlString = xmlBuilder.build(xmlData);

    // Guardar el XML en la base de datos
    await prisma.preventa.update({
      where: { id: preventa.id },
      data: { xml: xmlString },
    });

    return NextResponse.json(
      {
        success: true,
        preventaId: preventa.id,
        numeroComprobante,
        fecha: preventa.fecha,
        xml: xmlString, // Devolver el XML en la respuesta
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

export async function GET(request: NextRequest) {
  try {
    // Obtener todas las preventas con sus relaciones
    const preventas = await prisma.preventa.findMany({
      orderBy: { fecha: "desc" }, // Ordenar por fecha descendente
      include: {
        serieDocumento: true,
        cliente: true,
        usuario: true,
        sucursal: true,
        almacen: true,
        detallePreventas: {
          include: {
            producto: true, // Incluir datos del producto
          },
        },
        bonificaciones: {
          include: {
            producto: true, // Incluir datos del producto
          },
        },
      },
    });

    // Obtener los estados únicos para el filtro
    const estadosUnicos = await prisma.preventa.findMany({
      select: { estado: true },
      distinct: ["estado"],
    });
    const estados = estadosUnicos.map((p) => p.estado);

    return NextResponse.json(
      {
        preventas,
        estados,
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