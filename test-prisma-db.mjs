import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testPrismaConnection() {
  try {
    console.log('Tentando conectar ao banco de dados via Prisma...');
    console.log(`(Usando DATABASE_URL que termina com: ...${process.env.DATABASE_URL?.slice(-40)})`);

    await prisma.$connect();
    console.log('\x1b[32m%s\x1b[0m', '✅ Conexão com o banco de dados via Prisma bem-sucedida!');

    // Opcional: tentar uma query simples para confirmar
    const userCount = await prisma.user.count();
    console.log(`Número de usuários existentes: ${userCount}`);

  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Erro ao conectar ao banco de dados via Prisma:');
    console.error(err.message);
    console.log('\n--- Dicas para resolver ---');
    console.log('1. Verifique se a senha na variável DATABASE_URL está correta.');
    console('2. Verifique se o IP do seu computador está liberado para acesso no painel do Supabase (Database > Network Restrictions).');
    console.log('3. Verifique se o seu projeto Supabase não está pausado.');
    console.log('4. Certifique-se de que a DATABASE_URL está usando o pooler do Supabase (porta 6543).');
  } finally {
    await prisma.$disconnect();
    console.log('Conexão Prisma fechada.');
  }
}

testPrismaConnection();
