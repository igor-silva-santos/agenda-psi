import ForgotPasswordForm from '@/components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Recuperar Senha</h1>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
