import React, { Suspense, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Selection,
  SortDescriptor,
} from "@heroui/react";
import {
  Delete,
  Edit,
  Eye,
  Search,
  ChevronDown,
  Plus,
  Pencil,
  CirclePlus,
  Filter,
  Trash2,
} from "lucide-react";
import { usarAlmacen } from "@/app/hooks/usarAlmacen";
import { Categoria, ProductoConCategoria } from "@/app/utils/types";
import { toast } from "sonner";
import ModalReutilizable, { usarModal } from "@/components/moda-reutilizable";
import ProductoDetalles from "./producto-detalles";
import dynamic from "next/dynamic";

interface TablaProductosProps {
  productos: ProductoConCategoria[];
  categoriasCompletas: Categoria[];
  onEditarProducto: (producto: ProductoConCategoria) => void;
  onAbrirDrawer: () => void;
  handleSearchChange: (value: string) => void;
  handleCategoriaChange: (categoriaId: string) => void;
  categoriaSeleccionada: string;
  searchValue?: string;
  eliminarProducto: (productoId: string) => Promise<void>;
}

const INITIAL_VISIBLE_COLUMNS = [
  "nombre",
  "categoria",
  "codigoBarras",
  "marca",
  "fechaVencimiento",
  "stockPrincipal",
  "unidadPrincipal",
  "acciones",
];
const ClientOnlyTable = dynamic(() => Promise.resolve(TablaProductosComponente), {
  ssr: false
});

export default function TablaProductos(props: any) {
  return (
    <Suspense fallback={<div>Cargando tabla...</div>}>
      <ClientOnlyTable {...props} />
    </Suspense>
  );
}

 function TablaProductosComponente({
  productos,
  categoriasCompletas,
  onEditarProducto,
  onAbrirDrawer,
  handleSearchChange,
  handleCategoriaChange,
  categoriaSeleccionada,
  eliminarProducto,
  searchValue = "",
}: TablaProductosProps) {
  const [filterValue, setFilterValue] = React.useState(searchValue);
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [page, setPage] = React.useState(1);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "nombre",
    direction: "ascending",
  });
  const [productoSeleccionado, setProductoSeleccionado] =
    React.useState<ProductoConCategoria | null>(null);
  const { almacenes, loading: loadingAlmacenes } = usarAlmacen();
  const [almacenFiltrado, setAlmacenFiltrado] = React.useState<string | null>(null);

  const { isOpen, onOpen, onClose } = usarModal();

  const handleOpenModal = (product: ProductoConCategoria) => {
    setProductoSeleccionado(product);
    onOpen();
  };

  const columns = [
    { name: "Nombre", uid: "nombre", sortable: true },
    { name: "Categoría", uid: "categoria", sortable: true },
    { name: "Stock Principal", uid: "stockPrincipal", sortable: true },
    { name: "Unidad Principal", uid: "unidadPrincipal", sortable: true },
    { name: "Código Barras", uid: "codigoBarras", sortable: true },
    { name: "Marca", uid: "marca", sortable: true },
    { name: "Cód. Interno", uid: "codigoInterno", sortable: true },
    { name: "Fecha Venc.", uid: "fechaVencimiento", sortable: true },
    { name: "Lote", uid: "lote", sortable: true },
    { name: "Proveedor", uid: "proveedor.nombre", sortable: true },
    { name: "Peso", uid: "peso", sortable: true },
    { name: "Ubicación", uid: "ubicacionAlmacen", sortable: true },
    { name: "Tiene IGV", uid: "tieneIGV", sortable: true },
    { name: "Acciones", uid: "acciones" },
  ];

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredProductos = [...productos];

    // Filtrado por nombre (búsqueda)
    if (hasSearchFilter) {
      filteredProductos = filteredProductos.filter((producto) =>
        producto.nombre.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    // Filtrado y cálculo de stock según almacén
    filteredProductos = filteredProductos.map((producto) => {
      const unidadPrincipal = producto.unidadesMedida.find(
        (um) => um.esUnidadPrincipal || um.factorConversion === 1 // Priorizar esUnidadPrincipal si está disponible
      );

      let stockPrincipal = 0;

      // Si no hay almacenes, asumimos stock 0
      if (!producto.almacenes || producto.almacenes.length === 0) {
        return { ...producto, stockPrincipal: 0, unidadPrincipal: unidadPrincipal?.unidadMedida?.descripcion || "N/A" };
      }

      if (almacenFiltrado) {
        // Filtrar solo el almacén seleccionado
        const almacenSeleccionado = producto.almacenes.find(
          (alm) => alm.almacenId === almacenFiltrado && alm.unidadMedidaId === unidadPrincipal?.unidadMedidaId
        );
        stockPrincipal = almacenSeleccionado ? almacenSeleccionado.stock || 0 : 0;
      } else {
        // Sumar el stock de todos los almacenes para la unidad principal
        stockPrincipal = producto.almacenes
          .filter((alm) => alm.unidadMedidaId === unidadPrincipal?.unidadMedidaId)
          .reduce((total, alm) => total + (alm.stock || 0), 0);
      }

      return {
        ...producto,
        stockPrincipal,
        unidadPrincipal: unidadPrincipal?.unidadMedida?.descripcion || "N/A",
      };
    });

    // Filtrar productos con stock > 0 cuando hay un almacén seleccionado
    if (almacenFiltrado) {
      filteredProductos = filteredProductos.filter(
        (producto) => (producto.stockPrincipal || 0) > 0
      );
    }

    return filteredProductos;
  }, [productos, filterValue, almacenFiltrado]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: ProductoConCategoria, b: ProductoConCategoria) => {
      const first = a[sortDescriptor.column as keyof ProductoConCategoria];
      const second = b[sortDescriptor.column as keyof ProductoConCategoria];

      if (first == null && second == null) return 0;
      if (first == null) return -1;
      if (second == null) return 1;

      if (first instanceof Date && second instanceof Date) {
        return sortDescriptor.direction === "descending"
          ? second.getTime() - first.getTime()
          : first.getTime() - second.getTime();
      }

      const firstString = String(first);
      const secondString = String(second);

      return sortDescriptor.direction === "descending"
        ? secondString.localeCompare(firstString)
        : firstString.localeCompare(secondString);
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback(
    (producto: ProductoConCategoria, columnKey: string) => {
      const getCellValue = (obj: any, path: string) => {
        if (!path.includes(".")) return obj[path];
        const parts = path.split(".");
        let value = obj;
        for (const part of parts) {
          if (value === null || value === undefined) return null;
          value = value[part];
        }
        return value;
      };

      const cellValue = getCellValue(producto, columnKey);

      switch (columnKey) {
        case "nombre":
          return <span className="text-black dark:text-white">{String(cellValue)}</span>;

        case "stockPrincipal":
          return (
            <div className="flex items-center justify-end">
              <span>{producto.stockPrincipal ?? 0}</span>
              {almacenFiltrado && (
                <Tooltip content={`Stock en ${almacenes.find((a: { id: string }) => a.id === almacenFiltrado)?.nombre}`}>
                  <span className="ml-1">📦</span>
                </Tooltip>
              )}
            </div>
          );

        case "unidadPrincipal":
          return <span className="text-black dark:text-white">{producto.unidadPrincipal ?? "N/A"}</span>;

        case "categoria":
          const categoriaEncontrada = categoriasCompletas.find(
            (cat) => cat.id === producto.categoriaId
          );
          return (
            <Chip color="primary" size="sm">
              {categoriaEncontrada?.nombre ?? "Sin categoría"}
            </Chip>
          );

        case "proveedor.nombre":
          return (
            <span className="text-black dark:text-white">
              {producto.proveedor?.nombre || "—"}
            </span>
          );

        case "tieneIGV":
          return (
            <span className="text-black dark:text-white">
              {cellValue ? "Sí" : "No"}
            </span>
          );

        case "fechaVencimiento":
          return (
            <span className="text-black dark:text-white">
              {cellValue ? new Date(cellValue).toLocaleDateString() : "—"}
            </span>
          );

        case "acciones":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="Detalles">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onClick={() => handleOpenModal(producto)}
                >
                  <Eye color="blue" size={16} />
                </Button>
              </Tooltip>
              <Tooltip content="Editar">
                <Button
                  isIconOnly
                  size="sm"
                  variant="solid"
                  onClick={() => onEditarProducto(producto)}
                >
                  <Edit color="green" size={16} />
                </Button>
              </Tooltip>
              <Tooltip color="danger" content="Eliminar">
                <Button
                  isIconOnly
                  size="sm"
                  variant="solid"
                  onClick={async () => {
                    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
                      try {
                        await eliminarProducto(producto.id);
                        toast.success("Producto eliminado correctamente");
                      } catch (error) {
                        toast.error("Error al eliminar el producto");
                      }
                    }
                  }}
                >
                  <Trash2 color="red" size={16} />
                </Button>
              </Tooltip>
            </div>
          );

        default:
          return (
            <span className="text-black dark:text-white">
              {cellValue !== null && cellValue !== undefined ? String(cellValue) : "—"}
            </span>
          );
      }
    },
    [categoriasCompletas, onEditarProducto, almacenFiltrado, almacenes]
  );

  const onSearchChange = (value: string) => {
    setFilterValue(value);
    handleSearchChange(value);
  };

  const onClear = React.useCallback(() => {
    setFilterValue("");
    handleSearchChange("");
    setPage(1);
  }, [handleSearchChange]);

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Buscar por nombre..."
            startContent={<Search />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger>
                <Button variant="flat">
                  {almacenFiltrado
                    ? almacenes.find((a: { id: string; }) => a.id === almacenFiltrado)?.nombre || "Filtrar por Almacén"
                    : "Todos los Almacenes"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                onAction={(key) => {
                  if (key === "todos") {
                    setAlmacenFiltrado(null);
                  } else {
                    setAlmacenFiltrado(String(key));
                  }
                }}
              >
                <DropdownItem className="text-black dark:text-white" key="todos">
                  Todos los Almacenes
                </DropdownItem>
                {almacenes.map((almacen: { id: string; nombre: string }) => (
                  <DropdownItem className="text-black dark:text-white" key={almacen.id}>
                    {almacen.nombre}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="shadow">
                  <Filter color="gray" size={24} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                className="light:bg-white dark:text-white light:text-black"
                disallowEmptySelection
                aria-label="Columnas visibles"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <div className="hidden sm:flex md:flex lg:flex xl:flex">
              <Button color="primary" onClick={onAbrirDrawer} endContent={<Plus />}>
                Agregar Nuevo
              </Button>
            </div>
            <div className="flex sm:hidden md:hidden lg:hidden xl:hidden items-center justify-center">
              <Button isIconOnly size="sm" onClick={onAbrirDrawer}>
                <CirclePlus size={24} color="gray" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {filteredItems.length} productos
          </span>
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
    );
  }, [filterValue, almacenFiltrado, almacenes, onSearchChange]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "Todos los items seleccionados"
            : `${selectedKeys.size} de ${filteredItems.length} seleccionados`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
      </div>
    );
  }, [selectedKeys, filteredItems.length, page, pages]);

  return (
    <>
      <div className="dark:bg-black light:bg-white">
        <Table
          isHeaderSticky
          classNames={{
            wrapper: "max-h-[382px]",
          }}
          aria-label="Tabla de productos"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          sortDescriptor={sortDescriptor}
          topContent={topContent}
          topContentPlacement="outside"
          onSelectionChange={setSelectedKeys}
          onSortChange={setSortDescriptor}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "acciones" ? "center" : "start"}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={"No se encontraron productos"} items={sortedItems}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, String(columnKey))}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ModalReutilizable title="Detalles del Producto" isOpen={isOpen} onClose={onClose}>
        {productoSeleccionado && (
          <ProductoDetalles
            productoSeleccionado={productoSeleccionado}
            onClose={onClose}
            categoriasCompletas={categoriasCompletas}
          />
        )}
      </ModalReutilizable>
    </>
  );
}