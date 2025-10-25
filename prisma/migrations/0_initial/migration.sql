-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "dataNascimento" TIMESTAMPTZ(6) NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "passwordResetToken" TEXT,
    "googleId" TEXT,
    "currentSessionId" TEXT,
    "image" TEXT,
    "address" TEXT,
    "emailVerified" TIMESTAMP(6),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agendamento" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" INTEGER NOT NULL,
    "dataHora" TIMESTAMPTZ(6) NOT NULL,
    "status" TEXT NOT NULL,
    "motivoConsulta" TEXT NOT NULL,
    "googleCalendarEventId" TEXT,

    CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookableSlot" (
    "id" SERIAL NOT NULL,
    "dataHora" TIMESTAMPTZ(6) NOT NULL,
    "disponivel" BOOLEAN NOT NULL,
    "userId" INTEGER,
    "agendamentoId" UUID,

    CONSTRAINT "BookableSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HorarioAtuacao" (
    "id" SERIAL NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "diaDaSemana" INTEGER NOT NULL DEFAULT 0,
    "almocoInicio" TEXT,
    "almocoFim" TEXT,

    CONSTRAINT "HorarioAtuacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HorarioBloqueado" (
    "id" SERIAL NOT NULL,
    "dataHoraInicio" TIMESTAMPTZ(6) NOT NULL,
    "dataHoraFim" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "HorarioBloqueado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisponibilidadeDiaria" (
    "id" SERIAL NOT NULL,
    "data" DATE NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "almocoInicio" TEXT,
    "almocoFim" TEXT,

    CONSTRAINT "DisponibilidadeDiaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prontuario" (
    "id" SERIAL NOT NULL,
    "agendamentoId" UUID NOT NULL,
    "texto" TEXT NOT NULL,

    CONSTRAINT "Prontuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recomendacao" (
    "id" SERIAL NOT NULL,
    "agendamentoId" UUID NOT NULL,
    "texto" TEXT NOT NULL,

    CONSTRAINT "Recomendacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "DisponibilidadeDiaria_data_key" ON "DisponibilidadeDiaria"("data");

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookableSlot" ADD CONSTRAINT "BookableSlot_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookableSlot" ADD CONSTRAINT "BookableSlot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Prontuario" ADD CONSTRAINT "Prontuario_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Recomendacao" ADD CONSTRAINT "Recomendacao_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

