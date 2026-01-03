require('dotenv').config();
const { Client } = require('pg');

async function checkDbPermissions() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('A variável de ambiente DATABASE_URL não está definida.');
    return;
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Conectado ao banco de dados com sucesso.');

    // Query 1: Get current user and session user
    const userRes = await client.query('SELECT current_user, session_user;');
    console.log('Usuário da conexão:', userRes.rows);

    // Query 2: Get owner of the public schema
    const schemaRes = await client.query("SELECT nspname, pg_get_userbyid(nspowner) as owner FROM pg_namespace WHERE nspname = 'public';");
    console.log("Proprietário do schema 'public':", schemaRes.rows);

  } catch (err) {
    console.error('Erro ao conectar ou executar a query:', err);
  } finally {
    await client.end();
    console.log('Conexão com o banco de dados fechada.');
  }
}

checkDbPermissions();
