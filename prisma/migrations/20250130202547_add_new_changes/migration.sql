/*
  Warnings:

  - The primary key for the `Almacen` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Almacen` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `almacenId` column on the `Producto` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_almacenId_fkey";

-- AlterTable
ALTER TABLE "Almacen" DROP CONSTRAINT "Almacen_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Almacen_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "almacenId",
ADD COLUMN     "almacenId" INTEGER;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE SET NULL ON UPDATE CASCADE;
