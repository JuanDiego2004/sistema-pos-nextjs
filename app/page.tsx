import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Hero from "@/components/hero";

export default async function Home() {
  const supabase = await createClient();

  // Verificar si el usuario está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si el usuario no está autenticado, redirigir a la ruta protegida
  if (!user) {
    redirect("/protected");
  }

  // Si el usuario no está autenticado, mostrar la página de inicio
  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col gap-6 px-4">
        <h2 className="font-medium text-xl mb-4">Next steps</h2>
      </main>
    </>
  );
}