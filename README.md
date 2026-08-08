# AgendaPsi

Agenda + portal do paciente + faturamento PDF + assinatura digital para consultórios de psicologia.

**Demo canônica:** https://jandira-frederick.vercel.app  
**Alias histórico:** `https://psicologa-agendamento.vercel.app` (redireciona para a demo acima)  
**Código:** https://github.com/igor-silva-santos/agenda-psi

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js + TypeScript |
| Dados | Prisma + Supabase (PostgreSQL) |
| Forms | Zod + React Hook Form |
| PDF | `@react-pdf/renderer` |
| Testes | Cypress |
| UI | Tailwind CSS + Recharts |

## Destaques

- Agendamento com disponibilidade e bloqueios
- Portal do paciente
- Faturamento com PDF
- Assinatura digital de documentos
- Relatórios e notificações administrativas

## Como rodar

```bash
npm install
cp .env.example .env.local
# preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

## Deploy (Vercel)

O projeto na Vercel precisa das variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (e demais secrets de runtime). Sem elas o build/runtime pode falhar.

---

Desenvolvido por [Igor Santos](https://github.com/igor-silva-santos)
