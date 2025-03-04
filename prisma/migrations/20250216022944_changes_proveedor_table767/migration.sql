/*
  Warnings:

  - You are about to drop the column `stock` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `stockMaximo` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `stockMinimo` on the `Producto` table. All the data in the column will be lost.
  - Added the required column `stock` to the `ProductoUnidadMedida` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "stock",
DROP COLUMN "stockMaximo",
DROP COLUMN "stockMinimo";

-- AlterTable
ALTER TABLE "ProductoUnidadMedida" ADD COLUMN     "stock" INTEGER NOT NULL;
