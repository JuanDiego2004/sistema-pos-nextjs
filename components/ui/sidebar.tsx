// Archivo: components/ui/sidebar.tsx
// Modificado para usar Next/Link y evitar recargas completas

"use client";

import { useState } from "react";
import CustomSidebar, { SidebarItem } from "@/components/ui/sidebar-ui";
import { Home, Settings, ShoppingCart, User, ChartBar } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  role: string;
  children?: React.ReactNode;
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  link?: string;
  submenu?: { title: string; link: string }[];
}

// Componente de proveedor del sidebar
export default function Sidebar({ role }: SidebarProps) {
  console.log("Rol recibido en Sidebar:", role);
  const pathname = usePathname();

  if (!role) {
    console.log("No se recibió rol");
    return <p className="text-center p-4">Cargando menú...</p>;
  }

  const menus: Record<string, MenuItem[]> = {
    ADMIN: [
      {
        title: "Dashboard",
        icon: <Home size={22} />,
        link: "/protected/dashboard",
      },
      {
        title: "Inventario",
        icon: <User size={22} />,
        submenu: [
          {
            title: "Productos",
            link: "/protected/paginas-generales/inventario",
          },
          { title: "Lista de Usuarios", 
            link: "/users/list" },
          { 
            title: "Inventariar", 
            link: "/protected//inventarista" 
          },
        ],
        
      },
      {
        title: "POS",
        icon: <User size={22} />,
        submenu: [
          {
            title: "Preventa",
            link: "/protected/paginas-generales/ventas/preventa",
          },
          { title: "Lista Ventas", 
            link: "/protected/paginas-generales/ventas/lista-ventas"  
          },
          { title: "empresa", 
            link: "/protected/admin/registro-empresa"  
          },
        ],
        
      },
      {
        title: "RUTAS",
        icon: <User size={22} />,
        submenu: [
          {
            title: "Mapa GPS",
            link: "/protected/repartidor",
          },
        ],
        
      },
      // ... resto de menús
    ],
    INVENTARISTA: [
      {
        title: "Dashboard",
        icon: <Home size={22} />,
        link: "/protected/dashboard",
      },
      {
        title: "Inventario",
        icon: <User size={22} />,
        submenu: [
          {
            title: "Productos",
            link: "/protected/paginas-generales/inventario",
          },
          { title: "Lista de Usuarios", 
            link: "/users/list" },
          { 
            title: "Inventariar", 
            link: "/protected//inventarista" 
            
          },
        ],
      },
      {
        title: "POS",
        icon: <User size={22} />,
        submenu: [
          {
            title: "Venta Rapida",
            link: "/protected/paginas-generales/ventas/preventa",
          },

        ],
      },
      { title: "Almacen", 
        icon: <ChartBar size={22} />, 
        link: "/protected/paginas-generales/almacenes" },
      {
        title: "Configuración Avanzando",
        icon: <Settings size={22} />,
        link: "#",
        submenu: [
          {
            title: "Configuracion Empresa",
            link: "/protected/admin/registro-empresa"
          },
        ],
      },
    ],
  };

  // Aseguramos que el rol esté en mayúsculas y sea válido
  const normalizedRole = role.toUpperCase();
  const userMenu = menus[normalizedRole] || [];

  return (
    <div className="h-full">
      <CustomSidebar>
        {userMenu.length > 0 ? (
          userMenu.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              text={item.title}
              active={item.link === pathname || (item.submenu?.some(sub => sub.link === pathname) ?? false)}
              submenu={item.submenu}
            />
          ))
        ) : (
          <p className="p-4 text-gray-500">No tienes acceso a ningún menú.</p>
        )}
      </CustomSidebar>
    </div>
  );
}

// Proveedor del contexto para hacer accesible el sidebar en toda la app
import { createContext, useContext, ReactNode } from "react";

type SidebarContextType = {
  role: string;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ 
  children, 
  role 
}: { 
  children: ReactNode;
  role: string;
}) {
  return (
    <SidebarContext.Provider value={{ role }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}