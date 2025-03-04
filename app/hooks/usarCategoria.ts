import { useState, useEffect } from 'react';

export function usarCategorias() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const categoriasLocal = typeof window !== "undefined" ? localStorage.getItem('categorias') : null;
    const categoriasGuardadas = categoriasLocal ? JSON.parse(categoriasLocal) : null;

    if (categoriasGuardadas) {
      setCategorias(categoriasGuardadas);
      setIsLoading(false);
    } else {
      // Llamada a la API para obtener las categorías
      // Aquí debes manejar tu lógica para obtener las categorías de la API
      fetch('/api/categorias')
        .then((res) => res.json())
        .then((data) => {
          setCategorias(data);
          localStorage.setItem('categorias', JSON.stringify(data));
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err);
          setIsLoading(false);
        });
    }
  }, []);

  return { categorias, isLoading, error };
}
