/*
  Warnings:

  - You are about to drop the column `factorConversion` on the `DetallePreventa` table. All the data in the column will be lost.
  - You are about to drop the column `factorConversion` on the `ProductoUnidadMedida` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DetallePreventa" DROP COLUMN "factorConversion";

-- AlterTable
ALTER TABLE "ProductoUnidadMedida" DROP COLUMN "factorConversion";
