import {
  DatePicker,
  Checkbox,
  Input,
  Select,
  SelectItem,
  SharedSelection,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";

export const DetallesProductoSection = ({
  formData,
  setFormData,
  categorias,
  almacenes,
  proveedores,
}: {
  formData: any;
  setFormData: (data: any) => void;
  categorias: { id: string; nombre: string }[];
  almacenes: { id: string; nombre: string }[];
  proveedores: { id: string; nombre: string }[];
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-black dark:text-white text-black">
      <Input
        label="Nombre"
        value={formData.nombre}
        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
      />
      <Input
        label="Marca"
        value={formData.marca}
        onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
      />
      <DatePicker
        label="Fecha de Vencimiento"
        value={
          formData.fechaVencimiento
            ? parseDate(formData.fechaVencimiento)
            : undefined
        }
        onChange={(date) =>
          setFormData({
            ...formData,
            fechaVencimiento: date?.toString() || "",
          })
        }
      />
      <DatePicker
        label="Fecha de Fabricación"
        value={
          formData.fechaFabricacion
            ? parseDate(formData.fechaFabricacion)
            : undefined
        }
        onChange={(date) =>
          setFormData({
            ...formData,
            fechaFabricacion: date?.toString() || "",
          })
        }
      />
      <Checkbox
      color="primary"
        isSelected={formData.tieneIGV}
        onValueChange={(value) => setFormData({ ...formData, tieneIGV: value })}
      >
        <p className="text-black dark:text-white">Incluye IGV</p>
      </Checkbox>
      <Input
        label="Dimensiones (L x A x H)"
        value={formData.dimensiones}
        onChange={(e) =>
          setFormData({ ...formData, dimensiones: e.target.value })
        }
      />
      <Input
        label="Peso (kg)"
        type="number"
        step="0.01"
        min="0"
        value={formData.peso?.toString() || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            peso: parseFloat(e.target.value) || null,
          })
        }
      />
      <Input
        label="Impuestos Adicionales"
        type="number"
        step="0.01"
        min="0"
        value={formData.impuestosAdicionales?.toString() || "0"}
        onChange={(e) =>
          setFormData({
            ...formData,
            impuestosAdicionales: parseFloat(e.target.value) || 0,
          })
        }
      />

      <Input
        label="Descuento (%)"
        type="number"
        step="0.01"
        min="0"
        value={formData.descuento.toString()}
        onChange={(e) =>
          setFormData({
            ...formData,
            descuento: parseFloat(e.target.value) || 0,
          })
        }
      />
      <Input
        label="Costo de Almacenamiento"
        type="number"
        step="0.01"
        min="0"
        value={formData.costoAlmacenamiento?.toString() || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            costoAlmacenamiento: parseFloat(e.target.value) || null,
          })
        }
      />
      <Input
        label="Notas"
        value={formData.notas}
        onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
      />

      {/* Campos Agregados */}
      <Select
         label="Categoría"
        selectedKeys={formData.categoriaId ? [formData.categoriaId] : []}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0];
          // Guardamos solo el ID, no el objeto completo
          setFormData({
            ...formData,
            categoriaId: selectedKey?.toString() || "",
          });
        }}
      >
        {categorias.map((cat) => (
          <SelectItem className="text-gray-800 dark:text-gray-400" key={cat.id} value={cat.id}>
            {cat.nombre}
          </SelectItem>
        ))}
      </Select>

      <Select
  label="Almacenes"
  selectionMode="multiple"
  // Usar los almacenId de la estructura de almacenes
  selectedKeys={formData.almacenes.map((alm: { almacenId: any; }) => alm.almacenId)}
  onSelectionChange={(keys) => {
    const selectedKeys = Array.from(keys);
    
    // Crear la estructura correcta para cada almacén seleccionado
    const nuevosAlmacenes = selectedKeys.map(key => ({
      almacenId: key.toString(),
      stock: 0
    }));

    setFormData({
      ...formData,
      almacenes: nuevosAlmacenes
    });
  }}
>
  {almacenes.map((alm) => (
    <SelectItem className="text-gray-800 dark:text-gray-400"  key={alm.id} value={alm.id}>
      {alm.nombre}
    </SelectItem>
  ))}
</Select>

      <Select
        label="Proveedor"
        selectedKeys={formData.proveedorId ? [formData.proveedorId] : []}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0];
          // Guardar solo el ID
          setFormData({
            ...formData,
            proveedorId: selectedKey?.toString() || "",
          });
        }}
      >
        {proveedores.map((prov) => (
          <SelectItem className="text-gray-800 dark:text-gray-400"  key={prov.id} value={prov.id}>
            {prov.nombre}
          </SelectItem>
        ))}
      </Select>

      <Input
        label="Código Interno"
        value={formData.codigoInterno}
        onChange={(e) =>
          setFormData({ ...formData, codigoInterno: e.target.value })
        }
      />
      <Input
        label="Código de Barras"
        value={formData.codigoBarras}
        onChange={(e) =>
          setFormData({ ...formData, codigoBarras: e.target.value })
        }
      />
      <Input
        label="Lote"
        value={formData.lote || ""}
        onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
      />
      <Select
        label="Estado"
        selectedKeys={[formData.estado]}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0];
          setFormData({
            ...formData,
            estado: selectedKey?.toString() || "activo",
          });
        }}
      >
        <SelectItem className="text-gray-800 dark:text-gray-400"  key="activo" value="activo">
          Activo
        </SelectItem>
        <SelectItem className="text-gray-800 dark:text-gray-400"  key="inactivo" value="inactivo">
          Inactivo
        </SelectItem>
      </Select>
    </div>
  );
};
