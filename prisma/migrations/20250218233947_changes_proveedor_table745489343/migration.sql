-- DropForeignKey
ALTER TABLE "ProductoUnidadMedida" DROP CONSTRAINT "ProductoUnidadMedida_productoId_fkey";

-- AddForeignKey
ALTER TABLE "ProductoUnidadMedida" ADD CONSTRAINT "ProductoUnidadMedida_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
