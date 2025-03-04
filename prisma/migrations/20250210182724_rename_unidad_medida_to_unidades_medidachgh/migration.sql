/*
  Warnings:

  - You are about to drop the column `tipoVenta` on the `Preventa` table. All the data in the column will be lost.
  - Added the required column `baseImponible` to the `Preventa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `igv` to the `Preventa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorVenta` to the `Preventa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DetallePreventa" ADD COLUMN     "tipoAfectacionIGV" TEXT NOT NULL DEFAULT '10';

-- AlterTable
ALTER TABLE "Preventa" DROP COLUMN "tipoVenta",
ADD COLUMN     "baseImponible" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "estadoSunat" TEXT NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "firmaDigital" TEXT,
ADD COLUMN     "igv" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "tipoComprobante" TEXT NOT NULL DEFAULT '01',
ADD COLUMN     "tipoOperacion" TEXT NOT NULL DEFAULT '0101',
ADD COLUMN     "valorVenta" DOUBLE PRECISION NOT NULL;
