/*
  Warnings:

  - A unique constraint covering the columns `[ruc]` on the table `Proveedor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Proveedor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proveedor" ADD COLUMN     "ciudad" TEXT,
ADD COLUMN     "contacto" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "estado" TEXT,
ADD COLUMN     "estadoProveedor" TEXT NOT NULL DEFAULT 'activo',
ADD COLUMN     "notas" TEXT,
ADD COLUMN     "pais" TEXT DEFAULT 'Perú',
ADD COLUMN     "ruc" TEXT,
ADD COLUMN     "telefono" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "web" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_ruc_key" ON "Proveedor"("ruc");
