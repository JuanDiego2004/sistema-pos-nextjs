

import { usePathname } from "next/navigation";

import HeaderRegistroEmpresa from "./components/header";
import TabsRegistroEmpresa from "./components/tabs";


export default function RegistroEmpresa() {

  return (
    <div className="">
      {/* <HeaderRegistroEmpresa /> */}

      <div>
        <TabsRegistroEmpresa />
      </div>
    </div>
  );
}
