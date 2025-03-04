import { Categoria, Proveedor, UnidadMedida } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";

interface Almacen {
  codigo: string;
  direccion: string;
  id: number;
  nombre: string;
}

export function useDatosIniciales() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDatos = useCallback(async () => {
    setIsLoading(true);
    try {
      // Verificar si ya hay datos en localStorage
      const storedCategorias = localStorage.getItem("categorias");
      const storedAlmacenes = localStorage.getItem("almacenes");
      const storedProveedores = localStorage.getItem("proveedores");
      const storedUnidades = localStorage.getItem("unidades");

      if (storedCategorias && storedAlmacenes && storedProveedores && storedUnidades) {
        // Cargar datos desde localStorage
        setCategorias(JSON.parse(storedCategorias));
        setAlmacenes(JSON.parse(storedAlmacenes));
        setProveedores(JSON.parse(storedProveedores));
        setUnidades(JSON.parse(storedUnidades));
        setIsLoading(false);
        return;
      }

      // Si no hay datos en localStorage, hacer la petición a la API
      const [categoriasRes, almacenesRes, proveedoresRes, unidadesRes] = await Promise.all([
        fetch("/api/categorias"),
        fetch("/api/almacenes"),
        fetch("/api/proveedores"),
        fetch("/api/unidadesmedida"),
      ]);

      if (!categoriasRes.ok || !almacenesRes.ok || !proveedoresRes.ok || !unidadesRes.ok) {
        throw new Error("Error en la respuesta de la API");
      }

      // Convertir a JSON
      const categoriasData = await categoriasRes.json();
      const almacenesData = await almacenesRes.json();
      const proveedoresData = await proveedoresRes.json();
      const unidadesData = await unidadesRes.json();

      // Guardar en localStorage
      localStorage.setItem("categorias", JSON.stringify(categoriasData));
      localStorage.setItem("almacenes", JSON.stringify(almacenesData));
      localStorage.setItem("proveedores", JSON.stringify(proveedoresData));
      localStorage.setItem("unidades", JSON.stringify(unidadesData));

      // Actualizar estado con los datos obtenidos
      setCategorias(categoriasData);
      setAlmacenes(almacenesData);
      setProveedores(proveedoresData);
      setUnidades(unidadesData);
    } catch (error) {
      console.error("Error obteniendo datos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

  return { categorias, almacenes, proveedores, unidades, isLoading, fetchDatos };
}
