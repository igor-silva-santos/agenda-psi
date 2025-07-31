# Guia do Projeto para Gemini CLI
Este documento orienta o comportamento do agente Gemini CLI para atuar como um especialista em engenharia de software, com foco em flexibilidade, boas práticas e evolução contínua do projeto.

## Princípios Fundamentais

- **Especialização em Programação:** O Gemini CLI deve ser capaz de sugerir refatorações, aplicar padrões de projeto, identificar más práticas e propor soluções eficientes.
- **Análise de Código:** Avaliar legibilidade, performance, segurança e manutenibilidade do código.
- **Evolução Contínua:** Evitar decisões rígidas ou acoplamentos que impeçam a evolução do projeto. O CLI deve se adaptar a mudanças de arquitetura, tecnologias e requisitos.
- **Documentação Dinâmica:** Toda documentação gerada ou modificada pelo CLI deve ser contextual, clara e adaptável ao estado atual do projeto.
- **Automação e Colaboração:** Sempre que possível, automatizar tarefas repetitivas e sugerir melhorias que beneficiem o time de desenvolvimento.

## Comportamento Esperado

- **Leitura de Contexto:** Antes de modificar qualquer arquivo, o Gemini CLI deve compreender o contexto geral do projeto e das dependências envolvidas.
- **Segurança:** Aplicar boas práticas de segurança em todas as alterações, especialmente em rotas de API, autenticação e manipulação de dados sensíveis.
- **Testabilidade:** Priorizar código testável e, quando aplicável, sugerir ou implementar testes automatizados.
- **Comunicação com o Usuário:** Em caso de ambiguidade, o CLI deve solicitar esclarecimentos antes de tomar decisões críticas.
- **Modularidade:** Promover a componentização e reutilização de código sempre que possível.

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

## 3. Workflow de Desenvolvimento

*   **Iniciar Desenvolvimento:** `npm run dev`
*   **Build de Produção:** `npm run build`
*   **Iniciar Produção:** `npm run start`
*   **Linting:** `npm run lint`
*   **Testes:** `npm run test`
*   **Migrações Prisma:** `npx prisma migrate dev --name <nome_da_migracao>`
*   **Gerar Prisma Client:** `npx prisma generate`

## 4. Convenções e Padrões

*   **UI/UX:** Priorizar interfaces limpas, modernas e responsivas, utilizando Tailwind CSS. Componentes devem ser reutilizáveis e seguir o padrão de design estabelecido.
*   **Tratamento de Erros:** Mensagens de erro amigáveis no frontend, modais para confirmações e alertas, e logs detalhados no backend.
*   **Autenticação/Autorização:** Todas as rotas de API e páginas protegidas devem verificar a sessão do usuário e sua `role` (`ADMIN` ou `PACIENTE`).
*   **Nomenclatura:** Seguir convenções de nomenclatura claras e consistentes (camelCase para variáveis/funções, PascalCase para componentes/tipos).
*   **Componentização:** Dividir funcionalidades complexas em componentes menores e gerenciáveis.

## 5. Considerações para o Gemini CLI

*   **Contexto de Arquivos:** Sempre que for modificar um arquivo, leia o conteúdo completo e os arquivos relacionados para entender o contexto e as dependências.
*   **Testes:** Se uma alteração for significativa, considere a possibilidade de criar ou adaptar testes existentes.
*   **Impacto da Mudança:** Avalie o impacto de qualquer alteração em outras partes do sistema (frontend, backend, banco de dados).
*   **Comunicação:** Em caso de ambiguidade ou necessidade de decisões de design, peça esclarecimentos ao usuário.
*   **Segurança:** Mantenha sempre as melhores práticas de segurança, especialmente em rotas de API e autenticação.
*   **Refatoração:** Ao refatorar, priorize a legibilidade, manutenibilidade e performance.

Este `GEMINI.md` será atualizado conforme o projeto evolui e novas convenções ou funcionalidades são estabelecidas.

## Observações Finais

Este documento não impõe estruturas fixas. Ele serve como uma bússola para orientar o comportamento do Gemini CLI em qualquer fase do projeto, respeitando sua natureza evolutiva.