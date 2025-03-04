/*
  Warnings:

  - A unique constraint covering the columns `[ruc]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "razonSocial" TEXT,
ADD COLUMN     "ruc" TEXT,
ALTER COLUMN "nombre" DROP NOT NULL,
ALTER COLUMN "apellido" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_ruc_key" ON "Cliente"("ruc");
