-- AlterTable
ALTER TABLE "ProductoAlmacen" ADD COLUMN     "precioCompra" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "precioVenta" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ProductoAlmacenUnidadMedida" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,
    "unidadMedidaId" TEXT NOT NULL,
    "precioCompra" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "precioVenta" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "ProductoAlmacenUnidadMedida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductoAlmacenUnidadMedida_productoId_almacenId_unidadMedi_key" ON "ProductoAlmacenUnidadMedida"("productoId", "almacenId", "unidadMedidaId");

-- AddForeignKey
ALTER TABLE "ProductoAlmacenUnidadMedida" ADD CONSTRAINT "ProductoAlmacenUnidadMedida_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoAlmacenUnidadMedida" ADD CONSTRAINT "ProductoAlmacenUnidadMedida_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoAlmacenUnidadMedida" ADD CONSTRAINT "ProductoAlmacenUnidadMedida_unidadMedidaId_fkey" FOREIGN KEY ("unidadMedidaId") REFERENCES "UnidadMedida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
