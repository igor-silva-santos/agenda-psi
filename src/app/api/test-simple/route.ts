import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('[TEST-SIMPLE] Iniciando teste simples');
    
    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('[TEST-SIMPLE] Supabase URL:', supabaseUrl ? 'Configurada' : 'Não configurada');
    console.log('[TEST-SIMPLE] Supabase Key:', supabaseKey ? 'Configurada' : 'Não configurada');
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Variáveis de ambiente não configuradas',
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey
      }, { status: 500 });
    }
    
    // Testar conexão com Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('[TEST-SIMPLE] Testando conexão com Supabase...');
    
    const { data, error } = await supabase
      .from('User')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('[TEST-SIMPLE] Erro na conexão:', error);
      return NextResponse.json({ 
        error: 'Erro na conexão com Supabase', 
        details: error 
      }, { status: 500 });
    }
    
    console.log('[TEST-SIMPLE] Conexão OK');
    
    return NextResponse.json({ 
      message: 'Conexão com Supabase OK',
      data: data
    });
    
  } catch (error) {
    console.error('[TEST-SIMPLE] Erro geral:', error);
    return NextResponse.json({ 
      error: 'Erro geral no teste simples', 
      details: error 
    }, { status: 500 });
  }
} 