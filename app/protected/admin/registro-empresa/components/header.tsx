"use client";

import React from "react";

import { Menu } from "lucide-react";
import {  Dropdown,  DropdownTrigger,  DropdownMenu,  DropdownSection,  DropdownItem} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import Link from "next/link";

export default function HeaderRegistroEmpresa() {
  return (
    <header className="w-full bg-white shadow-sm p-3 rounded-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="#" className="text-xl font-bold text-gray-800">
            AGIL POS
          </Link>
        </div>

        {/* Menú de navegación - Visible en pantallas grandes */}
        <nav className="hidden md:flex space-x-6">
          <Link href="#info" className="text-gray-700 hover:text-gray-900">
            Info
          </Link>
          <Link href="#fotos" className="text-gray-700 hover:text-gray-900">
            Fotos
          </Link>
          <Link href="#contacto" className="text-gray-700 hover:text-gray-900">
            Contacto
          </Link>
        </nav>

        {/* Botón Registrar Administrador - Visible en pantallas grandes */}
        <button className="hidden md:inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Registrar Administrador
        </button>

        {/* Menú Dropdown - Visible en móviles */}
        <div className="md:hidden">
        <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered">Open Menu</Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions">
        <DropdownItem key="new">New file</DropdownItem>
        <DropdownItem key="copy">Copy link</DropdownItem>
        <DropdownItem key="edit">Edit file</DropdownItem>
        <DropdownItem key="delete" className="text-danger" color="danger">
          Delete file
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
        </div>
      </div>
    </header>
  );
}

