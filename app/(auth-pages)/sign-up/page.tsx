import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { SmtpMessage } from "../smtp-message";

export default async function Signup(props: {
  searchParams: Promise<Message>;
  
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

 
  return (
    <div className="min-h-screen w-screen">
      {/* Contenedor principal */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-100px)]">
        {/* Lado Izquierdo */}
        <div className="w-full md:w-3/6 p-4 md:p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <span className={`text-sm md:text-base`}>
              INICIA ESTE NUEVO RUMBO
            </span>
            <h2 className={`text-2xl md:text-4xl text-gray-800 my-4`}>
              Crear un nuevo usuario
            </h2>
            <div className="flex gap-2 mt-3 text-sm md:text-base">
              <span className="text-gray-500">¿Ya eres miembro?</span>
              <strong className="text-blue-600">Inicia sesión</strong>
            </div>

            {/* Formulario Responsivo */}
            <form>
              <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
                <div className="mb-2">
                  <label
                    htmlFor="nombre"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Nombre
                  </label>
                  <input
                  name="nombre"
                    type="text"
                    className="block w-full px-4 py-2 mt-2 text-black bg-white border rounded-md focus:border-gray-500 focus:ring-gray-600 focus:outline-none focus:ring focus:ring-opacity-40"
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="block w-full px-4 py-2 mt-2 text-black bg-white border rounded-md focus:border-gray-500 focus:ring-gray-600 focus:outline-none focus:ring focus:ring-opacity-40"
                  />
                </div>

                <div className="mb-2">
                <label
                  htmlFor="rol"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Rol
                </label>
                <select
                  id="rol"
                  name="rol"
                  className=" block w-full px-4 py-2 mt-2 text-black bg-white border rounded-md focus:border-gray-500 focus:ring-gray-600 focus:outline-none focus:ring focus:ring-opacity-40"
                >
                  <option value="">Selecciona un rol</option>
                  <option value="admin">Administrador</option>
                  <option value="vendedor">Usuario</option>
                  <option value="inventarista">Invitado</option>
                </select>
              </div>

                <div className="mb-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Contraseña
                  </label>
                  <input
                  name="password"
                    type="password"
                    className="block w-full px-4 py-2 mt-2 text-black bg-white border rounded-md focus:border-gray-500 focus:ring-gray-600 focus:outline-none focus:ring focus:ring-opacity-40"
                  />
                </div>


                <SubmitButton
                  formAction={signUpAction}
                  pendingText="Signing up..."
                >
                  Sign up
                </SubmitButton>
                <FormMessage message={searchParams} />
              </div>
            </form>
           
          </div>
        </div>

        {/* Lado Derecho - Imagen */}
        <div className="hidden md:block w-3/6 bg-[url('/assets/almacen.jpg')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/100 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}

// return (
//   <>
//     <form className="flex flex-col min-w-64 max-w-64 mx-auto">
//       <h1 className="text-2xl font-medium">Sign up</h1>
//       <p className="text-sm text text-foreground">
//         Already have an account?{" "}
//         <Link className="text-primary font-medium underline" href="/sign-in">
//           Sign in
//         </Link>
//       </p>
//       <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
//         <Label htmlFor="email">Email</Label>
//         <Input name="email" placeholder="you@example.com" required />
//         <Label htmlFor="password">Password</Label>
//         <Input
//           type="password"
//           name="password"
//           placeholder="Your password"
//           minLength={6}
//           required
//         />
//         <SubmitButton formAction={signUpAction} pendingText="Signing up...">
//           Sign up
//         </SubmitButton>
//         <FormMessage message={searchParams} />
//       </div>
//     </form>
//     <SmtpMessage />
//   </>
// );
