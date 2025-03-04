/*
  Warnings:

  - You are about to drop the column `factor` on the `UnidadMedidaProducto` table. All the data in the column will be lost.
  - You are about to drop the column `precio` on the `UnidadMedidaProducto` table. All the data in the column will be lost.
  - You are about to drop the column `unidad` on the `UnidadMedidaProducto` table. All the data in the column will be lost.
  - Added the required column `factorConversion` to the `UnidadMedidaProducto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precioVenta` to the `UnidadMedidaProducto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unidadMedida` to the `UnidadMedidaProducto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UnidadMedidaProducto" DROP COLUMN "factor",
DROP COLUMN "precio",
DROP COLUMN "unidad",
ADD COLUMN     "factorConversion" INTEGER NOT NULL,
ADD COLUMN     "precioVenta" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unidadMedida" TEXT NOT NULL;
