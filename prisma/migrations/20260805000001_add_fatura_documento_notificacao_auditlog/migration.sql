-- CreateEnum
CREATE TYPE "StatusFatura" AS ENUM ('RASCUNHO', 'PENDENTE', 'PAGO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoNotificacao" AS ENUM ('FINANCEIRO', 'RECOMENDACAO', 'DOCUMENTO', 'SISTEMA');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "valorConsulta" DOUBLE PRECISION DEFAULT 150;

-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN "faturaId" TEXT;

-- CreateTable
CREATE TABLE "Fatura" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "StatusFatura" NOT NULL DEFAULT 'PENDENTE',
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "quantidadeConsultas" INTEGER,
    "itens" JSONB NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "linkRedirecionamento" TEXT,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT,
    "descricao" TEXT NOT NULL,
    "dadosAntes" JSONB,
    "dadosDepois" JSONB,
    "autorId" TEXT,
    "autorNome" TEXT,
    "autorTipo" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "conteudoHtml" TEXT NOT NULL,
    "assinado" BOOLEAN NOT NULL DEFAULT false,
    "assinadoEm" TIMESTAMP(3),
    "ipAssinatura" TEXT,
    "cpfConfirmado" TEXT,
    "imagemAssinatura" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Fatura_userId_idx" ON "Fatura"("userId");
CREATE INDEX "Fatura_status_idx" ON "Fatura"("status");
CREATE INDEX "Agendamento_faturaId_idx" ON "Agendamento"("faturaId");
CREATE INDEX "Notificacao_userId_idx" ON "Notificacao"("userId");
CREATE INDEX "Notificacao_lida_idx" ON "Notificacao"("lida");
CREATE INDEX "AuditLog_entidade_idx" ON "AuditLog"("entidade");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_autorId_idx" ON "AuditLog"("autorId");
CREATE UNIQUE INDEX "Documento_token_key" ON "Documento"("token");
CREATE INDEX "Documento_userId_idx" ON "Documento"("userId");
CREATE INDEX "Documento_assinado_idx" ON "Documento"("assinado");

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "Fatura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fatura" ADD CONSTRAINT "Fatura_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
