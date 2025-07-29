# Guia do Projeto para Gemini CLI

Este documento serve como um guia de alto nível para o agente Gemini CLI, fornecendo contexto sobre a arquitetura, tecnologias, convenções e objetivos do projeto "PsicologaAgendamento".

## 1. Visão Geral do Projeto

**Nome:** PsicologaAgendamento
**Objetivo:** Sistema de agendamento online para uma psicóloga, permitindo que pacientes marquem, gerenciem e visualizem suas consultas, enquanto a profissional gerencia sua agenda, pacientes, prontuários e disponibilidade.

**Tecnologias Principais:**
- **Frontend:** Next.js 14.2.3, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase Client
- **Autenticação:** NextAuth.js (Credentials + Google OAuth)
- **Banco de Dados:** Supabase (PostgreSQL)
- **Validação:** React Hook Form + Zod
- **Testes:** Vitest, @testing-library/react
- **Deploy:** Vercel

## 2. Funcionalidades por Portal

### 🏥 **Portal do Paciente** (`/portal/paciente/`)

#### **Dashboard Principal** (`/portal/paciente/`)
- **Visão geral:** Estatísticas de consultas, próximo agendamento, ações rápidas
- **Cards informativos:** Total de consultas, consultas confirmadas, próximas consultas
- **Ações rápidas:** Agendar nova consulta, ver recomendações, editar perfil
- **Atividade recente:** Lista das últimas atividades do paciente

#### **Agendamentos** (`/portal/paciente/agendamentos/`)
- **Calendário interativo:** Visualização mensal com indicadores de consultas
- **Filtros avançados:** Por status, data, motivo da consulta
- **Lista de consultas:** Próximas consultas e histórico
- **Ações por consulta:** Confirmar, cancelar, ver detalhes
- **Status das consultas:** PRE_AGENDADO, CONFIRMADO, CANCELADO
- **Responsividade:** Layout adaptável para mobile e desktop

#### **Perfil** (`/portal/paciente/perfil/`)
- **Informações pessoais:** Nome, email, CPF, telefone, data de nascimento
- **Foto do perfil:** Upload e gerenciamento de foto
- **Preferências:** Configurações de notificação e comunicação
- **Atividade recente:** Log de ações realizadas
- **Estatísticas:** Resumo de uso do sistema

#### **Recomendações** (`/portal/paciente/recomendacoes/`)
- **Lista de recomendações:** Todas as recomendações da psicóloga
- **Filtros:** Por data, busca por texto
- **Estatísticas:** Total, recentes, média de caracteres, última recomendação
- **Cards informativos:** Data, motivo da consulta, recomendação completa
- **Design responsivo:** Layout moderno e adaptável

### 👩‍⚕️ **Portal Administrativo** (`/admin/`)

#### **Dashboard Administrativo** (`/admin/`)
- **Visão geral:** Estatísticas de agendamentos, pacientes, disponibilidade
- **Cards informativos:** Total de pacientes, agendamentos pendentes, horários disponíveis
- **Ações rápidas:** Gerenciar agendamentos, pacientes, disponibilidade
- **Atividade recente:** Últimas ações administrativas

#### **Gestão de Agendamentos** (`/admin/agendamentos/`)
- **Lista de agendamentos:** Todos os agendamentos do sistema
- **Filtros avançados:** Por paciente, data, status, psicóloga
- **Ações por agendamento:** Confirmar, cancelar, editar, ver detalhes
- **Status management:** PRE_AGENDADO, CONFIRMADO, CANCELADO
- **Integração Google Calendar:** Sincronização automática de eventos
- **Responsividade:** Layout adaptável para diferentes telas

#### **Gestão de Pacientes** (`/admin/pacientes/`)
- **Lista de pacientes:** Todos os pacientes cadastrados
- **Busca e filtros:** Por nome, email, CPF
- **Detalhes do paciente:** Informações completas, histórico de consultas
- **Prontuários:** Criação e edição de prontuários médicos
- **Recomendações:** Adicionar recomendações para cada paciente
- **Ações:** Editar, desativar, ver histórico completo

#### **Gestão de Disponibilidade** (`/admin/disponibilidade/`)
- **Horários de Atuação:** Definir horários padrão de trabalho
- **Horários Bloqueados:** Marcar períodos indisponíveis
- **Disponibilidade Diária:** Configurar disponibilidade específica por dia
- **Geração de Slots:** Criar horários agendáveis automaticamente
- **Visualização:** Calendário com horários disponíveis e bloqueados
- **Integração:** Sincronização com Google Calendar

#### **Gestão de Administradores** (`/admin/administradores/`)
- **Lista de administradores:** Todos os usuários ADMIN
- **Criação de usuários:** Adicionar novos administradores
- **Gerenciamento de roles:** ADMIN, PACIENTE
- **Controle de acesso:** Permissões e sessões
- **Segurança:** Validação de sessões e roles

### 🔐 **Sistema de Autenticação**

#### **Login/Cadastro** (`/auth/`)
- **Login por credenciais:** Email/CPF + senha
- **Login Google:** OAuth 2.0 com Google
- **Cadastro de pacientes:** Formulário completo de registro
- **Recuperação de senha:** Esqueci minha senha + reset
- **Validação:** Zod schemas para todos os formulários
- **Segurança:** bcryptjs para hash de senhas

#### **Sessões e Segurança**
- **Session management:** NextAuth.js com sessionId único
- **Role-based access:** ADMIN e PACIENTE
- **Middleware:** Proteção de rotas por role
- **Inactivity logout:** Logout automático por inatividade
- **Concurrent sessions:** Detecção de sessões concorrentes

### 📅 **Sistema de Agendamento**

#### **Agendamento de Consultas**
- **Modal de agendamento:** Interface moderna e responsiva
- **Calendário interativo:** Seleção de data com visualização clara
- **Seleção de horários:** Grid de horários disponíveis
- **Formulário de dados:** Nome, email, CPF, telefone, motivo
- **Validação em tempo real:** Feedback imediato de erros
- **Confirmação:** Resumo antes de confirmar agendamento

#### **Gestão de Horários**
- **Bookable Slots:** Horários disponíveis para agendamento
- **Geração automática:** Baseada em horários de atuação
- **Verificação de disponibilidade:** Checagem em tempo real
- **Integração Google Calendar:** Sincronização bidirecional
- **Responsividade:** Adaptação para mobile e desktop

### 📧 **Sistema de Notificações**

#### **Email (Nodemailer)**
- **Confirmação de agendamento:** Email para paciente e psicóloga
- **Lembretes:** Notificações antes da consulta
- **Cancelamentos:** Confirmação de cancelamento
- **Templates:** HTML responsivo e profissional

#### **WhatsApp (Twilio)**
- **Notificações SMS:** Lembretes e confirmações
- **Integração:** API Twilio para envio
- **Templates:** Mensagens personalizadas

### 🔄 **Integrações Externas**

#### **Google Calendar**
- **Sincronização automática:** Eventos criados automaticamente
- **Configuração:** OAuth 2.0 com Google APIs
- **Eventos:** Consultas confirmadas sincronizadas
- **Teste de conexão:** Endpoint para verificar integração

#### **Supabase**
- **Banco de dados:** PostgreSQL em nuvem
- **Autenticação:** Row Level Security (RLS)
- **Real-time:** Subscriptions para atualizações
- **Backup:** Automático e seguro

## 3. Tecnologias Chave

*   **Framework:** Next.js (v14.2.3)
*   **Linguagem:** TypeScript
*   **Estilização:** Tailwind CSS
*   **ORM/Banco de Dados:** Prisma ORM (SQLite para desenvolvimento, configurável para produção)
*   **Autenticação:** NextAuth.js
*   **Validação de Formulários:** React Hook Form + Zod
*   **Manipulação de Datas:** `date-fns`
*   **Ícones:** `lucide-react`
*   **Testes:** Vitest, `@testing-library/react`, `jsdom` (com `customRender` para `SessionProvider` e mocks de `useRouter`)
*   **Análise de Segurança:** `eslint-plugin-security`
*   **Hooks de Pré-commit:** `husky`, `lint-staged`

## 3. Estrutura de Diretórios Importantes

*   `src/app/`: Contém as páginas (Next.js App Router) e rotas de API.
    *   `src/app/admin/`: Páginas do painel administrativo.
        *   `src/app/admin/agendamentos/`: Gestão de agendamentos.
        *   `src/app/admin/disponibilidade/`: Gestão de horários e bloqueios.
        *   `src/app/admin/pacientes/`: Gestão de usuários com role `PACIENTE`.
        *   `src/app/admin/administradores/`: Gestão de usuários com role `ADMIN`.
    *   `src/app/api/`: Rotas de API (backend).
        *   `src/app/api/admin/`: APIs para o painel administrativo.
        *   `src/app/api/auth/`: APIs de autenticação (NextAuth).
    *   `src/app/portal/`: Páginas do portal do paciente.
*   `src/components/`: Componentes React reutilizáveis.
*   `src/lib/`: Funções utilitárias, configurações (Prisma client, NextAuth config, email, etc.).
*   `prisma/`: Esquema do banco de dados (`schema.prisma`) e migrações.
*   `public/`: Ativos estáticos.
*   `arquivos/`: Documentação do projeto.

## 4. Workflow de Desenvolvimento

*   **Iniciar Desenvolvimento:** `npm run dev`
*   **Build de Produção:** `npm run build`
*   **Iniciar Produção:** `npm run start`
*   **Linting:** `npm run lint`
*   **Testes:** `npm run test`
*   **Migrações Prisma:** `npx prisma migrate dev --name <nome_da_migracao>`
*   **Gerar Prisma Client:** `npx prisma generate`

## 5. Convenções e Padrões

*   **UI/UX:** Priorizar interfaces limpas, modernas e responsivas, utilizando Tailwind CSS. Componentes devem ser reutilizáveis e seguir o padrão de design estabelecido.
*   **Tratamento de Erros:** Mensagens de erro amigáveis no frontend, modais para confirmações e alertas, e logs detalhados no backend.
*   **Autenticação/Autorização:** Todas as rotas de API e páginas protegidas devem verificar a sessão do usuário e sua `role` (`ADMIN` ou `PACIENTE`).
*   **Nomenclatura:** Seguir convenções de nomenclatura claras e consistentes (camelCase para variáveis/funções, PascalCase para componentes/tipos).
*   **Componentização:** Dividir funcionalidades complexas em componentes menores e gerenciáveis.

## 6. Considerações para o Gemini CLI

*   **Contexto de Arquivos:** Sempre que for modificar um arquivo, leia o conteúdo completo e os arquivos relacionados para entender o contexto e as dependências.
*   **Testes:** Se uma alteração for significativa, considere a possibilidade de criar ou adaptar testes existentes.
*   **Impacto da Mudança:** Avalie o impacto de qualquer alteração em outras partes do sistema (frontend, backend, banco de dados).
*   **Comunicação:** Em caso de ambiguidade ou necessidade de decisões de design, peça esclarecimentos ao usuário.
*   **Segurança:** Mantenha sempre as melhores práticas de segurança, especialmente em rotas de API e autenticação.
*   **Refatoração:** Ao refatorar, priorize a legibilidade, manutenibilidade e performance.

## 7. Estrutura Detalhada

### Componentes (`src/components/`)
- `AdminBookableSlotManager.tsx`: Gerencia os horários agendáveis.
- `AdminUserManagement.tsx`: Gerencia os usuários.
- `AgendamentoActions.tsx`: Ações para os agendamentos.
- `AgendamentoFormMelhorado.tsx`: Formulário de agendamento.
- `BookableSlotPicker.tsx`: Seletor de horários agendáveis.
- `CombinedLoginForm.tsx`: Formulário de login combinado.
- `GestaoCalendario.tsx`: Gerenciamento do calendário.
- `GestaoHorariosAtuacao.tsx`: Gerenciamento dos horários de atuação.
- `GestaoHorariosBloqueados.tsx`: Gerenciamento dos horários bloqueados.
- `LoginModal.tsx`: Modal de login.
- `Modal.tsx`: Componente de modal genérico.
- `ProntuarioForm.tsx`: Formulário de prontuário.
- `PsicologaInfo.tsx`: Informações da psicóloga.
- `RecomendacoesForm.tsx`: Formulário de recomendações.
- `ResetPasswordForm.tsx`: Formulário de reset de senha.
- `SignInButtons.tsx`: Botões de login.
- `SignInClientWrapper.tsx`: Wrapper para o cliente de login.
- `SignUpForm.tsx`: Formulário de cadastro.
- `SignUpModal.tsx`: Modal de cadastro.

### Páginas (`src/app/`)
- `admin/`:
  - `administradores/`: Página de gerenciamento de administradores.
  - `agendamentos/`: Página de gerenciamento de agendamentos.
  - `disponibilidade/`: Página de gerenciamento de disponibilidade.
  - `pacientes/`: Página de gerenciamento de pacientes.
- `auth/`:
  - `forgot-password/`: Página de esqueci minha senha.
  - `reset-password/`: Página de reset de senha.
  - `signin/`: Página de login.
  - `signup/`: Página de cadastro.
- `portal/`:
  - `paciente/`:
    - `agendamentos/`: Página de agendamentos do paciente.
    - `perfil/`: Página de perfil do paciente.
    - `recomendacoes/`: Página de recomendações do paciente.

### APIs (`src/app/api/`)
- `admin/`:
  - `agendamentos/`: API para gerenciamento de agendamentos.
  - `bookable-slots/`: API para gerenciamento de horários agendáveis.
  - `create-user/`: API para criação de usuários.
  - `disponibilidade-diaria/`: API para gerenciamento de disponibilidade diária.
  - `generate-bookable-slots/`: API para geração de horários agendáveis.
  - `horarios-atuacao/`: API para gerenciamento de horários de atuação.
  - `horarios-bloqueados/`: API para gerenciamento de horários bloqueados.
  - `pacientes/`: API para gerenciamento de pacientes.
  - `users/`: API para gerenciamento de usuários.
- `agendamento/`: API para agendamento.
- `agendamentos/`: API para agendamentos.
- `agendamentos-salvos/`: API para agendamentos salvos.
- `auth/`: API para autenticação.
- `availability/`: API para disponibilidade.
- `bookable-slots/`: API para horários agendáveis.
- `pacientes/`: API para pacientes.
- `portal/`: API para o portal do paciente.
- `whatsapp/`: API para o WhatsApp.

Este `GEMINI.md` será atualizado conforme o projeto evolui e novas convenções ou funcionalidades são estabelecidas.