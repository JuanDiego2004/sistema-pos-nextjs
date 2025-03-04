/*
  Warnings:

  - You are about to drop the column `precioCompra` on the `ProductoUnidadMedida` table. All the data in the column will be lost.
  - You are about to drop the column `precioVenta` on the `ProductoUnidadMedida` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `ProductoUnidadMedida` table. All the data in the column will be lost.
  - You are about to drop the `ProductoAlmacen` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductoAlmacen" DROP CONSTRAINT "ProductoAlmacen_almacenId_fkey";

-- DropForeignKey
ALTER TABLE "ProductoAlmacen" DROP CONSTRAINT "ProductoAlmacen_productoId_fkey";

-- AlterTable
ALTER TABLE "ProductoAlmacenUnidadMedida" ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProductoUnidadMedida" DROP COLUMN "precioCompra",
DROP COLUMN "precioVenta",
DROP COLUMN "stock",
ADD COLUMN     "esUnidadPrincipal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "precioCompraBase" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "precioVentaBase" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "ProductoAlmacen";
