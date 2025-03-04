/*
  Warnings:

  - You are about to drop the column `unidadesMedida` on the `Producto` table. All the data in the column will be lost.
  - Added the required column `serieDocumentoId` to the `Preventa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unidadMedidaId` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Preventa" ADD COLUMN     "moneda" TEXT NOT NULL DEFAULT 'PEN',
ADD COLUMN     "serieDocumentoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "unidadesMedida",
ADD COLUMN     "unidadMedidaId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UnidadMedida" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "UnidadMedida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SerieDocumento" (
    "id" TEXT NOT NULL,
    "tipoVenta" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "ultimoCorrelativo" INTEGER NOT NULL,

    CONSTRAINT "SerieDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoEmpresa" (
    "id" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "nombreComercial" TEXT,
    "direccionFiscal" TEXT NOT NULL,
    "distrito" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "ubigeo" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "paginaWeb" TEXT,
    "representanteLegal" TEXT,
    "dniRepresentante" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "condicion" TEXT NOT NULL DEFAULT 'HABIDO',
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfoEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnidadMedida_codigo_key" ON "UnidadMedida"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "InfoEmpresa_ruc_key" ON "InfoEmpresa"("ruc");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_unidadMedidaId_fkey" FOREIGN KEY ("unidadMedidaId") REFERENCES "UnidadMedida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preventa" ADD CONSTRAINT "Preventa_serieDocumentoId_fkey" FOREIGN KEY ("serieDocumentoId") REFERENCES "SerieDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
