import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const unidadesMedida = [
  { codigo: "BJ", descripcion: "BALDE" },
  { codigo: "BLL", descripcion: "BARRILES" },
  { codigo: "4A", descripcion: "BOBINAS" },
  { codigo: "BG", descripcion: "BOLSA" },
  { codigo: "BO", descripcion: "BOTELLAS" },
  { codigo: "BX", descripcion: "CAJAS" },
  { codigo: "CT", descripcion: "CARTONES" },
  { codigo: "CMK", descripcion: "CENTIMETRO CUADRADO" },
  { codigo: "CMQ", descripcion: "CENTIMETRO CUBICO" },
  { codigo: "CMT", descripcion: "CENTIMETRO LINEAL" },
  { codigo: "CEN", descripcion: "CIENTO DE UNIDADES" },
  { codigo: "CY", descripcion: "CILINDRO" },
  { codigo: "CJ", descripcion: "CONOS" },
  { codigo: "DZN", descripcion: "DOCENA" },
  { codigo: "DZP", descripcion: "DOCENA POR 10**6" },
  { codigo: "BE", descripcion: "FARDO" },
  { codigo: "GLI", descripcion: "GALON INGLES (4,545956L)" },
  { codigo: "GRM", descripcion: "GRAMO" },
  { codigo: "GRO", descripcion: "GRUESA" },
  { codigo: "HLT", descripcion: "HELECTROLITO" },
  { codigo: "LEF", descripcion: "HOJA" },
  { codigo: "SET", descripcion: "JUEGO" },
  { codigo: "KGM", descripcion: "KILOGRAMO" },
  { codigo: "KTM", descripcion: "KILOMETRO" },
  { codigo: "KWH", descripcion: "KILOVATIO HORA" },
  { codigo: "KT", descripcion: "KIT" },
  { codigo: "CA", descripcion: "LATAS" },
  { codigo: "LBR", descripcion: "LIBRAS" },
  { codigo: "LTR", descripcion: "LITROS" },
  { codigo: "MWH", descripcion: "MEGAWHAT HORA" },
  { codigo: "MTR", descripcion: "METRO" },
  { codigo: "MTK", descripcion: "METRO CUADRADO" },
  { codigo: "MTQ", descripcion: "METRO CUBICO" },
  { codigo: "MGM", descripcion: "MILIGRAMOS" },
  { codigo: "MLT", descripcion: "MILILITRO" },
  { codigo: "MMT", descripcion: "MILIMETRO" },
  { codigo: "MMK", descripcion: "MILIMETRO CUADRADO" },
  { codigo: "MMQ", descripcion: "MILIMETRO CUBICO" },
  { codigo: "MLL", descripcion: "MILLARES" },
  { codigo: "MU", descripcion: "MILLON DE UNIDADES" },
  { codigo: "ONZ", descripcion: "ONZAS" },
  { codigo: "PF", descripcion: "PALETAS" },
  { codigo: "PK", descripcion: "PAQUETE" },
  { codigo: "PR", descripcion: "PAR" },
  { codigo: "FOT", descripcion: "PIES" },
  { codigo: "FTK", descripcion: "PIES CUADRADOS" },
  { codigo: "FTQ", descripcion: "PIES CUBICOS" },
  { codigo: "C62", descripcion: "PIEZAS" },
  { codigo: "PG", descripcion: "PLACAS" },
  { codigo: "ST", descripcion: "PLIEGO" },
  { codigo: "INH", descripcion: "PULGADAS" },
  { codigo: "RM", descripcion: "RESMA" },
  { codigo: "DR", descripcion: "TAMBOR" },
  { codigo: "STN", descripcion: "TONELADA CORTA" },
  { codigo: "LTN", descripcion: "TONELADA LARGA" },
  { codigo: "TNE", descripcion: "TONELADAS" },
  { codigo: "TU", descripcion: "TUBOS" },
  { codigo: "NIU", descripcion: "UNIDAD (BIENES)" },
  { codigo: "ZZ", descripcion: "UNIDAD (SERVICIOS)" },
  { codigo: "GLL", descripcion: "US GALON (3,7843 L)" },
  { codigo: "YRD", descripcion: "YARDA" },
  { codigo: "YDK", descripcion: "YARDA CUADRADA" },
];

async function main() {
  console.log("Cargando datos de unidades de medida...");
  for (const unidad of unidadesMedida) {
    await prisma.unidadMedida.upsert({
      where: { codigo: unidad.codigo },
      update: {},
      create: unidad,
    });
  }
  console.log("Datos cargados exitosamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
