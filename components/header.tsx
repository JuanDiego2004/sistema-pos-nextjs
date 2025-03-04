// Archivo: components/header.tsx
// Modificado para ser sticky

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  Button,
} from "@heroui/react";
import { Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";

export const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Para evitar render en SSR

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/(auth-pages)/sign-in"); // Usando router.push en lugar de window.location
  };

  // Función para resetear localStorage de productos
  const resetLocalStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("productos");
      alert("Datos de productos en localStorage han sido reseteados.");
    }
  };

  return (
    <Navbar className="w-full sticky top-0 left-0 z-20 bg-white dark:bg-black shadow-md">
      <NavbarBrand className="ml-7 md:ml-0">
        <AcmeLogo />
        <p className="font-bold text-inherit dark:text-white">AGIL POS</p>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="primary" href="#">
            Contacto
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link aria-current="page" color="success" href="#">
            Personalizar Sistema
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="primary" href="#">
            Integrar 
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent as="div" justify="end">
        {/* Botón para cambiar el tema */}
        <Button
          isIconOnly
          variant="light"
          onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </Button>

        {/* Menú de usuario */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="secondary"
              name="Jason Hughes"
              size="sm"
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">zoey@example.com</p>
            </DropdownItem>
            <DropdownItem key="settings">My Settings</DropdownItem>
            <DropdownItem key="logout" color="danger" onClick={handleLogout}>
              Log Out
            </DropdownItem>
            <DropdownItem key="reset-localstorage" onClick={resetLocalStorage}>
              Reset LocalStorage
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}