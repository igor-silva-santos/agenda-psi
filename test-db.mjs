import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  console.error('Erro: A variável de ambiente DIRECT_URL não foi encontrada no arquivo .env');
  process.exit(1);
}

console.log('Tentando conectar ao banco de dados...');
console.log(`(Usando a URL que termina com: ...${connectionString.slice(-40)})`);

const client = new Client({
  connectionString,
});

async function testConnection() {
  try {
    await client.connect();
    console.log('\x1b[32m%s\x1b[0m', '✅ Conexão com o banco de dados bem-sucedida!');
    const res = await client.query('SELECT NOW()');
    console.log('Horário atual do banco de dados:', res.rows[0].now);
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Erro ao conectar ao banco de dados:');
    console.error(err.message);
    console.log('\n--- Dicas para resolver ---');
    console.log('1. Verifique se a senha na variável DIRECT_URL está correta.');
    console.log('2. Verifique se o IP do seu computador está liberado para acesso no painel do Supabase (Database > Network Restrictions).');
    console.log('3. Verifique se o seu projeto Supabase não está pausado.');
  } finally {
    await client.end();
    console.log('Conexão fechada.');
  }
}

testConnection();
