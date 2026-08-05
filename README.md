<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=10b981&height=160&section=header&text=Agendamento%20Psicologia&fontSize=35&fontColor=ffffff&fontAlignY=45" />
</div>

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

**Sistema de agendamento online para profissionais de saúde, com portal do paciente, faturamento, relatórios e assinatura digital de documentos.**

</div>

---

## ✨ Destaques

- 📅 **Agendamento completo** — disponibilidade configurável, bloqueio de horários, sincronização com Google Calendar.
- 💳 **Faturamento** — geração de faturas a partir de consultas realizadas, acompanhamento de status e PDF para download.
- 📊 **Relatórios** — visão mensal e anual de produtividade e faturamento, com gráficos.
- ✍️ **Assinatura digital** — envio de documentos (termos, autorizações) com link único e assinatura por canvas, sem depender de serviços de terceiros.
- 🔔 **Notificações + Auditoria** — sino de notificações para paciente/admin e histórico auditável de ações administrativas.
- ✅ **Validação Rigorosa** — Zod em todas as camadas de entrada de dados.
- 🛡️ **Type-Safe** — TypeScript estrito de ponta a ponta.

## 💡 Por que este projeto?

O objetivo foi resolver uma dor real de profissionais de saúde: a gestão de agenda, cobrança e documentação de pacientes em um único lugar, sem depender de várias ferramentas soltas. É a versão pública e simplificada de um sistema em produção para uma clínica real — com os dados e integrações específicas do negócio removidos, mas a arquitetura e as funcionalidades centrais mantidas.

## 🛠️ Tecnologias

- **Next.js 14 (App Router) / React** — framework e componentes.
- **NextAuth** — autenticação (credenciais + Google).
- **Prisma + Supabase (PostgreSQL)** — schema versionado via Prisma Migrate, consultas via cliente Supabase.
- **Zod / React Hook Form** — validação e formulários.
- **@react-pdf/renderer** — geração de faturas em PDF.
- **Recharts** — gráficos dos relatórios.
- **Tailwind CSS** — estilização.
- **date-fns** — manipulação de datas.

## 🚀 Roadmap

- [ ] **WhatsApp Reminders:** envio automático de lembretes para evitar faltas.
- [ ] **Telemedicina:** integração com vídeo-chamada nativa.
- [ ] **Multi-profissional:** suporte a mais de um profissional na mesma conta, com agendas independentes.
- [ ] **2FA no painel admin.**

---

<div align="center">

Desenvolvido por **[Igor Santos](https://github.com/MysterySalsicha)** · Full Stack Developer

</div>
