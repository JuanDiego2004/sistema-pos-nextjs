/*
  Warnings:

  - You are about to drop the column `precioCompra` on the `Producto` table. All the data in the column will be lost.
  - Added the required column `precioCompra` to the `ProductoUnidadMedida` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "precioCompra";

-- AlterTable
ALTER TABLE "ProductoUnidadMedida" ADD COLUMN     "precioCompra" DOUBLE PRECISION NOT NULL;
