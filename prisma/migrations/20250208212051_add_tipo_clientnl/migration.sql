/*
  Warnings:

  - You are about to drop the `DetalleVenta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Venta` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DetalleVenta" DROP CONSTRAINT "DetalleVenta_productoId_fkey";

-- DropForeignKey
ALTER TABLE "DetalleVenta" DROP CONSTRAINT "DetalleVenta_ventaId_fkey";

-- DropForeignKey
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_usuarioId_fkey";

-- DropTable
DROP TABLE "DetalleVenta";

-- DropTable
DROP TABLE "Venta";

-- CreateTable
CREATE TABLE "DetallePreventa" (
    "id" TEXT NOT NULL,
    "preventaId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "unidadMedida" TEXT NOT NULL,
    "factorConversion" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "descuento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DetallePreventa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preventa" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "usuarioId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodoPago" TEXT NOT NULL DEFAULT 'efectivo',
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "tipoVenta" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "impuesto" DOUBLE PRECISION NOT NULL,
    "descuento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "notas" TEXT,

    CONSTRAINT "Preventa_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DetallePreventa" ADD CONSTRAINT "DetallePreventa_preventaId_fkey" FOREIGN KEY ("preventaId") REFERENCES "Preventa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetallePreventa" ADD CONSTRAINT "DetallePreventa_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preventa" ADD CONSTRAINT "Preventa_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preventa" ADD CONSTRAINT "Preventa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
