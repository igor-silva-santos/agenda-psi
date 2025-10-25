"use client";

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

// Função para validar CPF (incluindo dígitos verificadores)
const isValidCPF = (cpf: string) => {
  cpf = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false; // Verifica se tem 11 dígitos e não é sequência repetida

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

// Função simples para validar email
const isValidEmail = (email: string) => {
  return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
};

interface CombinedLoginFormProps {
  onOpenSignUp: () => void;
  error?: string;
}

export default function CombinedLoginForm({ onOpenSignUp, error: initialError }: CombinedLoginFormProps) {
  const [identifier, setIdentifier] = useState(''); // Pode ser email ou CPF
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError || '');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const isEmailValid = isValidEmail(identifier);
  const isCPFValid = isValidCPF(identifier);
  const [identifierTouched, setIdentifierTouched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (isEmailValid) {
      result = await signIn('credentials', {
        redirect: false,
        email: identifier,
        password,
      });
    } else if (isCPFValid) {
      result = await signIn('credentials', {
        redirect: false,
        cpf: identifier,
        password,
      });
    } else {
      setError('Por favor, insira um email válido ou um CPF válido e completo.');
      setLoading(false);
      return;
    }

    if (result?.error) {
      setError(result.error);
    } else if (result?.ok) {
      // Buscar a sessão atualizada para saber o role
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      const targetUrl = session?.user?.role === 'ADMIN' ? '/admin' : '/portal/paciente';
      console.log('Login bem-sucedido, redirecionando para:', targetUrl);
      window.location.href = targetUrl;
    }
    setLoading(false);
  };

  // Remover o useEffect de redirecionamento automático
  // useEffect(() => {
  //   if (status === "authenticated") {
  //     const targetUrl = session.user.role === "ADMIN" ? "/admin" : "/portal/paciente";
  //     router.push(targetUrl);
  //   }
  // }, [status, session, router]);

  useEffect(() => {
    if (initialError === "access_denied") {
      setError("Você não tem permissão para acessar esta página.");
    } else if (initialError === "unauthenticated") {
      setError("Faça login para acessar esta página.");
    }
  }, [initialError]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div>
        <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">Email ou CPF</label>
        <input
          id="identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
          placeholder="Digite seu email ou CPF"
          required
        />
        {identifierTouched && !isEmailValid && !isCPFValid && identifier.length > 0 && (
          <p className="mt-2 text-sm text-red-600">Formato inválido. Digite um email ou CPF válido.</p>
        )}
      </div>

      <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">Senha</label>
            <div className="text-sm">
              <Link href="/auth/esqueceu-sua-senha" className="font-medium text-blue-600 hover:text-blue-500">
                Esqueceu sua senha?
              </Link>
            </div>
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            required
          />
          <div className="flex items-center mt-2">
            <input
              id="mostrarSenha"
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword((v) => !v)}
              className="mr-2"
            />
            <label htmlFor="mostrarSenha" className="text-sm text-gray-700 select-none cursor-pointer">Mostrar senha</label>
          </div>
        </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
      >
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
      <p className="mt-6 text-center text-sm text-gray-600">
        Não tem uma conta?{' '}
        <Link href="#" onClick={onOpenSignUp} className="font-medium text-blue-600 hover:text-blue-500">
          Registre-se aqui
        </Link>
      </p>
    </form>
  );
}
