// EmpresaInformacion.tsx
"use client";

import { bitter } from "@/app/utils/fonts";
import { Edit, Menu, PersonStanding } from "lucide-react";
import { useState } from "react";
import TablaSucursal from "./tabla/tabla-sucursales";
import ModalEmpresaInfo from "./components/modal-info";
import EmpresaInfoContainer from "./components/info-empresa";
import AlmacenesTable from "./almacenes/almacen";
import { usarEmpresaData } from "./hook/usarEmpresa";




export default function EmpresaInformacion() {
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [isOpenModalInfoEmpresa, setIsOpenModalInfoEmpresa] = useState(false);
  
  const {
    empresaInfo,
    sucursales,
    almacenes,
    loading,
    error,
    fetchAllData,
    refreshAll,
    editarAlmacen,
    eliminarAlmacen,
    empresaId,
  } = usarEmpresaData();

  if (loading) return <p>Cargando datos de la empresa...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="">
      {/* Overlay */}
      {isOverlayVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-bold">
              {loading ? "Actualizando..." : "Completado"}
            </p>
            {loading && <p>Por favor, espere...</p>}
          </div>
        </div>
      )}

      <ModalEmpresaInfo
        isOpen={isOpenModalInfoEmpresa}
        onClose={() => setIsOpenModalInfoEmpresa(false)}
      />

      <EmpresaInfoContainer
        InfoEmpresa={empresaInfo}
        loading={loading}
        error={error}
        cargarEmpresa={fetchAllData}
      />

      <div className="flex justify-between">
        <div className="w-full">
          <div className="flex justify-between items-center">
            <div className="lg:w-2/6 md:w-2/3 hidden sm:flex justify-between items-center"></div>
          </div>
        </div>
      </div>

      <div>
        <TablaSucursal
          sucursales={sucursales}
          fetchSucursales={fetchAllData}
          empresaId={empresaId}
        />
      </div>

      <div>
        <AlmacenesTable
          almacenes={almacenes}
          editarAlmacen={editarAlmacen}
          eliminarAlmacen={eliminarAlmacen}
        />
      </div>
    </div>
  );
}