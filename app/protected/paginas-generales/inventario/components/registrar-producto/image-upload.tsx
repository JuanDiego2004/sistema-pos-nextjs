"use client";

import { useState, useRef } from "react";

export const SubirImagen = ({ onImageSelect }: { onImageSelect: (file: File | null) => void }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setSelectedImage(event.target.files[0]);
      onImageSelect(event.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center border-dashed border-2 border-gray-300 p-4 rounded-lg">
      {selectedImage ? (
        <div className="relative">
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-md"
          />
          <button
            type="button"
            onClick={() => {
              setSelectedImage(null);
              onImageSelect(null);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6"
          >
            ×
          </button>
        </div>
      ) : (
        <p className="text-gray-500">Sin imagen</p>
      )}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Seleccionar Imagen
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageChange}
        className="hidden"
      />
      <p className="text-xs text-gray-500 mt-1">Formatos: JPG, PNG. Máx 5MB</p>
    </div>
  );
};