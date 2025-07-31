"use client";

import { getProviders, signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import CombinedLoginForm from "@/components/CombinedLoginForm";

type Providers = Awaited<ReturnType<typeof getProviders>>;

export default function SignInButtons({ providers, onOpenSignUp, error }: { providers: Providers, onOpenSignUp: () => void, error?: string }) {
  return (
    <div>
      {providers?.google && (
        <button
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 border rounded-lg hover:bg-gray-50 mb-4 text-gray-900"
        >
          <FcGoogle />
          <span>Continuar com Google</span>
        </button>
      )}
      <CombinedLoginForm onOpenSignUp={onOpenSignUp} error={error} />
    </div>
  );
}
