/*
  Warnings:

  - You are about to drop the `Appointment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Appointment" DROP CONSTRAINT "Appointment_bookableSlotId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Appointment" DROP CONSTRAINT "Appointment_patientId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastLogin" SET DATA TYPE TIMESTAMPTZ(6);

-- DropTable
DROP TABLE "public"."Appointment";

-- CreateTable
CREATE TABLE "Agendamento" (
    "id" UUID NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "protocolCode" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "bookableSlotId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agendamento_protocolCode_key" ON "Agendamento"("protocolCode");

-- CreateIndex
CREATE UNIQUE INDEX "Agendamento_bookableSlotId_key" ON "Agendamento"("bookableSlotId");

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_bookableSlotId_fkey" FOREIGN KEY ("bookableSlotId") REFERENCES "BookableSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
