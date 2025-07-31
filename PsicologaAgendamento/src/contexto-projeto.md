# Contexto do Projeto: PsicologaAgendamento

## Visão Geral
Sistema de agendamento online para psicóloga, permitindo que pacientes marquem, gerenciem e visualizem consultas, enquanto a profissional gerencia agenda, pacientes, prontuários e disponibilidade.

---

## Funcionalidades Principais
- **Portal do Paciente:** Cadastro, login, agendamento, cancelamento, remarcar, visualizar agendamentos futuros/passados, recomendações, atualização de perfil.
- **Painel Administrativo:** Visualização e gestão de agendamentos, pacientes, prontuários, horários padrão, bloqueios, geração de slots, usuários admin.
- **Autenticação:** Login/cadastro via email/CPF e Google (NextAuth.js).
- **Notificações:** E-mail (Nodemailer) e potencial WhatsApp (Twilio).
- **Sincronização:** Google Calendar para agendamentos.

---

## Estrutura de Diretórios
- `src/app/` - Páginas (Next.js App Router) e rotas de API.
  - `admin/` - Painel administrativo.
  - `auth/` - Autenticação (login, signup, reset password).
  - `portal/` - Portal do paciente.
  - `api/` - Rotas backend (admin, agendamento, auth, portal, bookable-slots, etc).
- `src/components/` - Componentes React reutilizáveis (formulários, botões, modais, etc).
- `src/lib/` - Funções utilitárias, configurações (Prisma, NextAuth, email, etc).
- `prisma/` - Esquema do banco de dados e migrações.
- `public/` - Arquivos estáticos.
- `arquivos/` - Documentação do projeto.

---

## Fluxos Principais
### 1. Autenticação
- NextAuth.js: credenciais (email/senha ou CPF/senha) e Google OAuth.
- Redirecionamento por role: ADMIN → /admin, PACIENTE → /portal/paciente.
- Middleware (`src/middleware.ts`) protege rotas por role.

### 2. Agendamento
- Paciente seleciona data/hora disponível.
- Validação de dados (React Hook Form + Zod).
- Criação de usuário se novo, ou uso de usuário existente.
- Criação do agendamento e marcação do slot como ocupado.
- Envio de e-mail de confirmação.
- Integração com Google Calendar.

### 3. Portal do Paciente
- Dashboard com próximas consultas, histórico, recomendações, perfil.
- Cancelamento/confirmação de consultas.
- Visualização de recomendações da psicóloga.

### 4. Painel Administrativo
- Gerenciamento de agendamentos (filtros, status, ações).
- Gerenciamento de disponibilidade (dias, horários, bloqueios).
- Gerenciamento de pacientes (prontuário, recomendações).
- Gerenciamento de usuários admin.

---

## Tecnologias
- **Frontend:** Next.js 14+, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, Prisma ORM (SQLite dev, configurável para produção)
- **Autenticação:** NextAuth.js
- **Validação:** React Hook Form + Zod
- **E-mail:** Nodemailer
- **Datas:** date-fns
- **Testes:** Vitest, Testing Library

---

## Pontos de Atenção
- Middleware de rate limiting é apenas para dev, não usar em produção sem Redis/Upstash.
- Segurança: tokens temporários para redefinição de senha, bcrypt para senhas.
- Validação robusta de dados em todos os formulários.
- UI/UX prioriza clareza, responsividade e feedback visual.
- Sempre verificar role do usuário antes de liberar acesso a rotas sensíveis.

---

## Como usar este arquivo
- Consulte este arquivo sempre que precisar relembrar fluxos, estrutura, decisões ou pontos críticos do sistema.
- Atualize este arquivo ao implementar novas features ou alterar fluxos importantes.

---

*Este arquivo é mantido pelo assistente de IA para garantir contexto e acelerar o desenvolvimento e debug do projeto.* 