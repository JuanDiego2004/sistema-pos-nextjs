// app/verify-email/page.tsx
import { useRouter } from 'next/router';

export default function VerifyEmailPage() {
  const router = useRouter();

  return (
    <div className="p-8 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">¡Correo verificado!</h1>
      <p>Tu cuenta ha sido activada correctamente.</p>
      <button
        onClick={() => router.push('/')}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Ir al inicio
      </button>
    </div>
  );
}