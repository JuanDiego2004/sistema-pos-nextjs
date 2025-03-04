// pages/index.js
"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  useDisclosure,
} from "@heroui/react";

export default function POSLayout() {
  const [selectedProducts, setSelectedProducts] = useState<
    { name: string; quantity: number }[]
  >([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Función para agregar un producto en dispositivos móviles
  const handleSelectProductMobile = (product: string) => {
    const newProduct = { name: product, quantity: 1 };
    setSelectedProducts((prev) => [...prev, newProduct]);
    onOpen(); // Abrimos el modal
  };

  // Función para agregar un producto en dispositivos grandes (PC/Tablet)
  const handleSelectProductDesktop = (product: string) => {
    const newProduct = { name: product, quantity: 1 };
    setSelectedProducts((prev) => [...prev, newProduct]);
  };

  // Función para actualizar la cantidad de un producto
  const updateQuantity = (index: number, newQuantity: number) => {
    setSelectedProducts((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Contenedor de la lista de productos */}
      <div
        className={`${
          selectedProducts.length > 0 ? "md:w-3/5" : "w-full"
        } p-4 bg-gray-100 overflow-y-auto`}
      >
        <h2 className="text-xl font-bold mb-4">Lista de Productos</h2>
        <div
          className={`grid gap-4 ${
            selectedProducts.length > 0
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
          }`}
        >
          {/* Ejemplo de productos */}
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-50"
              onClick={() => {
                if (window.innerWidth < 768) {
                  handleSelectProductMobile(`Producto ${index + 1}`);
                } else {
                  handleSelectProductDesktop(`Producto ${index + 1}`);
                }
              }}
            >
              Producto {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Contenedor de productos seleccionados (solo visible en PC/Tablet) */}
      <div
        className={`hidden md:flex ${
          selectedProducts.length > 0 ? "translate-x-0" : "translate-x-full"
        } md:w-2/5 p-4 bg-green-600 overflow-y-auto transition-transform duration-300 ease-in-out`}
      >
        <h2 className="text-xl font-bold mb-4">Productos Seleccionados</h2>
        <div className="space-y-2">
          {selectedProducts.length > 0 ? (
            selectedProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded-lg shadow-md"
              >
                <span>{product.name}</span>
                <Input
                  type="number"
                  value={product.quantity.toString()}
                  onChange={(e) =>
                    updateQuantity(index, Number(e.target.value))
                  }
                  min={1}
                  className="w-16 text-center"
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500">No hay productos seleccionados.</p>
          )}
        </div>
      </div>

      {/* Modal/DRAWER para móviles */}
      <Modal
        isOpen={isOpen}
        placement="bottom"
        onOpenChange={onOpenChange}
        isDismissable={true}
        scrollBehavior="inside"
        classNames={{
          base: "sm:hidden", // Solo visible en móviles
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Productos Seleccionados
              </ModalHeader>
              <ModalBody>
                <div className="space-y-2">
                  {selectedProducts.length > 0 ? (
                    selectedProducts.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white p-3 rounded-lg shadow-md"
                      >
                        <span>{product.name}</span>
                        <Input
                          type="number"
                          value={product.quantity.toString()}
                          onChange={(e) =>
                            updateQuantity(index, Number(e.target.value))
                          }
                          min={1}
                          className="w-16 text-center"
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No hay productos seleccionados.</p>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}