import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('[TEST-ENV] Verificando variáveis de ambiente');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    console.log('[TEST-ENV] Supabase URL:', supabaseUrl);
    console.log('[TEST-ENV] Supabase Key (primeiros 20 chars):', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'não configurada');
    
    return NextResponse.json({ 
      message: 'Variáveis de ambiente verificadas',
      supabaseUrl: !!supabaseUrl,
      supabaseKey: !!supabaseKey,
      env: process.env.NODE_ENV
    });
    
  } catch (error) {
    console.error('[TEST-ENV] Erro:', error);
    return NextResponse.json({ 
      error: 'Erro ao verificar variáveis', 
      details: error 
    }, { status: 500 });
  }
} 