"use client";


import { bitter } from "@/app/utils/fonts";
import { Edit, Menu, PersonStanding } from "lucide-react";
import { useEffect, useState } from "react";

import TablaSucursal from "./tabla/tabla-sucursales";
import ModalEmpresaInfo from "./components/modal-info";
import EmpresaInfoContainer from "./components/info-empresa";
import AlmacenesTable from "./almacenes/almacen";
import { usarSucursal } from "@/app/hooks/usarSucursal";
import { usarAlmacen } from "@/app/hooks/usarAlmacen";
import { usarEmpresaInfo } from "@/app/hooks/usarEmpresa";



export default function EmpresaInformacion() {
  const [error, setError] =useState("")
  const [loading, setLoading] = useState(false);
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [isOpenModalInfoEmpresa, setIsOpenModalInfoEmpresa] = useState(false);
  const { sucursales, fetchSucursales, empresaId } = usarSucursal();
  const { almacenes, editarAlmacen, eliminarAlmacen } = usarAlmacen();
  const { empresaInfo, loading: loadingEmpresa, error: errorEmpresa, cargarEmpresa } = usarEmpresaInfo();


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
        loading={loadingEmpresa}
        error={errorEmpresa}
        cargarEmpresa={cargarEmpresa}
     />

      <div className="flex  justify-between">
        <div className="w-full">
          <div className="flex justify-between items-center ">

            <div className="lg:w-2/6 md:w-2/3 hidden sm:flex justify-between items-center">

            </div>

          </div>


        </div>

        
      </div>

      <div>
        <TablaSucursal 
        sucursales={sucursales}
        fetchSucursales={fetchSucursales}
        empresaId={empresaId || ""}
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
