import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    // Obtener los datos del formulario
    const formData = await request.formData();
    const dataJson = formData.get("data");
    if (!dataJson) {
      return NextResponse.json(
        { error: "No se recibieron datos del producto" },
        { status: 400 }
      );
    }

    // Parsear el JSON
    let dato;
    try {
      dato = JSON.parse(dataJson.toString());
    } catch (parseError) {
      console.error("Error al parsear JSON:", parseError);
      return NextResponse.json(
        { error: "Los datos del producto no son un JSON válido" },
        { status: 400 }
      );
    }

    // Validación de campos requeridos
    const requiredFields = [
      "nombre",
      "categoriaId",
      "codigoBarras",
      "codigoInterno",
      "unidadesMedida",
      "almacenes",
    ];
    const missingFields = requiredFields.filter((field) => !dato[field]);
    if (missingFields.length > 0) {
      console.error("Faltan campos requeridos:", missingFields);
      return NextResponse.json(
        { error: `Faltan campos requeridos: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validar unidadesMedida
    if (
      !Array.isArray(dato.unidadesMedida) ||
      dato.unidadesMedida.length === 0
    ) {
      console.error("Unidades de medida no válidas:", dato.unidadesMedida);
      return NextResponse.json(
        { error: "Debe especificar al menos una unidad de medida" },
        { status: 400 }
      );
    }

    // Validar almacenes
    if (!Array.isArray(dato.almacenes) || dato.almacenes.length === 0) {
      console.error("Almacenes no válidos:", dato.almacenes);
      return NextResponse.json(
        { error: "Debe especificar al menos un almacén" },
        { status: 400 }
      );
    }

    // Subir imagen a Supabase si existe
    const imagen = formData.get("imagen") as File | null;
    let imagenUrl = "";
    if (imagen) {
      const fileExt = imagen.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("productos")
        .upload(`imagenes/${fileName}`, imagen);
      if (uploadError) {
        console.error("Error al subir la imagen:", uploadError);
        throw new Error("Error al subir la imagen a Supabase");
      }
      const signedUrlResult = await supabase.storage
        .from("productos")
        .createSignedUrl(`imagenes/${fileName}`, 315567360); // 10 años
      if (signedUrlResult.error) {
        console.error(
          "Error al generar la URL firmada:",
          signedUrlResult.error
        );
        throw new Error("Error al generar la URL firmada");
      }
      imagenUrl = signedUrlResult.data.signedUrl;
    }

    // Crear producto con Prisma
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre: dato.nombre,
        categoriaId: dato.categoriaId,
        imagen: imagenUrl,
        codigoBarras: dato.codigoBarras,
        codigoInterno: dato.codigoInterno,
        descripcion: dato.descripcion || null,
        marca: dato.marca || null,
        peso: dato.peso ? parseFloat(dato.peso.toString()) : null,
        dimensiones: dato.dimensiones || null,
        impuestosAdicionales: dato.impuestosAdicionales
          ? parseFloat(dato.impuestosAdicionales.toString())
          : 0,
        descuento: dato.descuento ? parseFloat(dato.descuento.toString()) : 0,
        fechaVencimiento: dato.fechaVencimiento
          ? new Date(dato.fechaVencimiento)
          : null,
        fechaFabricacion: dato.fechaFabricacion
          ? new Date(dato.fechaFabricacion)
          : null,
        tieneIGV: dato.tieneIGV ?? false,
        estado: dato.estado || "activo",
        proveedorId: dato.proveedorId || null,
        lote: dato.lote || null,
        ubicacionAlmacen: dato.ubicacionAlmacen || null,
        costoAlmacenamiento: dato.costoAlmacenamiento
          ? parseFloat(dato.costoAlmacenamiento.toString())
          : null,
        notas: dato.notas || null,
        productoConBonificacion: dato.productoConBonificacion ?? false,
        unidadesMedida: {
          createMany: {
            data: dato.unidadesMedida.map((um: any) => ({
              unidadMedidaId: um.unidadMedidaId,
              factorConversion: parseFloat(um.factorConversion.toString()),
              esUnidadPrincipal: um.esUnidadPrincipal ?? false,
              precioCompraBase: parseFloat(um.precioCompraBase.toString()), // Corrección aquí
              precioVentaBase: parseFloat(um.precioVentaBase.toString()),
            })),
          },
        },
      },
      include: {
        categoria: true,
        proveedor: true,
        unidadesMedida: true,
      },
    });

    // Procesar almacenes y precios/stock específicos por unidad de medida
    for (const almacen of dato.almacenes) {
      const almacenId = almacen.almacenId;

      for (const unidadMedida of dato.unidadesMedida) {
        const unidadMedidaId = unidadMedida.unidadMedidaId;

        // Buscar precios y stock específicos para este almacén y unidad de medida
        const preciosEspecificos = almacen.precios?.find(
          (p: any) => p.unidadMedidaId === unidadMedidaId
        );

        // Si no hay precios específicos en 'precios', buscar en 'preciosPorAlmacen'
        const preciosPorAlmacen = unidadMedida.preciosPorAlmacen?.find(
          (p: any) => p.almacenId === almacenId
        );

        // Determinar valores con prioridad: específicos > por almacén > base
        const precioCompra =
          preciosEspecificos?.precioCompra ??
          preciosPorAlmacen?.precioCompra ??
          unidadMedida.precioCompra ??
          0;

        const precioVenta =
          preciosEspecificos?.precioVenta ??
          preciosPorAlmacen?.precioVenta ??
          unidadMedida.precioVenta ??
          0;

        const stock =
          preciosEspecificos?.stock ??
          preciosPorAlmacen?.stock ??
          unidadMedida.stock ??
          0;

        // Crear el registro en ProductoAlmacenUnidadMedida
        await prisma.productoAlmacenUnidadMedida.create({
          data: {
            productoId: nuevoProducto.id,
            almacenId: almacenId,
            unidadMedidaId: unidadMedidaId,
            stock: parseInt(stock.toString(), 10), // Stock como entero
            precioCompra: parseFloat(precioCompra.toString()),
            precioVenta: parseFloat(precioVenta.toString()),
          },
        });
      }
    }

    console.log("Producto creado exitosamente:", nuevoProducto);
    return NextResponse.json(
      { exito: true, producto: nuevoProducto },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando producto:", error);
    let errorMessage = "Error desconocido";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object" && "message" in error) {
      errorMessage = String(error.message);
    }
    return NextResponse.json(
      { error: `Error al crear el producto: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Consultar todos los productos en la base de datos con Prisma
    const productos = await prisma.producto.findMany({
      include: {
        categoria: true, // Información de la categoría
        proveedor: true, // Información del proveedor
        unidadesMedida: {
          // Unidades de medida con factores de conversión
          include: {
            unidadMedida: true, // Detalles de la unidad (código, descripción)
          },
        },
        almacenes: {
          // Stock y precios por almacén y unidad
          include: {
            almacen: {
              // Detalles del almacén
              select: {
                id: true,
                nombre: true,
                codigo: true,
                direccion: true,
                ciudad: true,
              },
            },
            unidadMedida: true, // Detalles de la unidad (código, descripción)
          },
        },
      },
    });

    // Verificar si hay productos
    if (productos.length === 0) {
      return NextResponse.json(
        { exito: true, message: "No hay productos registrados", productos: [] },
        { status: 200 }
      );
    }

    // Devolver la lista de productos
    return NextResponse.json(
      { exito: true, productos: productos },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    let errorMessage = "Error desconocido";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object" && "message" in error) {
      errorMessage = String(error.message);
    }
    return NextResponse.json(
      { error: `Error al obtener los productos: ${errorMessage}` },
      { status: 500 }
    );
  }
}
