/*
  Warnings:

  - You are about to drop the column `apellido` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `ciudad` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `dni` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `fechaNacimiento` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `fechaRegistro` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `razonSocial` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `ruc` on the `Cliente` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[numeroDocumento]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `numeroDocumento` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoDocumento` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Made the column `nombre` on table `Cliente` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Cliente_dni_key";

-- DropIndex
DROP INDEX "Cliente_ruc_key";

-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "apellido",
DROP COLUMN "ciudad",
DROP COLUMN "dni",
DROP COLUMN "fechaNacimiento",
DROP COLUMN "fechaRegistro",
DROP COLUMN "razonSocial",
DROP COLUMN "ruc",
ADD COLUMN     "digitoVerificador" TEXT,
ADD COLUMN     "numeroDocumento" TEXT NOT NULL,
ADD COLUMN     "tipoDocumento" TEXT NOT NULL,
ALTER COLUMN "nombre" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_numeroDocumento_key" ON "Cliente"("numeroDocumento");
