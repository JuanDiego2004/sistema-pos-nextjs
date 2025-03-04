/*
  Warnings:

  - You are about to drop the column `almacenId` on the `ProductoUnidadMedida` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productoId,unidadMedidaId]` on the table `ProductoUnidadMedida` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ProductoUnidadMedida" DROP CONSTRAINT "ProductoUnidadMedida_almacenId_fkey";

-- DropIndex
DROP INDEX "ProductoUnidadMedida_productoId_unidadMedidaId_almacenId_key";

-- AlterTable
ALTER TABLE "ProductoUnidadMedida" DROP COLUMN "almacenId";

-- CreateTable
CREATE TABLE "ProductoAlmacen" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,

    CONSTRAINT "ProductoAlmacen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductoAlmacen_productoId_almacenId_key" ON "ProductoAlmacen"("productoId", "almacenId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductoUnidadMedida_productoId_unidadMedidaId_key" ON "ProductoUnidadMedida"("productoId", "unidadMedidaId");

-- AddForeignKey
ALTER TABLE "ProductoAlmacen" ADD CONSTRAINT "ProductoAlmacen_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoAlmacen" ADD CONSTRAINT "ProductoAlmacen_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
