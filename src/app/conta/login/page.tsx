"use client";
import CombinedLoginForm from '@/components/CombinedLoginForm';

export default function ContaLoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-800">Acesse sua Conta</h1>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="p-8 bg-white rounded-xl shadow-md w-full max-w-md m-4">
          <CombinedLoginForm onOpenSignUp={() => {}} />
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