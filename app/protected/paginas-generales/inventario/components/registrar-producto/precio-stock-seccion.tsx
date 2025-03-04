import { Input } from "@heroui/react";

export const SeccionPrecioStock = ({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: (data: any) => void;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Precio de Compra (S/)"
        type="number"
        step="0.01"
        min="0"
        value={formData.precioCompra.toString()}
        onChange={(e) =>
          setFormData({
            ...formData,
            precioCompra: parseFloat(e.target.value) || 0,
          })
        }
      />
      <Input
        label="Stock Actual"
        type="number"
        min="0"
        value={formData.stock.toString()}
        onChange={(e) =>
          setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
        }
      />
      <Input
        label="Stock Mínimo"
        type="number"
        min="0"
        value={formData.stockMinimo.toString()}
        onChange={(e) =>
          setFormData({ ...formData, stockMinimo: parseInt(e.target.value) || 0 })
        }
      />
      <Input
        label="Stock Máximo (opcional)"
        type="number"
        min="0"
        value={formData.stockMaximo?.toString() || ""}
        onChange={(e) =>
          setFormData({ ...formData, stockMaximo: parseInt(e.target.value) || null })
        }
      />
    </div>
  );
};