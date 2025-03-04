-- DropForeignKey
ALTER TABLE "UsuarioSucursal" DROP CONSTRAINT "UsuarioSucursal_sucursalId_fkey";

-- DropForeignKey
ALTER TABLE "UsuarioSucursal" DROP CONSTRAINT "UsuarioSucursal_usuarioId_fkey";

-- CreateTable
CREATE TABLE "UsuarioAlmacen" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,

    CONSTRAINT "UsuarioAlmacen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioAlmacen_usuarioId_almacenId_key" ON "UsuarioAlmacen"("usuarioId", "almacenId");

-- AddForeignKey
ALTER TABLE "UsuarioSucursal" ADD CONSTRAINT "UsuarioSucursal_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioSucursal" ADD CONSTRAINT "UsuarioSucursal_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioAlmacen" ADD CONSTRAINT "UsuarioAlmacen_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioAlmacen" ADD CONSTRAINT "UsuarioAlmacen_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
