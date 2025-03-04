/*
  Warnings:

  - Added the required column `tipoContribuyente` to the `InfoEmpresa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InfoEmpresa" ADD COLUMN     "tipoContribuyente" TEXT NOT NULL;
