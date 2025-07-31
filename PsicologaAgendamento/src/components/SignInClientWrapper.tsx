"use client";

import { getProviders, ClientSafeProvider } from "next-auth/react";
import { useEffect, useState } from "react";
import SignInButtons from "@/components/SignInButtons";
import { LiteralUnion } from "next-auth/react";
import { BuiltInProviderType } from "next-auth/providers/index";

export default function SignInClientWrapper({ error }: { error?: string }) {
  const [providers, setProviders] = useState<Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    fetchProviders();
  }, []);

  // Since this is a sign-in page, we don't have a sign-up modal to open.
  // We pass an empty function to satisfy the prop type.
  const handleOpenSignUp = () => {}; 

  return (
    <SignInButtons providers={providers} onOpenSignUp={handleOpenSignUp} error={error} />
  );
}
