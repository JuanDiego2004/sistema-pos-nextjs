// hooks/useVentas.ts
"use client";

import { useState, useEffect } from "react";
import { Preventa } from "../utils/types";



export const useVentas = () => {
  const [preventas, setPreventas] = useState<Preventa[]>([]);
  const [estados, setEstados] = useState<string[]>([]);
  const [totalPaginas, setTotalPaginas] = useState<number>(0);
  const [pagina, setPagina] = useState<number>(1);
  const [busqueda, setBusqueda] = useState<string>("");
  const [estado, setEstado] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        setCargando(true);
        setError(null);

        const queryParams = new URLSearchParams({
          pagina: pagina.toString(),
          busqueda: busqueda,
          estado: estado,
        }).toString();

        const response = await fetch(`/api/preventa?${queryParams}`);
        if (!response.ok) {
          throw new Error("Error al cargar las ventas");
        }

        const data = await response.json();
        console.log("Datos de la API:", data); // Verifica que los datos incluyan `cliente` y `usuario`
        if (data.exito) {
          setPreventas(data.preventas);
          setEstados(data.estados);
          setTotalPaginas(data.totalPaginas);
        } else {
          setError("No se encontraron ventas");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setCargando(false);
      }
    };

    fetchVentas();
  }, [pagina, busqueda, estado]);

  return {
    preventas,
    estados,
    totalPaginas,
    pagina,
    setPagina,
    busqueda,
    setBusqueda,
    estado,
    setEstado,
    cargando,
    error,
  };
};