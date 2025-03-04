'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    email?: string;
    rol?: string;
    nombre?: string;
  }>({});
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (user) {
          setUserData({
            email: user.email,
            rol: user.user_metadata?.rol, // Acceso correcto al rol
            nombre: user.user_metadata?.nombre // Acceso al nombre
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
      {userData.email && <p>Email: {userData.email}</p>}
      {userData.nombre && <p>Nombre: {userData.nombre}</p>}
      {userData.rol && <p>Rol: {userData.rol}</p>}
      {error && <p className="text-red-500 mt-4">Error: {error}</p>}
    </div>
  );
}