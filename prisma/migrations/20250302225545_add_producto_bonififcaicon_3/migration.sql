-- CreateTable
CREATE TABLE "Bonificacion" (
    "id" TEXT NOT NULL,
    "preventaId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bonificacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bonificacion" ADD CONSTRAINT "Bonificacion_preventaId_fkey" FOREIGN KEY ("preventaId") REFERENCES "Preventa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bonificacion" ADD CONSTRAINT "Bonificacion_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
