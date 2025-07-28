import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('[TEST-DB] Iniciando teste de estrutura do banco');
    
    // Testar tabela User
    console.log('[TEST-DB] Testando tabela User...');
    const { data: users, error: userError } = await supabase
      .from('User')
      .select('*')
      .limit(1);
    
    if (userError) {
      console.error('[TEST-DB] Erro na tabela User:', userError);
      return NextResponse.json({ error: 'Erro na tabela User', details: userError }, { status: 500 });
    }
    
    console.log('[TEST-DB] Tabela User OK, estrutura:', users.length > 0 ? Object.keys(users[0]) : 'vazia');
    
    // Testar tabela BookableSlot
    console.log('[TEST-DB] Testando tabela BookableSlot...');
    const { data: slots, error: slotError } = await supabase
      .from('BookableSlot')
      .select('*')
      .limit(1);
    
    if (slotError) {
      console.error('[TEST-DB] Erro na tabela BookableSlot:', slotError);
      return NextResponse.json({ error: 'Erro na tabela BookableSlot', details: slotError }, { status: 500 });
    }
    
    console.log('[TEST-DB] Tabela BookableSlot OK, estrutura:', slots.length > 0 ? Object.keys(slots[0]) : 'vazia');
    
    // Testar tabela Agendamento
    console.log('[TEST-DB] Testando tabela Agendamento...');
    const { data: agendamentos, error: agendamentoError } = await supabase
      .from('Agendamento')
      .select('*')
      .limit(1);
    
    if (agendamentoError) {
      console.error('[TEST-DB] Erro na tabela Agendamento:', agendamentoError);
      return NextResponse.json({ error: 'Erro na tabela Agendamento', details: agendamentoError }, { status: 500 });
    }
    
    console.log('[TEST-DB] Tabela Agendamento OK, estrutura:', agendamentos.length > 0 ? Object.keys(agendamentos[0]) : 'vazia');
    
    // Testar inserção de agendamento
    console.log('[TEST-DB] Testando inserção de agendamento...');
    const testData = {
      dataHora: new Date().toISOString(),
      status: 'TESTE',
      userId: 1,
      motivoConsulta: 'Teste de estrutura',
    };
    
    const { data: testAgendamento, error: testError } = await supabase
      .from('Agendamento')
      .insert([testData])
      .select()
      .single();
    
    if (testError) {
      console.error('[TEST-DB] Erro ao inserir agendamento de teste:', testError);
      return NextResponse.json({ 
        error: 'Erro ao inserir agendamento de teste', 
        details: testError,
        testData 
      }, { status: 500 });
    }
    
    console.log('[TEST-DB] Inserção de agendamento OK:', testAgendamento);
    
    // Limpar agendamento de teste
    await supabase
      .from('Agendamento')
      .delete()
      .eq('id', testAgendamento.id);
    
    return NextResponse.json({ 
      message: 'Estrutura do banco OK',
      tables: {
        User: users.length > 0 ? Object.keys(users[0]) : [],
        BookableSlot: slots.length > 0 ? Object.keys(slots[0]) : [],
        Agendamento: agendamentos.length > 0 ? Object.keys(agendamentos[0]) : [],
      }
    });
    
  } catch (error) {
    console.error('[TEST-DB] Erro geral:', error);
    return NextResponse.json({ error: 'Erro geral no teste', details: error }, { status: 500 });
  }
} 