"use client";
import { useState, useEffect } from "react";
import { Input, ScrollShadow } from "@heroui/react";
import { usarClientes } from "@/app/hooks/usarClientes";


interface Cliente {
  id: string;
  nombre: string;
  numeroDocumento: string;
}

interface BuscadorClientesProps {
  busquedaCliente: string;
  setBusquedaCliente: (value: string) => void;
  clientesFiltrados: Cliente[];
  setClientesFiltrados: (clientes: Cliente[]) => void;
  onClienteSeleccionado: (cliente: Cliente) => void;
}

export default function BuscadorClientes({
  busquedaCliente,
  setBusquedaCliente,
  clientesFiltrados,
  setClientesFiltrados,
  onClienteSeleccionado,
}: BuscadorClientesProps) {
  const { clientes, isLoading, error } = usarClientes();

  // Filtrar clientes localmente según el valor de búsqueda
  useEffect(() => {
    if (isLoading || error) {
      setClientesFiltrados([]);
      return;
    }

    if (busquedaCliente.trim() === "") {
      setClientesFiltrados([]);
    } else {
      const filtrados = clientes.filter(
        (cliente: { nombre: string; numeroDocumento: string | string[]; }) =>
          cliente.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
          cliente.numeroDocumento.includes(busquedaCliente)
      );
      setClientesFiltrados(filtrados);
    }
  }, [busquedaCliente, clientes, isLoading, error, setClientesFiltrados]);

  return (
    <div className="relative w-full">
      <Input
        value={busquedaCliente}
        onChange={(e) => setBusquedaCliente(e.target.value)}
        placeholder="Buscar cliente..."
        className="w-full p-2  rounded-md focus:outline-none focus:border-blue-500"
        disabled={isLoading}
      />

      {isLoading && (
        <div className="absolute inset-0 flex justify-center items-center bg-gray-200 bg-opacity-50">
          <img src="/assets/loader.gif" alt="Cargando..." className="w-8 h-8" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex justify-center items-center bg-red-100 bg-opacity-50 text-red-500">
          {error}
        </div>
      )}

      {clientesFiltrados.length > 0 && !isLoading && !error && (
        <ScrollShadow
          className="absolute z-50 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg"
          orientation="vertical"
        >
          {clientesFiltrados.map((cliente) => (
            <div
              key={cliente.id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                onClienteSeleccionado({
                  id: cliente.id,
                  nombre: cliente.nombre,
                  numeroDocumento: cliente.numeroDocumento,
                });
                setClientesFiltrados([]);
              }}
            >
              {cliente.nombre} - {cliente.numeroDocumento}
            </div>
          ))}
        </ScrollShadow>
      )}
    </div>
  );
}