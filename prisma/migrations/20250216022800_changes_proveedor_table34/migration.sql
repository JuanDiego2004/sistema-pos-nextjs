/*
  Warnings:

  - Added the required column `factorConversion` to the `ProductoUnidadMedida` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductoUnidadMedida" ADD COLUMN     "factorConversion" INTEGER NOT NULL;
