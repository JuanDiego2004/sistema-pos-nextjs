'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './ui/sidebar';
import Header from './header';

export function MainLayout({
  children,
  role
}: {
  children: React.ReactNode;
  role: "ADMIN" | "EMPLEADO" | "GERENTE" | "INVENTARISTA" | "VENDEDOR";
}) {
  const pathname = usePathname();
  const isAuthPage = ['/sign-up', '/sign-in'].includes(pathname);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {!isAuthPage && <Header />}

      {/* Contenedor del contenido principal */}
      <main className="flex-1 w-full max-w-full px-4 mx-auto">
        <div className="max-w-[100vw] overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}