-- CreateTable
CREATE TABLE "HorarioAtuacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "diaDaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "almocoInicio" TEXT,
    "almocoFim" TEXT
);
