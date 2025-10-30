/*
  Warnings:

  - The primary key for the `BookableSlot` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Agendamento` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[agendamentoId]` on the table `BookableSlot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[agendamentoId]` on the table `Prontuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[agendamentoId]` on the table `Recomendacao` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Agendamento" DROP CONSTRAINT "Agendamento_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookableSlot" DROP CONSTRAINT "BookableSlot_agendamentoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Prontuario" DROP CONSTRAINT "Prontuario_agendamentoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Recomendacao" DROP CONSTRAINT "Recomendacao_agendamentoId_fkey";

-- AlterTable
ALTER TABLE "BookableSlot" DROP CONSTRAINT "BookableSlot_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "agendamentoId" SET DATA TYPE TEXT,
ADD CONSTRAINT "BookableSlot_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BookableSlot_id_seq";

-- AlterTable
ALTER TABLE "Prontuario" ALTER COLUMN "agendamentoId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Recomendacao" ALTER COLUMN "agendamentoId" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "public"."Agendamento";

-- CreateTable
CREATE TABLE "Appointment" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "protocolCode" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "bookableSlotId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_protocolCode_key" ON "Appointment"("protocolCode");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_bookableSlotId_key" ON "Appointment"("bookableSlotId");

-- CreateIndex
CREATE UNIQUE INDEX "BookableSlot_agendamentoId_key" ON "BookableSlot"("agendamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "Prontuario_agendamentoId_key" ON "Prontuario"("agendamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "Recomendacao_agendamentoId_key" ON "Recomendacao"("agendamentoId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_bookableSlotId_fkey" FOREIGN KEY ("bookableSlotId") REFERENCES "BookableSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
