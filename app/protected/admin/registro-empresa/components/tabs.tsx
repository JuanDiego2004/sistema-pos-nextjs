// app/tabs/page.tsx
"use client";

import { Card, CardBody } from "@heroui/react";
import { Tab, Tabs } from "@heroui/tabs";
import {
  Building,
  CigaretteOff,
  GalleryHorizontal,
  MoveIcon,
  Music,
  PersonStanding,
  Truck,
  UserRound,
} from "lucide-react";
import EmpresaInformacion from "./empresa-informacion/empresa-informacion";
import RegistroUsuario from "./registrar-personal/register-personal";
import Proveedores from "./empresa-informacion/proveedores/proveedores";
import TablaCategoria from "./empresa-informacion/categoria/components/tabla-categoria";

export default function TabsRegistroEmpresa() {
  return (
    <div className="flex w-full flex-col  mt-5 bg-white">
      <Tabs color="primary" aria-label="Options" variant="bordered">
        <Tab
          key="informacion"
          title={
            <div className="flex items-center space-x-2">
              <Building />
              <span>Informacion Empresa</span>
            </div>
          }
        >
          <Card>
            <CardBody>
              <EmpresaInformacion />
            </CardBody>
          </Card>
        </Tab>
        <Tab
          key="music"
          title={
            <div className="flex items-center space-x-2">
              <UserRound />
              <span>Registrar Empleados</span>
            </div>
          }
        >
          <Card>
            <CardBody>
              <RegistroUsuario />
            </CardBody>
          </Card>
        </Tab>
        <Tab
          key="proveedores"
          title={
            <div className="flex items-center space-x-2">
              <Truck  />
              <span>Proveedores</span>
            </div>
          }
        >
          <Card>
            <CardBody>
               <Proveedores />
            </CardBody>
          </Card>
        </Tab>
        <Tab
          key="categorias"
          title={
            <div className="flex items-center space-x-2">
              <CigaretteOff  />
              <span>Categorias</span>
            </div>
          }
        >
          <Card>
            <CardBody>
               <TablaCategoria />
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
