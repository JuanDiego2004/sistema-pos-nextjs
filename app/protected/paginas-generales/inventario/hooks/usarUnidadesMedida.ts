// hooks/useUnidadMedida.ts
import { useState } from 'react';

type UnidadMedida = {
  id: string;
  codigo: string;
  descripcion: string;
};

type UseUnidadMedidaReturn = {
  unidades: UnidadMedida[];
  loading: boolean;
  error: string | null;
  fetchUnidades: () => Promise<void>;
  createUnidadMedida: (data: Omit<UnidadMedida, 'id'>) => Promise<void>;
  updateUnidadMedida: (id: string, data: Partial<UnidadMedida>) => Promise<void>;
  deleteUnidadMedida: (id: string) => Promise<void>;
};

export function useUnidadMedida(): UseUnidadMedidaReturn {
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener todas las unidades de medida
  const fetchUnidades = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/unidad-medida');
      if (!response.ok) throw new Error('Error al obtener las unidades de medida');
      const data: UnidadMedida[] = await response.json();
      setUnidades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Función para crear una nueva unidad de medida
  const createUnidadMedida = async (data: Omit<UnidadMedida, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/unidad-medida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al crear la unidad de medida');
      await fetchUnidades(); // Refrescar la lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar una unidad de medida
  const updateUnidadMedida = async (id: string, data: Partial<UnidadMedida>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/unidad-medida', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!response.ok) throw new Error('Error al actualizar la unidad de medida');
      await fetchUnidades(); // Refrescar la lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar una unidad de medida
  const deleteUnidadMedida = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/unidad-medida', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error('Error al eliminar la unidad de medida');
      await fetchUnidades(); // Refrescar la lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return { unidades, loading, error, fetchUnidades, createUnidadMedida, updateUnidadMedida, deleteUnidadMedida };
}