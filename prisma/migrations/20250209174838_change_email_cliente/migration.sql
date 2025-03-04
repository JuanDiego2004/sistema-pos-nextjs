/*
  Warnings:

  - You are about to alter the column `email` on the `Cliente` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- DropIndex
DROP INDEX "Cliente_email_key";

-- AlterTable
ALTER TABLE "Cliente" ALTER COLUMN "email" SET DATA TYPE VARCHAR(255);
