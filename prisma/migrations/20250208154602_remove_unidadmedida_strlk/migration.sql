/*
  Warnings:

  - You are about to drop the column `unidadedMedida` on the `Producto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "unidadedMedida",
ADD COLUMN     "unidadesMedida" JSONB NOT NULL DEFAULT '[]';
