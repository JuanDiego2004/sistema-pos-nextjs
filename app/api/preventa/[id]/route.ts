import { NextRequest, NextResponse } from "next/server";

import { XMLBuilder } from "fast-xml-parser";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const { id } = params;
      const body = await request.json();
  
      const {
        productos,
        bonificaciones,
        metodoPago,
        tipoVenta,
        notas,
        subtotal,
        impuesto,
        total,
        descuento,
        baseImponible,
        valorVenta,
        igv,
      } = body;
  
      // Validar que la preventa existe y es editable
      const preventaExistente = await prisma.preventa.findUnique({
        where: { id },
        include: { detallePreventas: true, bonificaciones: true },
      });
      if (!preventaExistente) {
        return NextResponse.json({ error: "Preventa no encontrada" }, { status: 404 });
      }
      if (preventaExistente.estado !== "pendiente" || preventaExistente.estadoSunat !== "PENDIENTE") {
        return NextResponse.json({ error: "La preventa no es editable" }, { status: 400 });
      }
  
      // Obtener datos de la empresa y cliente para el XML
      const empresa = await prisma.infoEmpresa.findFirst();
      const cliente = await prisma.cliente.findUnique({ where: { id: preventaExistente.clienteId } });
      if (!empresa || !cliente) {
        return NextResponse.json({ error: "Datos de empresa o cliente no encontrados" }, { status: 404 });
      }
  
      // Actualizar la preventa
      const preventaActualizada = await prisma.preventa.update({
        where: { id },
        data: {
          metodoPago,
          tipoComprobante: tipoVenta === "factura" ? "01" : "03",
          subtotal,
          impuesto,
          descuento,
          total,
          baseImponible,
          valorVenta,
          igv,
          notas,
          detallePreventas: {
            deleteMany: {}, // Eliminar detalles existentes
            create: productos.map((producto: any) => ({
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
            deleteMany: {}, // Eliminar bonificaciones existentes
            create: bonificaciones.map((bonificacion: any) => ({
              productoId: bonificacion.productoId,
              cantidad: bonificacion.cantidad,
            })),
          },
        },
        include: { detallePreventas: true, bonificaciones: true },
      });
  
      // Actualizar el stock (restar nuevos productos, sumar los eliminados)
      for (const producto of productos) {
        const stockActual = await prisma.productoAlmacenUnidadMedida.findUnique({
          where: {
            productoId_almacenId_unidadMedidaId: {
              productoId: producto.id,
              almacenId: preventaExistente.almacenId,
              unidadMedidaId: producto.unidadSeleccionada?.unidadMedida || "UN",
            },
          },
        });
        if (stockActual) {
          const cantidadAnterior = preventaExistente.detallePreventas.find(
            (detalle) => detalle.productoId === producto.id
          )?.cantidad || 0;
          const diferencia = producto.cantidad - cantidadAnterior;
          await prisma.productoAlmacenUnidadMedida.update({
            where: { id: stockActual.id },
            data: { stock: stockActual.stock - diferencia },
          });
        }
      }
  
      // Regenerar el XML
      const xmlBuilder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: "@_", format: true });
      const xmlData = {
        Invoice: {
           // ... (resto del XML)
        },
      };
      const xmlString = xmlBuilder.build(xmlData);
  
      await prisma.preventa.update({
        where: { id },
        data: { xml: xmlString },
      });
  
      return NextResponse.json(
        {
          success: true,
          preventa: preventaActualizada,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al actualizar preventa:", error);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
  }