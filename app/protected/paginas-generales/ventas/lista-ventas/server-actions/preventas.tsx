"use server";


import { Preventa } from "@/app/utils/types";
import prisma from "@/lib/prisma";

export async function actualizarPreventa(formData: FormData) {
  const preventaId = formData.get("preventaId") as string;
  const clienteNombre = formData.get("cliente") as string;
  const estado = formData.get("estado") as string;
  const metodoPago = formData.get("metodoPago") as string;
  const productosRaw = formData.get("productos") as string;
  const bonificacionesRaw = formData.get("bonificaciones") as string;

  const productos = JSON.parse(productosRaw);
  const bonificaciones = JSON.parse(bonificacionesRaw);

  const subtotal = productos.reduce(
    (sum: number, p: any) => sum + (p.unidadSeleccionada?.precioVenta ?? p.precioUnitario ?? 0) * p.cantidad,
    0
  );
  const igv = productos.reduce(
    (sum: number, p: any) => sum + (p.tieneIGV ? (p.unidadSeleccionada?.precioVenta ?? p.precioUnitario ?? 0) * p.cantidad * 0.18 : 0),
    0
  );
  const total = subtotal + igv;

  const updatedPreventa = await prisma.preventa.update({
    where: { id: preventaId },
    data: {
      cliente: {
        update: {
          nombre: clienteNombre,
        },
      },
      estado,
      metodoPago,
      subtotal,
      igv,
      total,
      baseImponible: subtotal,
      valorVenta: subtotal,
      impuesto: igv,
      detallePreventas: {
        deleteMany: {},
        create: productos.map((p: any) => ({
          productoId: p.id,
          unidadMedida: p.unidadSeleccionada?.unidadMedida || "UN",
          cantidad: p.cantidad,
          precioUnitario: p.unidadSeleccionada?.precioVenta ?? p.precioUnitario ?? 0,
          total: p.cantidad * (p.unidadSeleccionada?.precioVenta ?? p.precioUnitario ?? 0),
          tipoAfectacionIGV: p.tieneIGV ? "10" : "20",
          descuento: 0,
        })),
      },
      bonificaciones: {
        deleteMany: {},
        create: bonificaciones.map((b: any) => ({
          productoId: b.productoId,
          cantidad: b.cantidad,
        })),
      },
    },
    include: {
      cliente: true,
      detallePreventas: true,
      bonificaciones: true,
    },
  });

  return {
    success: true,
    preventa: {
      ...updatedPreventa,
      cliente: {
        id: updatedPreventa.cliente.id,
        nombre: updatedPreventa.cliente.nombre,
        tipoDocumento: updatedPreventa.cliente.tipoDocumento || "DNI", // Asegúrate de incluir todas las propiedades requeridas
        numeroDocumento: updatedPreventa.cliente.numeroDocumento || "00000000",
        tipoCliente: updatedPreventa.cliente.tipoCliente || "PERSONA", // Valor por defecto o ajusta según tu modelo
        estado: updatedPreventa.cliente.estado || "ACTIVO", // Valor por defecto o ajusta según tu modelo
      },
      detallePreventas: updatedPreventa.detallePreventas.map((d) => ({
        ...d,
        producto: { nombre: productos.find((p: any) => p.id === d.productoId)?.nombre || "Producto desconocido" },
      })),
      bonificaciones: updatedPreventa.bonificaciones.map((b) => ({
        ...b,
        producto: { nombre: bonificaciones.find((bon: any) => bon.productoId === b.productoId)?.nombre || "Producto desconocido" },
      })),
    } as Preventa, // Aseguramos que coincida con la interfaz Preventa
  };
}