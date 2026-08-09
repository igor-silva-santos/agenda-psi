'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Loader2, UserRound, Shield } from 'lucide-react';
import { siteConfig } from '@/config/site';
import type { DemoRole } from '@/lib/demo-auth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const msg = searchParams.get('msg');
  const error = searchParams.get('error');

  const [email, setEmail] = useState('demo@agendapsi.demo');
  const [password, setPassword] = useState('demo');
  const [loading, setLoading] = useState<DemoRole | 'form' | null>(null);
  const [formError, setFormError] = useState('');

  const enterAs = async (role: DemoRole) => {
    setFormError('');
    setLoading(role);
    try {
      // Cookie demo (middleware + layouts)
      await fetch('/api/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      // NextAuth mock (aceita qualquer credencial)
      await signIn('credentials', {
        redirect: false,
        email: email || `${role.toLowerCase()}@agendapsi.demo`,
        password: password || 'demo',
        demoRole: role,
      });

      router.push(role === 'ADMIN' ? '/admin' : '/portal/paciente');
      router.refresh();
    } catch {
      setFormError('Não foi possível entrar na demo. Tente novamente.');
      setLoading(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form também entra sem validar — default paciente
    await enterAs('PACIENTE');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white border border-muted rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2 cursor-pointer">
            <img
              src={siteConfig.assets.logo}
              alt={siteConfig.productName}
              className="h-14 w-14 object-contain"
            />
            <span className="font-heading font-bold text-2xl text-brand">
              {siteConfig.productName}
            </span>
          </Link>
          <p className="text-slate-500 text-sm mt-2">
            Demonstração de portfólio — sem validação real
          </p>
        </div>

        {(msg === 'faça-login-primeiro' || error === 'inactivity') && (
          <div className="mb-4 p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-center text-sm">
            {error === 'inactivity'
              ? 'Sessão encerrada por inatividade. Entre novamente.'
              : 'Faça login para continuar.'}
          </div>
        )}

        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-center text-sm">
            {formError}
          </div>
        )}

        <div className="space-y-3 mb-8">
          <button
            type="button"
            onClick={() => enterAs('PACIENTE')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 min-h-[48px] px-4 py-3 rounded-xl bg-brand text-white font-medium hover:bg-brand-800 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading === 'PACIENTE' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <UserRound className="h-5 w-5" />
            )}
            Entrar como Paciente
          </button>
          <button
            type="button"
            onClick={() => enterAs('ADMIN')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 min-h-[48px] px-4 py-3 rounded-xl bg-ink text-white font-medium hover:bg-slate-800 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading === 'ADMIN' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Shield className="h-5 w-5" />
            )}
            Entrar como Admin
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wide">
            <span className="bg-white px-3 text-slate-400">ou use o formulário</span>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-muted bg-surface px-4 py-3 text-ink focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
              placeholder="qualquer@email.com"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-muted bg-surface px-4 py-3 text-ink focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
              placeholder="qualquer senha"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={!!loading}
            className="w-full min-h-[48px] rounded-xl border border-brand text-brand font-medium hover:bg-brand-50 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading === 'form' || loading === 'PACIENTE' ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            ) : (
              'Entrar (sem validação)'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Qualquer e-mail/senha funciona. Os botões acima definem o papel na demo.
        </p>
      </div>

      <p className="text-center mt-6">
        <Link href="/" className="text-sm text-brand hover:underline cursor-pointer">
          ← Voltar ao início
        </Link>
      </p>
    </div>
  );
}

export default function ContaLoginPage() {
  return (
    <div className="min-h-screen flex flex-col hero-atmosphere">
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <Suspense
          fallback={
            <div className="text-slate-500 flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Carregando…
            </div>
          }
        >
          <LoginContent />
        </Suspense>
      </main>
      <footer className="py-4 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} {siteConfig.productName} · Demo de portfólio
      </footer>
    </div>
  );
}
