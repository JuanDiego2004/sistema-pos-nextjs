/*
  Warnings:

  - You are about to drop the column `unidadMedidaId` on the `Producto` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_unidadMedidaId_fkey";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "unidadMedidaId";

-- CreateTable
CREATE TABLE "ProductoUnidadMedida" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "unidadMedidaId" TEXT NOT NULL,
    "factorConversion" DOUBLE PRECISION NOT NULL,
    "precioVenta" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProductoUnidadMedida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductoUnidadMedida_productoId_unidadMedidaId_key" ON "ProductoUnidadMedida"("productoId", "unidadMedidaId");

-- AddForeignKey
ALTER TABLE "ProductoUnidadMedida" ADD CONSTRAINT "ProductoUnidadMedida_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoUnidadMedida" ADD CONSTRAINT "ProductoUnidadMedida_unidadMedidaId_fkey" FOREIGN KEY ("unidadMedidaId") REFERENCES "UnidadMedida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
