-- CreateTable
CREATE TABLE "Almacen" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "estadoRegion" TEXT NOT NULL,
    "codigoPostal" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tipoAlmacen" TEXT NOT NULL,
    "capacidadMaxima" INTEGER NOT NULL,
    "metodoValuacion" TEXT NOT NULL,
    "sucursalAsociada" TEXT,
    "notasInternas" TEXT,
    "horarioOperacion" TEXT,
    "usuarioConAcceso" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Almacen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Almacen_nombre_key" ON "Almacen"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Almacen_codigo_key" ON "Almacen"("codigo");
