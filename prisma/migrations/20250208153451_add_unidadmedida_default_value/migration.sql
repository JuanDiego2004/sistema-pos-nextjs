/*
  Warnings:

  - You are about to drop the column `unidadMedidaId` on the `DetalleVenta` table. All the data in the column will be lost.
  - You are about to drop the `UnidadMedidaProducto` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `factorConversion` to the `DetalleVenta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unidadMedida` to the `DetalleVenta` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DetalleVenta" DROP CONSTRAINT "DetalleVenta_unidadMedidaId_fkey";

-- DropForeignKey
ALTER TABLE "UnidadMedidaProducto" DROP CONSTRAINT "UnidadMedidaProducto_productoId_fkey";

-- AlterTable
ALTER TABLE "DetalleVenta" DROP COLUMN "unidadMedidaId",
ADD COLUMN     "factorConversion" INTEGER NOT NULL,
ADD COLUMN     "unidadMedida" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "unidadedMedida" JSONB NOT NULL DEFAULT '[]';

-- DropTable
DROP TABLE "UnidadMedidaProducto";
