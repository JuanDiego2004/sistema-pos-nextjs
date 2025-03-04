import { useState, useEffect } from "react";
import { Sucursal } from "../utils/types";
import { toast } from "sonner";

export function usarSucursal() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [currentSucursal, setCurrentSucursal] = useState<Sucursal>({
    id: "",
    nombre: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    pais: "Perú",
    telefono: "",
    email: "",
    empresaId: "",
  });

  // Función para obtener sucursales
  const fetchSucursales = async () => {
    try {
      const response = await fetch(`/api/sucursales`);
      if (!response.ok) {
        throw new Error("Error al obtener sucursales");
      }
      const data = await response.json();
      setSucursales(data); // Actualiza el estado con los datos recibidos
    } catch (error) {
      console.error("Error al obtener sucursales:", error);
      toast.error("No se pudieron cargar las sucursales");
    }
  };
  
  // Cargar la empresa al inicio
  useEffect(() => {
    const fetchEmpresaId = async () => {
      try {
        const response = await fetch("/api/empresa");
        if (!response.ok) throw new Error("No se pudo obtener la empresa.");

        const empresa = await response.json();
        if (empresa && empresa.id) {
          setEmpresaId(empresa.id);
          setCurrentSucursal((prev) => ({ ...prev, empresaId: empresa.id }));
        }
      } catch (error) {
        console.error("Error obteniendo empresa:", error);
        toast.error("No se pudo obtener la empresa.");
      }
    };

    fetchEmpresaId();
  }, []);

  // Llamar a fetchSucursales cuando empresaId cambie
  useEffect(() => {
    if (!empresaId) return;
    fetchSucursales();
  }, [empresaId]); // Se ejecuta cuando empresaId cambie

  return {
    sucursales,
    currentSucursal,
    setSucursales,
    empresaId,
    fetchSucursales, // Ahora la puedes llamar desde otro componente
  };
}
