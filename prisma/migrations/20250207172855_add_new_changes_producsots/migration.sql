/*
  Warnings:

  - You are about to drop the column `unidadMedida` on the `DetalleVenta` table. All the data in the column will be lost.
  - Added the required column `unidadMedidaId` to the `DetalleVenta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DetalleVenta" DROP COLUMN "unidadMedida",
ADD COLUMN     "unidadMedidaId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UnidadMedidaProducto" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "unidad" TEXT NOT NULL,
    "factor" INTEGER NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "UnidadMedidaProducto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UnidadMedidaProducto" ADD CONSTRAINT "UnidadMedidaProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleVenta" ADD CONSTRAINT "DetalleVenta_unidadMedidaId_fkey" FOREIGN KEY ("unidadMedidaId") REFERENCES "UnidadMedidaProducto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
