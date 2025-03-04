// app/protected/inventarista/ClientErrorHandler.tsx
"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ClientErrorHandler({ error }: { error: string }) {
  const router = useRouter();

  useEffect(() => {
    toast.error(error);
    setTimeout(() => router.push("/"), 2000);
  }, [error, router]);

  return <div className="p-4 text-red-500">Cargando...</div>;
}