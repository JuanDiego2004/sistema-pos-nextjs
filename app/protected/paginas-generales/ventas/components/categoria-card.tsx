// components/categoria-card.tsx
"use client";
import { Categoria } from "@prisma/client";

interface Props {
  categoria: Categoria;
  seleccionada: boolean;
  onClick: () => void;
}

export default function CategoriaCard({ categoria, seleccionada, onClick }: Props) {
  return (
    <div
      className={`p-4 border rounded-md  cursor-pointer text-center ${
        seleccionada ? "bg-orange-300 bg-opacity-15 text-orange-500 font-bold border-orange-400" : "bg-transparent"
      }`}
      style={{ display: "inline-block", minWidth: "100px" }} // Ancho ajustado al contenido
      onClick={onClick}
    >
      <h5 className="font-semibold">{categoria.nombre}</h5>
    </div>
  );
}