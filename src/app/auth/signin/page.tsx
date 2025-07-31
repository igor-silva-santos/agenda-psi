import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import SignInClientWrapper from "@/components/SignInClientWrapper";

export default function SignInPage({ searchParams }: { searchParams: { error?: string } }) {
  // Remover redirecionamento automático do servidor
  // const session = await getServerSession(authOptions);
  // if (session) {
  //   const targetUrl = session.user.role === "ADMIN" ? "/admin" : "/portal/paciente";
  //   redirect(targetUrl);
  // }

  const error = searchParams.error;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="flex items-center space-x-3 cursor-pointer w-fit">
            <Heart className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Dra. Jandira Frederick</h1>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="p-8 bg-white rounded-xl shadow-md w-full max-w-md m-4">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Acesse sua Conta</h2>
          <SignInClientWrapper error={error} />
          <p className="mt-6 text-center text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
              Agende uma consulta para começar
            </Link>
          </p>
        </div>
      </main>

      <footer className="bg-white mt-8 py-4">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Dra. Jandira Frederick. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
