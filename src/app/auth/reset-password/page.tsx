import ResetPasswordPageClient from './ResetPasswordPageClient';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="flex items-center space-x-3 cursor-pointer w-fit">
            <Heart className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Jandira C. Frederick</h1>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="p-8 bg-white rounded-xl shadow-md w-full max-w-md m-4">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Redefinir Senha</h2>
          <ResetPasswordPageClient />
        </div>
      </main>

      <footer className="bg-white mt-8 py-4">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Jandira C. Frederick. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}