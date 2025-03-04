import { AlmacenesTable } from "@/components/almacenes/components/tabla-almacenes"


export default function AlmacenesPAge() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Listado de Almacenes</h1>
      <AlmacenesTable />
    </main>
  )
}