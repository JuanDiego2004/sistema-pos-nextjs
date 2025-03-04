/*
  Warnings:

  - You are about to drop the `ImagenesCcategoria` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Categoria" ADD COLUMN     "imagen" TEXT;

-- DropTable
DROP TABLE "ImagenesCcategoria";
