import { useState, useEffect } from "react";
import { Button } from "@heroui/button";

import { Input } from "@/components/ui/input";
import { toast } from "sonner";



// Definir la interfaz Categoria
interface Categoria {
  id: string;
  nombre: string;
}

interface FormCrearCategoriaProps {
  onSuccess: (nuevaCategoria: Categoria) => void;
}

export function FormCrearCategoria({ onSuccess }: FormCrearCategoriaProps) {
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCategoria) {
      toast.error("❌ Error", {
        description: "Debes ingresar un nombre",
      })
      
      return;
    }
    setLoading(true);
    
    try {
      const response = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombreCategoria }),
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error desconocido");
      }
    
      const data: Categoria = await response.json();
      toast.success("✅ Categoría creada", {
        description: "La categoría se ha registrado correctamente",
      })

     
      onSuccess(data);
      setNombreCategoria("");
    } catch (error) {
      toast.error("❌ Error", {
        description: error instanceof Error ? error.message : "Error desconocido",
      })
      toast.error("❌ Error", {
        description: error instanceof Error ? error.message : "Error desconocido",
      })
      
    }  finally {
      setLoading(false);
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Nombre de la categoría"
        value={nombreCategoria}
        onChange={(e) => setNombreCategoria(e.target.value)}
      />

      

<Button
  onPress={() => {
    handleSubmit(new Event('submit') as unknown as React.FormEvent);
  }}
>
  {loading ? "Guardando..." : "Crear Categoría"}
</Button>
    </form>
  );
}
