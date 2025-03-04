// Archivo: components/persistent-layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Sidebar from './ui/sidebar';
import Header from './header';

type Rol = "ADMIN" | "EMPLEADO" | "GERENTE" | "INVENTARISTA" | "VENDEDOR";

export function PersistentLayout({
  children,
  role
}: {
  children: React.ReactNode;
  role: Rol;
}) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  // Detectar páginas de autenticación
  const isAuthPage = ['/sign-up', '/sign-in'].includes(pathname) ||
                     pathname.includes('/(auth-pages)');
  
  // Efecto para asegurarnos de que estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Si estamos en una página de autenticación, no mostramos el header ni el sidebar
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header fijo en la parte superior */}
      <div className="sticky top-0 z-50 w-full">
        <Header />
      </div>
      
      <div className="flex flex-1 w-full relative">
        {/* Sidebar - Quitamos sticky de este contenedor */}
        {isClient && (
          <div className="h-[calc(100vh-64px)]">
            <Sidebar role={role} />
          </div>
        )}
        
        {/* Contenido principal - Explícitamente le damos un z-index bajo */}
        <main className="flex-1 p-4 overflow-auto w-full relative z-0 bg-white dark:bg-black">
          {children}
        </main>
      </div>
    </div>
  );
}