import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const diasUteis = [1, 2, 3, 4, 5]; // Segunda a sexta
  const horarios = diasUteis.map(dia => ({
    diaDaSemana: dia,
    horaInicio: '08:00',
    horaFim: '18:00',
    almocoInicio: '12:00',
    almocoFim: '13:00',
  }));
  await prisma.horarioAtuacao.createMany({ data: horarios });
  console.log('Horários de atuação criados!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 