/** Modo demonstração: sem Supabase real — APIs retornam fixtures. */
export function isDemoMode(): boolean {
  if (process.env.AGENDAPSI_DEMO_MODE === 'true') return true;
  if (process.env.NEXT_PUBLIC_AGENDAPSI_DEMO === 'true') return true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key || url.includes('placeholder');
}
