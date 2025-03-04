"use client";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect solo se ejecuta en el cliente, por lo que ahora podemos mostrar la interfaz de forma segura
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="ghost" size="sm">
          {theme === "light" ? (
            <Sun key="light" size={ICON_SIZE} className="text-muted-foreground" />
          ) : theme === "dark" ? (
            <Moon key="dark" size={ICON_SIZE} className="text-muted-foreground" />
          ) : (
            <Laptop
              key="system"
              size={ICON_SIZE}
              className="text-muted-foreground"
            />
          )}
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem onClick={() => setTheme("light")} className="flex gap-2" key={""}>
          <Sun size={ICON_SIZE} className="text-muted-foreground" />
          <span>Light</span>
        </DropdownItem>
        <DropdownItem onClick={() => setTheme("dark")} className="flex gap-2" key={""}>
          <Moon size={ICON_SIZE} className="text-muted-foreground" />
          <span>Dark</span>
        </DropdownItem>
        <DropdownItem onClick={() => setTheme("system")} className="flex gap-2" key={""}>
          <Laptop size={ICON_SIZE} className="text-muted-foreground" />
          <span>System</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export { ThemeSwitcher };