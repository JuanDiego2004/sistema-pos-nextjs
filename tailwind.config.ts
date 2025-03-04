import { heroui } from "@heroui/theme";
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"], // Soporte para modo oscuro basado en clases
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}", // Incluye los estilos de HeroUI
  ],
  prefix: "", // Prefijo vacío para evitar conflictos
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px", // Define un breakpoint personalizado
      },
    },
    extend: {
      colors: {
        // Colores principales
        primary: {
          DEFAULT: "#006FEE", // Azul personalizado como ejemplo
          foreground: "#FFFFFF", // Texto sobre el color primario
        },
        secondary: {
          DEFAULT: "#F3F4F6", // Gris claro
          foreground: "#1F2937", // Texto sobre el color secundario
        },
        destructive: {
          DEFAULT: "#EF4444", // Rojo para errores
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#E5E7EB", // Gris muy claro
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#10B981", // Verde para énfasis
          foreground: "#FFFFFF",
        },
        background: "#FFFFFF", // Fondo principal
        foreground: "#111827", // Color de texto principal
        border: "#E5E7EB", // Color de bordes
        input: "#D1D5DB", // Color de bordes de inputs
        ring: "#3B82F6", // Color de anillos (focus)
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#111827",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#111827",
        },
        sidebar: {
          DEFAULT: "#F9FAFB", // Fondo del sidebar
          foreground: "#374151",
          primary: "#4F46E5", // Color primario del sidebar
          "primary-foreground": "#FFFFFF",
          accent: "#F3F4F6",
          "accent-foreground": "#1F2937",
          border: "#E5E7EB",
          ring: "#3B82F6",
        },
        chart: {
          "1": "#4F46E5", // Azul
          "2": "#10B981", // Verde
          "3": "#EF4444", // Rojo
          "4": "#F59E0B", // Naranja
          "5": "#6366F1", // Morado
        },
      },
      fontFamily: {
        vaucher: ["Courier Prime", "monospace"]
      },
      borderRadius: {
        lg: "8px", // Bordes grandes
        md: "6px", // Bordes medianos
        sm: "4px", // Bordes pequeños
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), heroui()], // Plugins necesarios
};

export default config;