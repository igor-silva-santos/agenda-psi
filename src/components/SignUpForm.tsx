'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';

import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { cpf } from 'cpf-cnpj-validator';
import zxcvbn, { ZXCVBNResult } from 'zxcvbn';
import { useErrorScrollToTop } from './useErrorScrollToTop';

const cleanCpf = (cpf: string) => cpf.replace(/\D/g, '');

const formatCpf = (cpf: string) => {
  cpf = cleanCpf(cpf);
  if (cpf.length <= 3) return cpf;
  if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
  if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
};

const signUpSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  email: z.string().min(1, { message: "O e-mail é obrigatório." }).email('Formato de e-mail inválido.'),
  cpf: z.string().refine((value) => cpf.isValid(value), { message: "CPF inválido." }),
  password: z.string()
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
    .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número.")
    .regex(/[^a-zA-Z0-9]/, "A senha deve conter pelo menos um caractere especial."),
  confirmPassword: z.string()
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["confirmPassword"],
      message: "As senhas não coincidem.",
    });
  }
});

interface SignUpFormType {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
}

interface SignUpFormProps {
  onClose?: () => void; // Optional prop for modal close
  onOpenLogin?: () => void; // New prop to open login modal
}

import { useRouter } from 'next/navigation';

// Função utilitária para formatar telefone
function formatTelefone(value: string) {
  const cleaned = value.replace(/\D/g, '').slice(0, 11);
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
}

// Função para normalizar data de nascimento
function normalizarDataNascimento(input: string): string {
  // Se vier no formato ddMMyyyy, converte para yyyy-MM-dd
  if (/^\d{8}$/.test(input)) {
    const dia = input.slice(0, 2);
    const mes = input.slice(2, 4);
    const ano = input.slice(4, 8);
    return `${ano}-${mes}-${dia}`;
  }
  // Se já estiver no formato yyyy-MM-dd, retorna igual
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }
  // Qualquer outro formato, retorna vazio
  return '';
}

export default function SignUpForm({ onClose, onOpenLogin }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [displayCpf, setDisplayCpf] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<ZXCVBNResult | null>(null);
  
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<SignUpFormType>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      cpf: '',
      dataNascimento: '',
      telefone: '',
    },
  });

  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');
  const senhaCoincide = confirmPasswordValue === passwordValue && confirmPasswordValue.length > 0;

  useEffect(() => {
    if (passwordValue) {
      const result = zxcvbn(passwordValue);
      
      const hasUpperCase = /[A-Z]/.test(passwordValue);
      const hasLowerCase = /[a-z]/.test(passwordValue);
      const hasNumber = /[0-9]/.test(passwordValue);
      const hasSpecialChar = /[^a-zA-Z0-9]/.test(passwordValue);

      let metCriteriaCount = 0;
      if (hasUpperCase) metCriteriaCount++;
      if (hasLowerCase) metCriteriaCount++;
      if (hasNumber) metCriteriaCount++;
      if (hasSpecialChar) metCriteriaCount++;

      if (metCriteriaCount >= 2 && result.score < 2) {
        result.score = 2; // Force to "Média" if at least half criteria met and score is lower
      } else if (metCriteriaCount < 2) {
        result.score = 0; // Force to "Muito Fraca" if less than two criteria met
      }

      setPasswordStrength(result);
    } else {
      setPasswordStrength(null);
    }
  }, [passwordValue]);

  const { data: session, status } = useSession();

  useErrorScrollToTop(serverError);

  const onSubmit: SubmitHandler<SignUpFormType> = async (data) => {
    setServerError('');
    setIsLoading(true);
    let dataNascimentoISO = '';
    // Converter dd/mm/aaaa para yyyy-mm-dd
    if (data.dataNascimento && data.dataNascimento.length === 10) {
      const [dia, mes, ano] = data.dataNascimento.split('/');
      if (dia && mes && ano) {
        dataNascimentoISO = `${ano}-${mes}-${dia}`;
      }
    }
    if (dataNascimentoISO) {
      dataNascimentoISO = `${dataNascimentoISO}T00:00:00.000Z`;
    }

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      name: data.name,
      cpf: data.cpf,
      dataNascimento: dataNascimentoISO,
      telefone: data.telefone,
      isSignUp: 'true',
      redirect: false
    });

    if (result?.error) {
      setServerError(result.error || "Erro ao criar conta. Verifique os dados e tente novamente.");
    }
    // O redirecionamento será tratado pelo useEffect abaixo
    setIsLoading(false);
  };

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/portal/paciente");
      if (onClose) onClose();
    }
  }, [status, router, onClose]);

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/portal' });
      if (onClose) onClose();
    } catch (_error) {
      setServerError("Erro ao fazer login com Google");
      setIsLoading(false);
    }
  };

  const getStrengthColor = (score: number | null) => {
    switch (score) {
      case 0: return "text-red-500";
      case 1: return "text-orange-500";
      case 2: return "text-yellow-500";
      case 3: return "text-green-500";
      case 4: return "text-green-500";
      default: return "text-gray-500";
    }
  };

  const getStrengthText = (score: number | null) => {
    switch (score) {
      case 0: return "Muito Fraca";
      case 1: return "Fraca";
      case 2: return "Média";
      case 3: return "Forte";
      case 4: return "Forte";
      default: return "";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
      <div className="text-center mb-8">
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-10" aria-label="Fechar modal de registro">
            <X className="h-8 w-8" />
          </button>
        )}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Criar Conta</h1>
        <p className="text-gray-600">Crie sua conta para agendar consultas</p>
      </div>
      <button onClick={handleGoogleSignUp} disabled={isLoading} className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-6 disabled:opacity-50 text-gray-900">
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Continuar com Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">ou</span></div>
      </div>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {serverError === "EMAIL_ALREADY_IN_USE" ? (
            <>
              Este e-mail já está em uso. Deseja{" "}
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  if (onOpenLogin) onOpenLogin();
                }}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                fazer login
              </button>
              ?
            </>
          ) : (
            serverError
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="h-4 w-4 inline mr-2 text-blue-600" />
            Nome completo
          </label>
          <input {...register("name")} type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-500" placeholder="Seu nome completo"/>
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="h-4 w-4 inline mr-2 text-blue-600" />
            Email
          </label>
          <input {...register("email")} type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-500" placeholder="seu@email.com"/>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="h-4 w-4 inline mr-2 text-blue-600" />
            CPF
          </label>
          <input
            type="text"
            autoComplete="one-time-code"
            value={displayCpf}
            onChange={(e) => {
              const cleaned = cleanCpf(e.target.value);
              setDisplayCpf(formatCpf(cleaned));
              setValue('cpf', cleaned);
            }}
            onBlur={() => {}} // Removed trigger('cpf') as it's not in the schema
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-500"
            placeholder="Seu CPF"
          />
          {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Lock className="h-4 w-4 inline mr-2 text-blue-600" />
            Senha
          </label>
          <div className="relative">
            <input {...register("password")} type={showPassword ? 'text' : 'password'} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12 text-gray-900 placeholder:text-gray-500" placeholder="Mínimo 6 caracteres"/>
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {passwordValue && (
            <div className="mt-2">
              {passwordStrength && passwordStrength.score !== undefined && (
                <>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div 
                      className="h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${(passwordStrength.score + 1) * 20}%`, 
                        backgroundColor: passwordStrength.score === 0 ? '#ef4444' : passwordStrength.score === 1 ? '#f97316' : passwordStrength.score === 2 ? '#facc15' : '#22c55e'
                      }}
                    ></div>
                  </div>
                  <p className="text-sm mt-1 text-gray-900">
                    Força da senha: <span className={`font-bold ${getStrengthColor(passwordStrength.score)}`}>{getStrengthText(passwordStrength.score)}</span>
                  </p>
                </>
              )}
              <ul className="text-sm text-gray-600 mt-2 list-disc list-inside">
                <li className={/./.test(passwordValue) && passwordValue.length >= 6 ? 'text-green-600' : ''}>Pelo menos 6 caracteres</li>
                <li className={/[A-Z]/.test(passwordValue) ? 'text-green-600' : ''}>Incluir letras maiúsculas</li>
                <li className={/[a-z]/.test(passwordValue) ? 'text-green-600' : ''}>Incluir letras minúsculas</li>
                <li className={/[0-9]/.test(passwordValue) ? 'text-green-600' : ''}>Incluir números</li>
                <li className={/[^a-zA-Z0-9]/.test(passwordValue) ? 'text-green-600' : ''}>Incluir caracteres especiais (!@#$%^&*)</li>
              </ul>
            </div>
          )}
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Lock className="h-4 w-4 inline mr-2 text-blue-600" />
            Confirmar senha
          </label>
          <div className="relative">
            <input
              {...register("confirmPassword")}
              type={showConfirmPassword ? 'text' : 'password'}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12 text-gray-900 placeholder:text-gray-500 ${confirmPasswordValue && !senhaCoincide ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Digite a senha novamente"
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {confirmPasswordValue && !senhaCoincide && (
            <p className="text-red-500 text-sm mt-1">As senhas não coincidem.</p>
          )}
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Nascimento
          </label>
          <input
            {...register("dataNascimento")}
            type="text"
            placeholder="dd/mm/aaaa"
            inputMode="numeric"
            maxLength={10}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-500"
            value={watch('dataNascimento') || ''}
            onChange={e => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length > 2) value = value.slice(0,2) + '/' + value.slice(2);
              if (value.length > 5) value = value.slice(0,5) + '/' + value.slice(5,9);
              if (value.length > 10) value = value.slice(0, 10);
              setValue('dataNascimento', value);
            }}
            // Remover a conversão para yyyy-mm-dd do onBlur
          />
          {errors.dataNascimento && <p className="text-red-500 text-sm mt-1">{errors.dataNascimento.message}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="telefone" className="block text-base font-semibold text-gray-800 mb-1">Telefone</label>
          <input
            {...register('telefone', { required: true })}
            id="telefone"
            type="tel"
            inputMode="numeric"
            maxLength={15}
            value={formatTelefone(watch('telefone') || '')}
            onChange={e => {
              const cleaned = e.target.value.replace(/\D/g, '').slice(0, 11);
              setValue('telefone', cleaned);
            }}
            onPaste={e => {
              e.preventDefault();
              const pasted = (e.clipboardData.getData('Text') || '').replace(/\D/g, '').slice(0, 11);
              setValue('telefone', pasted);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-500"
            placeholder="(99) 99999-9999"
          />
          {errors.telefone && <p className="text-red-500 text-xs font-semibold mt-1">{errors.telefone.message as string}</p>}
        </div>
        <button type="submit" disabled={isLoading || !passwordStrength || passwordStrength.score < 2} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2">
          {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
          {isLoading ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">Já tem uma conta?{' '}
          <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
