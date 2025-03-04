-- CreateTable
CREATE TABLE "ImagenesCcategoria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "imagen" TEXT NOT NULL,

    CONSTRAINT "ImagenesCcategoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImagenesCcategoria_nombre_key" ON "ImagenesCcategoria"("nombre");
