
import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex flex-col md:flex-row w-screen h-screen dark:bg-black light:bg-white">
      {/* Contenedor del formulario (siempre visible) */}
      <div className="h-full w-full md:w-1/2 flex items-center justify-center">
        <form className="flex flex-col w-[90%] max-w-[300px]">
          <h1 className="text-2xl font-medium light:text-black dark:text-white">Iniciar Sesion</h1>
          <p className="text-sm text-blue-600">
            Don't have an account?{" "}
            <Link className=" font-medium underline text-blue-700" href="/sign-up">
              Sign up
            </Link>
          </p>
          <div className="flex flex-col gap-2 mt-8">
            <Input label="Correo Electronico" name="email" placeholder="you@example.com" required />
            <div className="flex justify-between items-center">
              <Link className="text-sm underline text-blue-700" href="/forgot-password">
                Olvido su contraseña?
              </Link>
            </div>
            <Input label="Ingrese Contraseña" type="password" name="password" placeholder="Your password" required />
            <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Sign in
        </SubmitButton>
            <FormMessage message={searchParams} />
          </div>
        </form>
      </div>

      {/* Imagen de fondo (oculta en móviles) */}
      <div className="hidden md:block w-1/2 h-full bg-[url('/assets/almacen.jpg')] bg-cover bg-center"></div>
    </div>
  );
}
