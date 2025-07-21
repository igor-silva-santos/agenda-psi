-- CreateTable
CREATE TABLE "DisponibilidadeDiaria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "almocoInicio" TEXT,
    "almocoFim" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "DisponibilidadeDiaria_data_key" ON "DisponibilidadeDiaria"("data");
