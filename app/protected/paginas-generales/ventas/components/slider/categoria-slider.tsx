// components/slider/categoria-slider.tsx
"use client";
import { Button } from "@heroui/button";
import React from "react";

interface Categoria {
  id: string;
  nombre: string;
}

interface Props {
  categorias: Categoria[];
  categoriaSeleccionada: string | null;
  setCategoriaSeleccionada: (id: string | null) => void;
}

export default function CategoriaSlider({
  categorias,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
}: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto p-2">
    {categorias.map((categoria) => (
      <Button
        key={categoria.id}
        onClick={() => setCategoriaSeleccionada(categoria.id)} // 🔥 Aquí solo cambiamos el estado
        className={` ${
          categoriaSeleccionada === categoria.id ? "bg-blue-600 text-white" : "bg-gray-300 dark:bg-blue-300"
        }`}
      >
        {categoria.nombre}
      </Button>
    ))}
  </div>
  );
}