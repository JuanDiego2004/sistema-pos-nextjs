// types.ts

import { Proveedor } from "@prisma/client";

// Tipo Cliente
export interface Cliente {
  id: string;
  nombre: string; // Nombre del cliente (para personas naturales)
  razonSocial?: string; // Razón social (para empresas)
  tipoCliente: string; // "persona" o "empresa"
  tipoDocumento: string; // "DNI" o "RUC"
  numeroDocumento: string; // Número de documento (DNI o RUC)
  digitoVerificador?: string; // Dígito verificador (opcional)
  email?: string; // Correo electrónico
  telefono?: string; // Teléfono
  direccion?: string; // Dirección
  direccionFiscal?: string; // Dirección fiscal
  estado: boolean; // Estado del cliente (activo/inactivo)
}

export interface ProductoAlmacenUnidadMedida {
  id: string;
  productoId: string;
  unidadMedidaId: string;
  almacenId: string;
  stock: number;
  precioCompra: number;
  precioVenta: number;
  almacen: { id: string; nombre: string; codigo?: string; direccion?: string };
  unidadMedida: { id: string; codigo: string; descripcion: string };
}

export interface Producto {
  cantidad: any;
  unidadSeleccionada: any;
  id: string;
  nombre: string;
  imagen: string;
  createdAt: Date;
  updatedAt: Date;
  categoriaId: string;
  categoria: Categoria; // Relación opcional con la categoría
  fechaVencimiento?: Date | null;
  tieneIGV: boolean;
  codigoBarras: string;
  proveedorId?: string | null;
  proveedor?: Proveedor | null; // Relación opcional con el proveedor
  lote?: string | null;
  estado: string;
  descripcion?: string | null;
  marca?: string | null;
  peso?: number | null;
  dimensiones?: string | null;
  impuestosAdicionales?: number | null;
  descuento?: number | null;
  fechaFabricacion?: Date | null;
  codigoInterno: string;
  ubicacionAlmacen?: string | null;
  costoAlmacenamiento?: number | null;
  notas?: string | null; // Agregado para coincidir con el modelo Prisma
  // Relaciones
  detallePreventas: DetallePreventa[]; // Detalles de preventas asociadas al producto
  unidadesMedida: ProductoUnidadMedida[]; // Unidades de medida del producto
}

// Tipo DetallePreventa
export interface DetallePreventa {
  productoId: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  tipoAfectacionIGV: string;
  descuento: number;
  id?: string;
  producto: { nombre: string };
}

// Tipo Preventa
export interface Preventa {
  id: string;
  serieDocumentoId: string;
  clienteId?: string | null;
  cliente: Cliente; // Relación opcional con Cliente
  usuarioId: string;
  usuario?: Usuario | null; // Relación opcional con Usuario
  fecha: Date;
  metodoPago: string;
  estado: string;
  tipoComprobante: string;
  subtotal: number;
  impuesto: number;
  descuento: number;
  total: number;
  notas?: string;
  detallePreventas: DetallePreventa[];
  bonificaciones: any[];
  xml?: string | null;
  moneda: string;
  baseImponible: number;
  valorVenta: number;
  igv: number;
  tipoOperacion: string;
  firmaDigital?: string | null;
  estadoSunat: string;
  serieDocumento?: {
    id: string;
    serie: string; // Número de serie (ej. "F001")
    tipoVenta: string; // Tipo de venta (ej. "01" para factura)
    ultimoCorrelativo: number;
  };
}

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  creado_en: Date;
  sucursales: Sucursal[];
  usuarioSucursales: {
    sucursal: {
      id: string;
      nombre: string;
    };
  }[]; // 👈 Convertido en un array
}

export interface UsuarioSucursal {
  id: string;
  usuarioId: string;
  sucursalId: string;
}

export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  pais: string;
  telefono: string;
  email: string;
  empresaId: string;
  [key: string]: any;
}

export interface Almacen {
  id: string;
  nombre: string;
  codigo: string;
  direccion: string;
  ciudad: string;
  estadoRegion: string;
  codigoPostal: string;
  pais: string;
  responsable: string;
  telefono: string;
  email: string;
  tipoAlmacen: string;
  capacidadMaxima: number;
  metodoValuacion: string;
  sucursalId: string;
  sucursal?: Sucursal; // Relación opcional con la sucursal
  // Relaciones
  productos: ProductoUnidadMedida[]; // Productos en este almacén
  preventas: Preventa[];

}

export interface InfoEmpresa {
  id: string;
  email: string;
  nombreComercial: string;
  direccionFiscal: string;
  ruc: string;
  distrito: string;
  provincia: string;
  departamento: string;
  ubigeo: string;
  representanteLegal: string;
  dniRepresentante: string;
  estado: string;
  condicion: string;
  paginaWeb: string;
  tipoContribuyente: string;
  razonSocial: string;
  telefono: string;
  logoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnidadMedida {
  id: string; // Incluimos id como en ProductoCard
  unidadMedidaId?: string;
  descripcion: string;
  codigo: string;
  unidadMedida: {
    id: string;
    codigo: string;
    descripcion: string;
  };
  factorConversion?: number;
  precioVentaBase?: number;
  precioCompraBase?: number; // Incluimos precioCompraBase como en ProductoCard
  esUnidadPrincipal?: boolean;
}

export interface ProductoExtendido {
  id: string;
  nombre: string;
  imagen: string;
  unidadesMedida?: UnidadMedida[];
  // Agrega otros campos de Producto según necesites
}

export interface ProductoSeleccionado extends ProductoExtendido {
  precioVenta?: number;
  unidadSeleccionada?: {
    unidadMedida: string;
    factorConversion: number;
    precioVenta: number;
  };
}


export interface UnidadMedidaSeleccionada {
  unidadId: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  utilidad: number;
  cantidadEquivalente: number;
}

export interface ProductoUnidadMedida {
  id: string;
  productoId: string;
  unidadMedidaId: string;
  factorConversion: number;
  descripcion: string;
  codigo: string;
  esUnidadPrincipal: boolean;
  precioCompraBase: number;
  precioVentaBase: number;
  unidadMedida: UnidadMedida;
  preciosPorAlmacen?: Array<{
    almacenId: string;
    stock?: number;
    precioCompra?: number;
    precioVenta?: number;
  }>;
}
export interface Categoria {
  id: string;
  nombre: string;
}

export interface ProductoConCategoria {
  id: string;
  nombre: string;
  imagen: string;
  codigoBarras: string;
  codigoInterno: string;
  categoriaId: string;
  categoria: Categoria;
  fechaVencimiento?: Date | null;
  tieneIGV: boolean;
  proveedorId?: string | null;
  proveedor?: Proveedor | null;
  lote?: string | null;
  marca?: string | null;
  peso?: number | null;
  dimensiones?: string | null;
  impuestosAdicionales?: number | null;
  descuento?: number | null;
  fechaFabricacion?: Date | null;
  estado: string;
  ubicacionAlmacen?: string | null;
  costoAlmacenamiento?: number | null;
  notas?: string | null;
  unidadesMedida: ProductoUnidadMedida[];
  almacenes: {
    id: string;
    almacenId: string;
    productoId: string;
    unidadMedidaId: string; // Necesario para relacionar con unidadesMedida
    stock: number;
    precioCompra?: number;  // Reflecta tu esquema Prisma
    precioVenta?: number;   // Reflecta tu esquema Prisma
    almacen: {
      id: string;
      nombre: string;
      codigo: string;
      direccion: string;
      ciudad: string;
    };
  }[];
  // Propiedades dinámicas para la tabla
  stockPrincipal?: number;
  unidadPrincipal?: string;
  stockSecundario?: number;
  unidadSecundaria?: string;
  // Campos adicionales que estaban en la primera declaración
  createdAt: Date;
  updatedAt: Date;
}

// export interface ProductoConCategoria {
//   id: string;
//   nombre: string;
//   categoria: { id: string; nombre: string } | null;
//   unidadesMedida: {
//     id: string;
//     stock: number;
//     precioCompra: number;
//     precioVenta: number;
//     unidadMedida: {
//       id: string;
//       codigo: string;
//       descripcion: string;
//     };
//   }[];
// }


export interface CrearAlmacen {
  nombre: string;
  codigo: string;
  direccion: string;
  ciudad: string;
  estadoRegion: string;
  codigoPostal: string;
  pais: string;
  responsable: string;
  telefono: string;
  email: string;
  tipoAlmacen: string;
  capacidadMaxima: number;
  metodoValuacion: string;
  sucursalId: string;
}

