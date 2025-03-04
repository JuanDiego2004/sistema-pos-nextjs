/*
  Warnings:

  - You are about to drop the column `almacenId` on the `Producto` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productoId,unidadMedidaId,almacenId]` on the table `ProductoUnidadMedida` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `almacenId` to the `ProductoUnidadMedida` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_almacenId_fkey";

-- DropIndex
DROP INDEX "ProductoUnidadMedida_productoId_unidadMedidaId_key";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "almacenId";

-- AlterTable
ALTER TABLE "ProductoUnidadMedida" ADD COLUMN     "almacenId" TEXT NOT NULL,
ALTER COLUMN "stock" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "ProductoUnidadMedida_productoId_unidadMedidaId_almacenId_key" ON "ProductoUnidadMedida"("productoId", "unidadMedidaId", "almacenId");

-- AddForeignKey
ALTER TABLE "ProductoUnidadMedida" ADD CONSTRAINT "ProductoUnidadMedida_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
