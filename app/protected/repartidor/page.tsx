"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Preventa {
  id: string;
  fecha: string;
  total: number;
  estado: string;
  latitud: number;
  longitud: number;
  cliente: {
    id: string;
    nombre: string;
  };
}

interface PreventasApiResponse {
  preventas: Preventa[];
  estadosSistema: string[];
}

// Load the map component dynamically with no SSR because Leaflet needs window
const MapRouteTracker = dynamic(
  () => import('@/app/protected/repartidor/components/Mapa_reparto'),
  { ssr: false }
);

export default function RepartidorPage() {
  const [preventas, setPreventas] = useState<Preventa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarPreventas() {
      try {
        setLoading(true);
        const response = await fetch('/api/preventa');
        
        if (!response.ok) {
          throw new Error('Error al cargar los datos de preventas');
        }
        
        const data: PreventasApiResponse = await response.json();
        setPreventas(data.preventas);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    
    cargarPreventas();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Seguimiento de Ruta de Ventas</h1>
      
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-blue-100 p-4 rounded-md shadow mb-4"
          >
            Cargando preventas...
          </motion.div>
        )}
        
        {!loading && error && (
          <motion.div 
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-100 p-4 rounded-md shadow mb-4"
          >
            <p className="mb-2">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Intentar nuevamente
            </button>
          </motion.div>
        )}
        
        {!loading && !error && preventas.length === 0 && (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-yellow-100 p-4 rounded-md shadow mb-4"
          >
            No hay preventas con coordenadas disponibles para mostrar en el mapa.
          </motion.div>
        )}
        
        {!loading && !error && preventas.length > 0 && (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[600px] w-full rounded-lg overflow-hidden"
          >
            <MapRouteTracker preventas={preventas} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}