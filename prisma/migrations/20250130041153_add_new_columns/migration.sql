/*
  Warnings:

  - The primary key for the `Almacen` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `usuario` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[codigoBarras]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigoInterno]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.
*/

-- AlterTable
ALTER TABLE "Almacen" DROP CONSTRAINT "Almacen_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Almacen_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Almacen_id_seq";

-- AlterTable
ALTER TABLE "Producto" 
    ADD COLUMN     "almacenId" TEXT,
    ADD COLUMN     "codigoBarras" TEXT, -- Agregar como NULLABLE inicialmente
    ADD COLUMN     "codigoInterno" TEXT, -- Agregar como NULLABLE inicialmente
    ADD COLUMN     "costoAlmacenamiento" DOUBLE PRECISION,
    ADD COLUMN     "descripcion" TEXT,
    ADD COLUMN     "descuento" DOUBLE PRECISION DEFAULT 0,
    ADD COLUMN     "dimensiones" TEXT,
    ADD COLUMN     "estado" TEXT NOT NULL DEFAULT 'activo',
    ADD COLUMN     "fechaFabricacion" TIMESTAMP(3),
    ADD COLUMN     "fechaVencimiento" TIMESTAMP(3),
    ADD COLUMN     "impuestosAdicionales" DOUBLE PRECISION DEFAULT 0,
    ADD COLUMN     "lote" TEXT,
    ADD COLUMN     "marca" TEXT,
    ADD COLUMN     "notas" TEXT,
    ADD COLUMN     "peso" DOUBLE PRECISION,
    ADD COLUMN     "proveedorId" TEXT,
    ADD COLUMN     "stockMaximo" INTEGER,
    ADD COLUMN     "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN     "tieneIGV" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN     "ubicacionAlmacen" TEXT,
    ADD COLUMN     "unidadMedida" TEXT; -- Agregar como NULLABLE inicialmente

-- Asignar valores a las filas existentes
UPDATE "Producto" SET
    "codigoBarras" = gen_random_uuid(), -- Generar un UUID único para codigoBarras
    "codigoInterno" = gen_random_uuid(), -- Generar un UUID único para codigoInterno
    "unidadMedida" = 'unidad'; -- Asignar un valor predeterminado para unidadMedida

-- Cambiar las columnas a NOT NULL
ALTER TABLE "Producto" 
    ALTER COLUMN "codigoBarras" SET NOT NULL,
    ALTER COLUMN "codigoInterno" SET NOT NULL,
    ALTER COLUMN "unidadMedida" SET NOT NULL;

-- DropTable
DROP TABLE "usuario";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigoBarras_key" ON "Producto"("codigoBarras");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigoInterno_key" ON "Producto"("codigoInterno");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;