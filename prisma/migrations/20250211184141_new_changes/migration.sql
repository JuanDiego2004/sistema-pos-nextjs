/*
  Warnings:

  - The primary key for the `Almacen` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `horarioOperacion` on the `Almacen` table. All the data in the column will be lost.
  - You are about to drop the column `notasInternas` on the `Almacen` table. All the data in the column will be lost.
  - You are about to drop the column `sucursalAsociada` on the `Almacen` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioConAcceso` on the `Almacen` table. All the data in the column will be lost.
  - Added the required column `sucursalId` to the `Almacen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `almacenId` to the `Preventa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sucursalId` to the `Preventa` table without a default value. This is not possible if the table is not empty.
  - Made the column `clienteId` on table `Preventa` required. This step will fail if there are existing NULL values in that column.
  - Made the column `almacenId` on table `Producto` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Preventa" DROP CONSTRAINT "Preventa_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_almacenId_fkey";

-- DropIndex
DROP INDEX "Almacen_codigo_key";

-- DropIndex
DROP INDEX "Almacen_nombre_key";

-- AlterTable
ALTER TABLE "Almacen" DROP CONSTRAINT "Almacen_pkey",
DROP COLUMN "horarioOperacion",
DROP COLUMN "notasInternas",
DROP COLUMN "sucursalAsociada",
DROP COLUMN "usuarioConAcceso",
ADD COLUMN     "sucursalId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Almacen_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Almacen_id_seq";

-- AlterTable
ALTER TABLE "Preventa" ADD COLUMN     "almacenId" TEXT NOT NULL,
ADD COLUMN     "sucursalId" TEXT NOT NULL,
ALTER COLUMN "clienteId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Producto" ALTER COLUMN "almacenId" SET NOT NULL,
ALTER COLUMN "almacenId" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "UsuarioSucursal" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,

    CONSTRAINT "UsuarioSucursal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoria" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingreso" (
    "id" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoria" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingreso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "id" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,
    "tipoReporte" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "contenido" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sucursal" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "codigoPostal" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sucursal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioSucursal_usuarioId_sucursalId_key" ON "UsuarioSucursal"("usuarioId", "sucursalId");

-- CreateIndex
CREATE UNIQUE INDEX "Sucursal_nombre_key" ON "Sucursal"("nombre");

-- AddForeignKey
ALTER TABLE "UsuarioSucursal" ADD CONSTRAINT "UsuarioSucursal_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioSucursal" ADD CONSTRAINT "UsuarioSucursal_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preventa" ADD CONSTRAINT "Preventa_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preventa" ADD CONSTRAINT "Preventa_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preventa" ADD CONSTRAINT "Preventa_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Almacen" ADD CONSTRAINT "Almacen_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingreso" ADD CONSTRAINT "Ingreso_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingreso" ADD CONSTRAINT "Ingreso_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sucursal" ADD CONSTRAINT "Sucursal_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "InfoEmpresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
