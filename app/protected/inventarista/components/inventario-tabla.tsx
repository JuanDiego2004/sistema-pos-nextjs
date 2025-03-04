"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Selection,
  SortDescriptor,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "@heroui/react";
import { ProductoConCategoria } from "@/app/utils/types";
import { ChevronDownIcon, FlipVertical, SearchIcon } from "lucide-react";

interface InventarioTableProps {
  productos: ProductoConCategoria[];
  updateStock: (productoId: string, almacenRegistroId: string, newStock: number) => Promise<void>;
}

type Column = {
  name: string;
  uid: string;
  sortable?: boolean;
};

interface StockPorUnidad {
  unidadMedidaId: string;
  descripcion: string;
  almacenRegistroId: string;
  stock: number;
  factorConversion: number;
  esUnidadPrincipal: boolean;
}

const columns: Column[] = [
  { name: "Nombre", uid: "nombre", sortable: true },
  // { name: "Código de Barras", uid: "codigoBarras", sortable: true },
  { name: "Almacén", uid: "almacenNombre", sortable: true },
  { name: "Stock", uid: "stock", sortable: true },
  { name: "Precio Venta", uid: "precioVenta", sortable: true },
  { name: "Acciones", uid: "acciones" },
];

export default function InventarioTable({ productos, updateStock }: InventarioTableProps) {
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "nombre",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [filterValue, setFilterValue] = React.useState("");
  const [categoriaFilter, setCategoriaFilter] = React.useState<Selection>("all");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<ProductoConCategoria | null>(null);
  const [newStocks, setNewStocks] = React.useState<StockPorUnidad[]>([]);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [updateError, setUpdateError] = React.useState<string | null>(null);

  const categorias = React.useMemo(() => {
    const uniqueCategorias = Array.from(
      new Set(productos.map((p) => p.categoria?.nombre || "Sin categoría"))
    );
    return [
      { name: "Todas", uid: "all" },
      ...uniqueCategorias.map((cat) => ({ name: cat, uid: cat })),
    ];
  }, [productos]);

  const totalRows = React.useMemo(() => {
    return productos.reduce((acc, producto) => {
      const principalAlmacenes = producto.almacenes.filter((almacen) => {
        const unidadPrincipal = producto.unidadesMedida.find((um) => um.esUnidadPrincipal);
        return unidadPrincipal && almacen.unidadMedidaId === unidadPrincipal.unidadMedidaId;
      });
      return acc + principalAlmacenes.length;
    }, 0);
  }, [productos]);

  const pages = Math.ceil(totalRows / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    let filteredItems = productos.flatMap((producto) => {
      const unidadPrincipal = producto.unidadesMedida.find((um) => um.esUnidadPrincipal);
      if (!unidadPrincipal) return [];

      return producto.almacenes
        .filter((almacen) => almacen.unidadMedidaId === unidadPrincipal.unidadMedidaId)
        .map((almacen) => ({
          id: producto.id,
          nombre: producto.nombre,
          codigoBarras: producto.codigoBarras,
          categoria: producto.categoria?.nombre || "Sin categoría",
          almacenNombre: almacen.almacen.nombre,
          almacenId: almacen.almacenId,
          stock: almacen.stock,
          precioVenta: almacen.precioVenta || 0,
          unidadMedidaId: almacen.unidadMedidaId,
          almacenRegistroId: almacen.id,
        }));
    });

    if (filterValue) {
      filteredItems = filteredItems.filter(
        (item) =>
          item.nombre.toLowerCase().includes(filterValue.toLowerCase()) ||
          item.codigoBarras.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    if (categoriaFilter !== "all" && Array.from(categoriaFilter).length > 0) {
      filteredItems = filteredItems.filter((item) =>
        Array.from(categoriaFilter).includes(item.categoria)
      );
    }

    return filteredItems.slice(start, end);
  }, [page, productos, filterValue, categoriaFilter, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof typeof a];
      const second = b[sortDescriptor.column as keyof typeof b];
      const cmp =
        typeof first === "string" && typeof second === "string"
          ? first.localeCompare(second)
          : (first as number) < (second as number)
          ? -1
          : (first as number) > (second as number)
          ? 1
          : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback(
    (item: typeof items[0], columnKey: React.Key) => {
      const cellValue = item[columnKey as keyof typeof item];
  
      switch (columnKey) {
        case "stock":
          return (
            <span
              className={
                (cellValue as number) <= 0
                  ? "text-red-500"
                  : (cellValue as number) <= 10
                  ? "text-yellow-500"
                  : "text-green-500"
              }
            >
              {cellValue}
            </span>
          );
        case "precioVenta":
          return `S/ ${(cellValue as number).toFixed(2)}`;
        case "acciones":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <FlipVertical className="text-default-400" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key="update"
                    onClick={() => {
                      const productoCompleto = productos.find((p) => p.id === item.id);
                      if (productoCompleto) {
                        // Unidad principal
                        const unidadPrincipal = productoCompleto.unidadesMedida.find(
                          (um) => um.esUnidadPrincipal
                        );
                        const stockPrincipal = productoCompleto.almacenes.find(
                          (a) => a.unidadMedidaId === unidadPrincipal?.unidadMedidaId
                        );
  
                        // Unidad secundaria
                        const unidadSecundaria = productoCompleto.unidadesMedida.find(
                          (um) => !um.esUnidadPrincipal
                        );
                        const stockSecundario = productoCompleto.almacenes.find(
                          (a) => a.unidadMedidaId === unidadSecundaria?.unidadMedidaId
                        );
  
                        // Imprimir en consola
                        console.log({
                          producto: {
                            id: productoCompleto.id,
                            nombre: productoCompleto.nombre,
                          },
                          unidadPrincipal: {
                            descripcion: unidadPrincipal?.unidadMedida.descripcion,
                            stock: stockPrincipal?.stock,
                            almacenRegistroId: stockPrincipal?.id,
                          },
                          unidadSecundaria: {
                            descripcion: unidadSecundaria?.unidadMedida.descripcion,
                            stock: stockSecundario?.stock,
                            almacenRegistroId: stockSecundario?.id,
                            factorConversion: unidadSecundaria?.factorConversion,
                          },
                        });
  
                        // Abrir modal con datos actuales
                        setSelectedProduct(productoCompleto);
                        setNewStocks([{
                          ...item, stock: item.stock,
                          descripcion: "",
                          factorConversion: 0,
                          esUnidadPrincipal: false
                        }]); // Mantienes el stock inicial del item seleccionado
                        setIsModalOpen(true);
                        setUpdateError(null);
                      }
                    }}
                  >
                    Actualizar Stock
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [productos]
  );
  const onSearchChange = React.useCallback((value?: string) => {
    setFilterValue(value || "");
    setPage(1);
  }, []);

  const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const handleStockChange = (unidadMedidaId: string, value: string) => {
    setNewStocks((prev) =>
      prev.map((stock) =>
        stock.unidadMedidaId === unidadMedidaId ? { ...stock, stock: Number(value) } : stock
      )
    );
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      for (const stock of newStocks) {
        await updateStock(selectedProduct.id, stock.almacenRegistroId, stock.stock);
      }
      setIsModalOpen(false);
    } catch (error) {
      setUpdateError(
        "Error al actualizar el stock: " + (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const topContent = React.useMemo(() => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          classNames={{ base: "w-full sm:max-w-[44%]", inputWrapper: "border-1" }}
          placeholder="Buscar por nombre o código..."
          size="sm"
          startContent={<SearchIcon className="text-default-300" />}
          value={filterValue}
          variant="bordered"
          onClear={() => setFilterValue("")}
          onValueChange={onSearchChange}
        />
        <div className="flex gap-3">
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button endContent={<ChevronDownIcon className="text-small" />} size="sm" variant="flat">
                Categoría
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Filtro por categoría"
              closeOnSelect={false}
              selectedKeys={categoriaFilter}
              selectionMode="multiple"
              onSelectionChange={setCategoriaFilter}
            >
              {categorias.map((cat) => (
                <DropdownItem key={cat.uid} className="capitalize">
                  {cat.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-default-400 text-small">Total {totalRows} registros</span>
        <label className="flex items-center text-default-400 text-small">
          Filas por página:
          <select
            className="bg-transparent outline-none text-default-400 text-small"
            onChange={onRowsPerPageChange}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </label>
      </div>
    </div>
  ), [filterValue, categoriaFilter, totalRows, onSearchChange, onRowsPerPageChange]);

  const bottomContent = React.useMemo(() => (
    <div className="py-2 px-2 flex justify-between items-center">
      <Pagination
        showControls
        classNames={{ cursor: "bg-foreground text-background" }}
        color="default"
        page={page}
        total={pages}
        variant="light"
        onChange={setPage}
      />
      <span className="text-small text-default-400">
        {selectedKeys === "all"
          ? "Todos los items seleccionados"
          : `${selectedKeys.size} de ${totalRows} seleccionados`}
      </span>
    </div>
  ), [selectedKeys, totalRows, page, pages]);

  return (
    <>
      <Table
        isCompact
        aria-label="Tabla de inventario con productos por almacén"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        topContent={topContent}
        topContentPlacement="outside"
        sortDescriptor={sortDescriptor}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
        classNames={{
          wrapper: ["max-h-[500px]"],
          th: ["bg-transparent", "text-default-500", "border-b", "border-divider"],
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "acciones" || column.uid === "stock" || column.uid === "precioVenta" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No se encontraron productos"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.almacenRegistroId}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Actualizar Stock - {selectedProduct?.nombre}</ModalHeader>
          <ModalBody>
            {newStocks.map((stock) => (
              <div key={stock.unidadMedidaId} className="mb-4">
                <Input
                  label={`Stock (${stock.descripcion}${stock.esUnidadPrincipal ? " - Principal" : ""})`}
                  type="number"
                  value={stock.stock.toString()}
                  onChange={(e) => handleStockChange(stock.unidadMedidaId, e.target.value)}
                  min={0}
                  isInvalid={stock.stock < 0}
                  errorMessage={stock.stock < 0 ? "El stock no puede ser negativo" : ""}
                  disabled={isUpdating}
                />
              </div>
            ))}
            {updateError && <p className="text-red-500 text-sm">{updateError}</p>}
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setIsModalOpen(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={handleUpdateStock}
              disabled={isUpdating || newStocks.some((s) => s.stock < 0)}
              startContent={isUpdating ? <Spinner size="sm" color="white" /> : null}
            >
              {isUpdating ? "Guardando..." : "Guardar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}