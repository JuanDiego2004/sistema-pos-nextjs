import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const data = await request.json();

    if (!data.nombre) {
      return NextResponse.json({ exito: false, error: "Campos requeridos faltantes" }, { status: 400 });
    }

    // 🛠 **Actualizar Producto**
    const productoActualizado = await prisma.producto.update({
      where: { id },
      data: {
        nombre: data.nombre,
        imagen: data.imagen || "",
        categoriaId: data.categoriaId || undefined,
        proveedorId: data.proveedorId || undefined,
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : null,
        fechaFabricacion: data.fechaFabricacion ? new Date(data.fechaFabricacion) : null,
        tieneIGV: Boolean(data.tieneIGV),
        impuestosAdicionales: parseFloat(data.impuestosAdicionales || "0"),
        descuento: parseFloat(data.descuento || "0"),
        peso: data.peso ? parseFloat(data.peso) : null,
        costoAlmacenamiento: data.costoAlmacenamiento ? parseFloat(data.costoAlmacenamiento) : null,
        ubicacionAlmacen: data.ubicacionAlmacen || null,
        notas: data.notas || null,
      },
    });

    // 🔹 **Actualizar Unidades de Medida**
    if (data.unidadesMedida && Array.isArray(data.unidadesMedida)) {
      await Promise.all(
        data.unidadesMedida.map(async (unidad: any) => {
          await prisma.productoUnidadMedida.upsert({
            where: {
              productoId_unidadMedidaId: {
                productoId: id,
                unidadMedidaId: unidad.unidadMedidaId,
              },
            },
            update: {
              stock: unidad.stock,
              precioCompra: unidad.precioCompra,
              precioVenta: unidad.precioVenta,
              factorConversion: unidad.factorConversion,
            },
            create: {
              productoId: id,
              unidadMedidaId: unidad.unidadMedidaId,
              stock: unidad.stock,
              precioCompra: unidad.precioCompra,
              precioVenta: unidad.precioVenta,
              factorConversion: unidad.factorConversion,
            },
          });
        })
      );
    }

    // 🔹 **Actualizar Almacenes de Forma Correcta**
    if (data.almacenes && Array.isArray(data.almacenes)) {
      // 🔥 **Eliminar almacenes que ya no están en la lista**
      const almacenIds = data.almacenes.map((almacen: any) => almacen.almacenId);
      await prisma.productoAlmacen.deleteMany({
        where: {
          productoId: id,
          NOT: {
            almacenId: { in: almacenIds }, // Solo mantenemos los almacenes en la lista
          },
        },
      });

      // 🔄 **Insertar o actualizar almacenes**
      await Promise.all(
        data.almacenes.map(async (almacen: any) => {
          await prisma.productoAlmacen.upsert({
            where: {
              productoId_almacenId: {
                productoId: id,
                almacenId: almacen.almacenId,
              },
            },
            update: {
              stock: almacen.stock,
            },
            create: {
              productoId: id,
              almacenId: almacen.almacenId,
              stock: almacen.stock,
            },
          });
        })
      );
    }

    return NextResponse.json({ exito: true, producto: productoActualizado });
  } catch (error) {
    console.error("Error actualizando producto:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ exito: false, error: errorMessage }, { status: 500 });
  }
}



export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
    const { id } = await context.params;
  
    if (!id) {
      return NextResponse.json(
        { exito: false, error: "ID del producto no proporcionado" },
        { status: 400 }
      );
    }
  
    try {
      const productoEliminado = await prisma.producto.delete({
        where: {
          id: String(id),
        },
      });
  
      if (!productoEliminado) {
        return NextResponse.json(
          { exito: false, error: "Producto no encontrado" },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { exito: true, mensaje: "Producto eliminado correctamente" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
  
      if ((error as any).code === "P2025") {
        return NextResponse.json(
          { exito: false, error: "Producto no encontrado" },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { exito: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }
  