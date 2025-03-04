// Archivo: app/layout.tsx
// Modificado para implementar persistencia de componentes

import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { Toaster } from "sonner";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PersistentLayout } from "@/components/layout-persistente";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase"
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

type Rol = "ADMIN" | "EMPLEADO" | "GERENTE" | "INVENTARISTA" | "VENDEDOR";

function isValidRol(rol: any): rol is Rol {
  return ["ADMIN", "EMPLEADO", "GERENTE", "INVENTARISTA", "VENDEDOR"].includes(rol);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  let role: Rol = "EMPLEADO"; // Valor por defecto

  try {
    // Obtener el usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect('/(auth-pages)/sign-in');
    }

    if (user?.email) {
      // Usar Prisma en lugar de Supabase para obtener el rol
      const usuarioData = await prisma.usuario.findUnique({
        where: { email: user.email },
        select: { rol: true },
      });

      console.log("Datos obtenidos de la tabla Usuario:", usuarioData);

      if (usuarioData?.rol && isValidRol(usuarioData.rol)) {
        role = usuarioData.rol;
        console.log("Rol asignado:", role);
      }
    }
  } catch (error) {
    console.error("Error obteniendo el usuario:", error);
  }

  console.log("Rol final que se pasa a los componentes:", role);

  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Usamos ClientLayout como un componente de cliente para manejar la persistencia */}
          <ClientLayout role={role}>
            {children}
            <Toaster />
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}


function ClientLayout({ children, role }: { children: React.ReactNode, role: Rol }) {
  return (
    <PersistentLayout role={role}>
      {children}
    </PersistentLayout>
  );
}