// hooks/usar-preventas.ts
import { useState, useEffect } from "react";

export function usarPreventas() {
  const [preventas, setPreventas] = useState<any[]>([]); // Ajusta el tipo según tu interfaz Preventa
  const [estados, setEstados] = useState<string[]>([]);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const fetchPreventas = async () => {
    setCargando(true);
    try {
      const response = await fetch("/api/preventa", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Error al obtener las preventas");
      }

      const data = await response.json();
      setPreventas(data.preventas || []);
      setEstados(data.estados || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchPreventas();
  }, []); // Carga inicial

  // Filtrado local
  const filteredPreventas = preventas.filter((preventa: any) => {
    const matchesSearch = busqueda
      ? preventa.cliente?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        preventa.usuario?.nombre.toLowerCase().includes(busqueda.toLowerCase())
      : true;

    const matchesEstado = estado && estado !== "all" ? preventa.estado === estado : true;

    return matchesSearch && matchesEstado;
  });

  // Calcular totalPaginas
  const totalPaginas = Math.ceil(filteredPreventas.length / rowsPerPage);

  // Paginación local
  const paginatedPreventas = filteredPreventas.slice(
    (pagina - 1) * rowsPerPage,
    pagina * rowsPerPage
  );

  // Función para refrescar los datos
  const refreshPreventas = () => {
    fetchPreventas();
  };

  return {
    preventas: paginatedPreventas,
    setPreventas, // Exponemos setPreventas para actualizaciones locales
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
    rowsPerPage,
    setRowsPerPage,
    refreshPreventas, // Nueva función para refrescar
  };
}