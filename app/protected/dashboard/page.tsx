"use client"; // Indica que este componente es del lado del cliente
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Button,
  useDisclosure,
} from "@heroui/react";
import Header from "@/components/hero";
import { signOutAction } from "@/app/actions";

export default function Dashboard() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div className="flex h-screen">
      {/* Botón para abrir el Drawer (Sidebar) */}
      fyawer
    </div>
  );
}