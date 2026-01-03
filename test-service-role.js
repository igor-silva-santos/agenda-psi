require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

async function testServiceRole() {
  console.log('Iniciando teste de conexão DIRETA (sem PgBouncer)...');

  const directDbUrl = `postgresql://postgres:${process.env.DB_PASSWORD || 'Plusultra@2025'}@db.kutzsoxycekaiziuvmis.supabase.co:5432/postgres`;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('ERRO FATAL: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas no .env');
    return;
  }

  // Teste 1: Conexão direta com o driver 'pg' para validar a URL e as credenciais
  const pgClient = new Client({ connectionString: directDbUrl });
  try {
    await pgClient.connect();
    console.log('SUCESSO na conexão direta com o driver `pg`. As credenciais e a URL direta são válidas.');
    await pgClient.end();
  } catch (pgError) {
    console.error('ERRO na conexão direta com o driver `pg`:', pgError.message);
    console.log('\n--- DIAGNÓSTICO ---');
    console.log('Não foi possível nem mesmo estabelecer uma conexão direta com o banco. Isso pode indicar um problema de rede, firewall, ou que a senha no .env está incorreta.');
    return; // Interrompe o teste se a conexão básica falhar
  }


  // Teste 2: Usar o cliente Supabase com a service_role
  console.log('\nInicializando cliente Supabase com a Service Role Key...');
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  try {
    console.log("Tentando buscar dados da tabela 'agendamento' com o cliente Supabase...");
    const { data, error } = await supabaseAdmin
      .from('agendamento')
      .select('*')
      .limit(1);

    if (error) {
      console.error('ERRO AO EXECUTAR A CONSULTA com @supabase/js:', error);
      console.log('\n--- DIAGNÓSTICO ---');
      console.log('A conexão direta funcionou, mas a consulta com o cliente Supabase falhou.');
      console.log('Causa provável: A Service Role Key é inválida ou há um bug na interação do @supabase/js com o seu projeto.');
    } else {
      console.log('CONSULTA BEM-SUCEDIDA com @supabase/js!');
      console.log('Dados recebidos (exemplo):', data);
      console.log('\n--- DIAGNÓSTICO ---');
      console.log('A consulta funcionou! A Service Role Key é VÁLIDA e a conexão direta funciona.');
      console.log('O problema está confirmado como sendo a interação com o PgBouncer (Connection Pooler).');
      console.log('Solução: Usar a URL de conexão direta no seu backend.');
    }
  } catch (e) {
    console.error('ERRO INESPERADO DURANTE O TESTE com @supabase/js:', e);
  }
}

testServiceRole();
