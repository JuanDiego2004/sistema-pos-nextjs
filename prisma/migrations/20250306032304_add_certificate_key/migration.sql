-- AlterTable
ALTER TABLE "InfoEmpresa" ADD COLUMN     "certificadoDigital" BYTEA,
ADD COLUMN     "certificadoPassword" TEXT,
ADD COLUMN     "clavePrivada" BYTEA;
