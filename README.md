# AgendaPsi

SaaS de agenda, portal do paciente e gestão para consultórios de psicologia — showcase de portfólio.

**Demo:** https://psicologa-agendamento.vercel.app  
**Código:** https://github.com/igor-silva-santos/agenda-psi

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 14 + TypeScript |
| Dados | Prisma + Supabase (PostgreSQL) — opcional na demo |
| Auth | NextAuth mock + cookie `agendapsi-demo-role` |
| Forms | Zod + React Hook Form |
| PDF | `@react-pdf/renderer` |
| UI | Tailwind + Lucide + anime.js |
| Testes | Cypress |

## Demo sem backend

Na página `/conta/login`:

- **Entrar como Paciente** → `/portal/paciente`
- **Entrar como Admin** → `/admin`

Qualquer e-mail/senha no formulário também entra (sem validação real). Os portais usam fixtures mock se as APIs estiverem indisponíveis.

## Destaques

- Agendamento com disponibilidade e bloqueios
- Portal do paciente
- Faturamento com PDF
- Assinatura digital de documentos
- Relatórios e auditoria administrativa

## Como rodar

```bash
npm install
cp .env.example .env.local
# opcional: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Abra http://localhost:3000 e use os botões de login demo.

## Deploy (Vercel)

Variáveis úteis (não obrigatórias para a vitrine mock):

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (se quiser APIs reais)

---

Desenvolvido por [Igor Santos](https://github.com/igor-silva-santos)
