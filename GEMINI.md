# Guia do Projeto para Gemini CLI

Este documento serve como um guia de alto nível para o agente Gemini CLI, fornecendo contexto sobre a arquitetura, tecnologias, convenções e objetivos do projeto "PsicologaAgendamento".

## 1. Visão Geral do Projeto

**Nome:** PsicologaAgendamento
**Objetivo:** Sistema de agendamento online para uma psicóloga, permitindo que pacientes marquem, gerenciem e visualizem suas consultas, enquanto a profissional gerencia sua agenda, pacientes, prontuários e disponibilidade.

**Funcionalidades Principais:**
*   **Portal do Paciente:** Cadastro, login, agendamento de consulta, cancelamento de consulta, remarcar consulta, visualização de agendamentos futuros/recomendados pelas doutora e agendamentos passados, acesso a recomendações passadas pela propria doutora, atualização de perfil.
*   **Painel Administrativo (Psicóloga):** visualização de agendamentos (confirmar, cancelar), gestão de pacientes (cadastro, prontuários), gestão de disponibilidade (horários padrão, bloqueios, geração de slots).
*   **Autenticação:** Login/cadastro via credenciais (email/CPF) e Google.
*   **Notificações:** Integração com e-mail (Nodemailer) e potencial para WhatsApp (Twilio).
*   **Sincronização:** Integração com Google Calendar para agendamentos.

## 2. Tecnologias Chave

*   **Framework:** Next.js (v14.2.3)
*   **Linguagem:** TypeScript
*   **Estilização:** Tailwind CSS
*   **ORM/Banco de Dados:** Prisma ORM (SQLite para desenvolvimento, configurável para produção)
*   **Autenticação:** NextAuth.js
*   **Validação de Formulários:** React Hook Form + Zod
*   **Manipulação de Datas:** `date-fns`
*   **Ícones:** `lucide-react`
*   **Testes:** Vitest, `@testing-library/react`, `jsdom`

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