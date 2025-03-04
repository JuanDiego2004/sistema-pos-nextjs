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
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Selection,
  ChipProps,
  useDisclosure,
} from "@heroui/react";
import { ArrowDown, Dot, MoreVertical, PlusIcon, Search } from "lucide-react";
import { Preventa } from "../../../../../utils/types";
import DetallesVentaModalFactura from "./modeloFacturas/modelo-factura";
import { usarPreventas } from "@/app/hooks/usarPreventas";
import { usarEmpresaInfo } from "@/app/hooks/usarEmpresa";
import { generarXML } from "../../nueva-venta/lib/generar-xml";
import EditarVentaModal from "./editar-ventas/modal-editar-ventas";

// Definir las columnas de la tabla
const columns = [
  { name: "USUARIO", uid: "usuario", sortable: true },
  { name: "CLIENTE", uid: "cliente", sortable: true },
  { name: "FECHA", uid: "fecha", sortable: true },
  { name: "ESTADO", uid: "estado", sortable: true },
  { name: "MÉTODO PAGO", uid: "metodoPago" },
  { name: "TOTAL", uid: "total", sortable: true },
  { name: "ACCIONES", uid: "actions" },
];

// Colores para los estados
const statusColorMap: Record<string, ChipProps["color"]> = {
  pendiente: "warning",
  pagado: "success",
  cancelado: "danger",
};

const INITIAL_VISIBLE_COLUMNS = ["usuario", "cliente", "fecha", "estado", "total", "actions"];

export default function PreventasTable() {
  // Estados para la tabla
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(8);
  const [page, setPage] = React.useState(1);

  const [selectedPreventa, setSelectedPreventa] = React.useState<Preventa | null>(null);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = React.useState(false);

  const { empresaInfo, loading: empresaLoading, error: empresaError } = usarEmpresaInfo();

  const {
    isOpen: isOpenEditarModal,
    onOpen: onOpenModalEditar,
    onOpenChange: onOpenChangeEditarModal,
  } = useDisclosure();
  const [selectedPreventaEditar, setSelectedPreventaEditar] = React.useState<Preventa | null>(null);

  const {
    preventas: preventasAPI,
    estados,
    totalPaginas,
    pagina,
    setPagina,
    busqueda,
    setBusqueda,
    estado,
    setEstado,
    cargando,
    error,
    rowsPerPage: rowsPerPageFromHook,
    setRowsPerPage: setRowsPerPageFromHook,
  } = usarPreventas();

  // Usar rowsPerPage del hook para mantener consistencia
  React.useEffect(() => {
    setRowsPerPageFromHook(rowsPerPage);
  }, [rowsPerPage, setRowsPerPageFromHook]);

  // Sincronizar la página del componente con el hook
  React.useEffect(() => {
    setPagina(page);
  }, [page, setPagina]);

  // Sincronizar los filtros del componente con el hook
  React.useEffect(() => {
    setBusqueda(filterValue);
    setEstado(statusFilter === "all" ? null : Array.from(statusFilter).join(","));
  }, [filterValue, statusFilter, setBusqueda, setEstado]);

  const handleEditarVenta = (preventa: Preventa) => {
    setSelectedPreventaEditar(preventa);
    onOpenModalEditar();
  };

  const handleSaveEdit = (updatedPreventa: Preventa) => {
    console.log("Saving updated preventa:", updatedPreventa);
  };

  const handleViewDetails = (preventa: Preventa) => {
    setSelectedPreventa(preventa);
    setIsDetalleModalOpen(true);
  };

  // Usar directamente las preventas paginadas del hook
  const items = preventasAPI;

  // Total de páginas viene del hook
  const pages = totalPaginas;

  // Renderizado de celdas
  const renderCell = React.useCallback(
    (preventa: Preventa, columnKey: React.Key): React.ReactNode => {
      switch (columnKey) {
        case "usuario":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">
                {preventa.usuario?.nombre || "Sin usuario"}
              </p>
            </div>
          );
        case "cliente":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">
                {preventa.cliente?.nombre || "Sin cliente"}
              </p>
            </div>
          );
        case "fecha":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small">
                {new Date(preventa.fecha).toLocaleDateString()}
              </p>
            </div>
          );
        case "estado":
          return (
            <Chip
              className="capitalize border-none gap-1 text-default-600"
              color={statusColorMap[preventa.estado]}
              size="sm"
              variant="dot"
            >
              {preventa.estado}
            </Chip>
          );
        case "metodoPago":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">
                {preventa.metodoPago}
              </p>
            </div>
          );
        case "total":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small">
                $
                {preventa.total.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          );
        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown className="bg-background border-1 border-default-200">
                <DropdownTrigger>
                  <Button isIconOnly radius="full" size="sm" variant="light">
                    <MoreVertical size={16} className="text-default-400" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key={`generarxml-${preventa.id}`}
                    onPress={() => generarXML(preventa, empresaInfo)}
                  >
                    Generar Xml
                  </DropdownItem>
                  <DropdownItem
                    key={`editarventa-${preventa.id}`}
                    onPress={() => handleEditarVenta(preventa)}
                  >
                    Editar Venta
                  </DropdownItem>
                  <DropdownItem
                    key={`verdetallesventa-${preventa.id}`}
                    onPress={() => handleViewDetails(preventa)}
                  >
                    Ver detalles venta
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          const value = preventa[columnKey as keyof typeof preventa];
          if (typeof value === "object") {
            return JSON.stringify(value);
          }
          return value?.toString() || "";
      }
    },
    []
  );

  // Contenido superior de la tabla
  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            classNames={{
              base: "w-full sm:max-w-[44%]",
              inputWrapper: "border-1",
            }}
            placeholder="Buscar por cliente o usuario..."
            size="sm"
            startContent={<Search className="text-default-300" />}
            value={filterValue}
            variant="bordered"
            onClear={() => setFilterValue("")}
            onValueChange={(value) => setFilterValue(value)}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ArrowDown className="text-small" />}
                  size="sm"
                  variant="flat"
                >
                  Estado
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Filtro de estados"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {estados.map((estado: any) => (
                  <DropdownItem key={estado} className="capitalize">
                    {estado}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              className="bg-foreground text-background"
              endContent={<PlusIcon />}
              size="sm"
            >
              Nueva Preventa
            </Button>
          </div>
        </div>
      </div>
    );
  }, [filterValue, estados, statusFilter]);

  // Contenido inferior de la tabla
  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="text-small text-default-400">
          Total {preventasAPI.length} preventas
        </span>
        <Pagination
          showControls
          classNames={{
            cursor: "bg-foreground text-background",
          }}
          color="default"
          page={page}
          total={pages}
          variant="light"
          onChange={(newPage) => setPage(newPage)}
        />
      </div>
    );
  }, [page, pages, preventasAPI.length]);

  if (cargando) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="w-full overflow-hidden p-4">
        <Table
          isCompact
          aria-label="Tabla de Preventas"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          classNames={{
            wrapper: "max-h-[382px]",
            base: "w-full",
            table: "w-full",
          }}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          topContent={topContent}
          topContentPlacement="outside"
          onSelectionChange={setSelectedKeys}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody<Preventa> emptyContent={"No se encontraron preventas"} items={items}>
            {(preventa) => (
              <TableRow key={preventa.id}>
                {(columnKey) => <TableCell>{renderCell(preventa, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <EditarVentaModal
          isOpen={isOpenEditarModal}
          onOpenChange={onOpenChangeEditarModal}
          preventa={selectedPreventaEditar}
          onSave={handleSaveEdit}
        />
        {isDetalleModalOpen && selectedPreventa && (
          <DetallesVentaModalFactura
            isOpen={isDetalleModalOpen}
            onClose={() => setIsDetalleModalOpen(false)}
            preventa={selectedPreventa}
            empresaInfo={empresaInfo}
          />
        )}
      </div>
    </>
  );
}