# Sistema de Agendamento - Dra. Jandira Frederick

Sistema completo de agendamento de consultas para psicóloga, desenvolvido em Next.js com integração ao Google Calendar e notificações WhatsApp.

## 🚀 Funcionalidades Implementadas

### 1. Área Inicial (Home Page)
*   **Funcionalidades:**
    *   Exibe informações gerais sobre a psicóloga (Dra. Jandira Frederick).
    *   Apresenta os serviços oferecidos.
    *   Inclui uma seção de Perguntas Frequentes (FAQ).
    *   Fornece informações de contato (telefone, e-mail, endereço).
    *   Possui um botão "Agendar Consulta" que abre o formulário em um modal.
    *   Contém um link "Entrar" para a página de login.
*   **Status:** ✅ **CONCLUÍDO**

### 2. Formulário de Agendamento de Consulta
*   **Funcionalidades:**
    *   Permite ao usuário selecionar uma data e hora disponíveis para a consulta.
    *   Coleta informações essenciais do paciente (nome completo, e-mail, telefone, CPF e motivo da consulta).
    *   Validação de dados em tempo real (e-mail, telefone, CPF).
    *   Tratamento de conflito de horários (se o slot for ocupado no último segundo).
    *   Redirecionamento para o Painel do Paciente após agendamento bem-sucedido.
    *   Envio de e-mail de confirmação para paciente e administrador.
    *   Para novos usuários, envia e-mail de boas-vindas com link para definir senha.
*   **Status:** ✅ **CONCLUÍDO**

### 3. Autenticação (Login)
*   **Funcionalidades:**
    *   Permite login via credenciais (e-mail e senha) e Google.
    *   Redirecionamento baseado na `role` do usuário (ADMIN para `/admin`, PACIENTE para `/portal/paciente`).
    *   Mensagens de erro claras para credenciais inválidas ou e-mail não reconhecido.
    *   Link para "Esqueci minha senha" (com fluxo de redefinição seguro).
    *   Link para "Registre-se" (direciona para o fluxo de agendamento/cadastro).
*   **Status:** ✅ **CONCLUÍDO**

### 4. Painel do Paciente
*   **Funcionalidades:**
    *   **Dashboard de Boas-Vindas:** Mensagem personalizada e destaque para a próxima consulta.
    *   **Listagem de Agendamentos:** Seções para "Próximas Consultas" (com opção de confirmar/cancelar) e "Histórico de Consultas".
    *   **Minhas Recomendações:** Aba para visualizar recomendações da psicóloga para consultas passadas.
    *   **Gerenciamento de Perfil:** Permite ao paciente atualizar suas informações (nome, CPF, foto).
    *   Botão para agendar uma nova consulta.
    *   Botão para sair da sessão (Logout).
*   **Status:** ✅ **CONCLUÍDO**

### 5. Painel Administrativo
*   **Funcionalidades:**
    *   **Gerenciar Agendamentos:** Visualiza lista de todos os agendamentos com filtros por status (Pendente, Confirmado, Cancelado, Pré-agendado, Realizado) e por período (dia, semana, mês). Permite atualizar status e cancelar/deletar agendamentos.
    *   **Gerenciar Disponibilidade:** Permite selecionar dias no calendário, gerar horários agendáveis em lote, remover horários específicos e bloquear dias/períodos inteiros (férias, feriados).
    *   **Gerenciar Pacientes:** Acesso a uma página dedicada para listar pacientes, visualizar detalhes (incluindo prontuário) e editar o prontuário. Permite adicionar recomendações a agendamentos específicos.
    *   **Gerenciar Usuários Admin:** Permite adicionar, editar e excluir usuários com a `role` ADMIN.
*   **Status:** ✅ **CONCLUÍDO**

### 6. Melhorias de Segurança e UX
*   **Bloqueio de Horários na UI:** Horários já agendados (`isBooked: true`) são visualmente desabilitados no calendário de agendamento.
*   **Notificações Transacionais (E-mail):**
    *   Confirmação de Pré-Agendamento: Envio automático de e-mail para paciente e administrador.
    *   Notificação de Cancelamento: Envio automático de e-mail para paciente e administrador.
*   **Fluxo de Senha para Novo Usuário:** Novos usuários recebem um link por e-mail para definir sua senha após o primeiro agendamento.
*   **Segurança do Fluxo "Esqueci a Senha":** Implementação de geração e validação de tokens seguros com expiração.
*   **Feedback Visual em Transições:** Botões de submissão ficam desabilitados e exibem texto de carregamento durante operações de rede.
*   **Rate Limiting (Middleware):** Implementado um middleware básico para limitar requisições por IP nas rotas de API.
*   **Status:** ✅ **CONCLUÍDO** (com ressalvas para produção no Rate Limiting e gatilhos de lembretes).

## 🛠️ Tecnologias Utilizadas

-   **Frontend**: Next.js 14, React, TypeScript
-   **Styling**: Tailwind CSS
-   **Validação**: React Hook Form + Zod
-   **Ícones**: Lucide React, React Icons
-   **Banco de Dados**: Prisma (SQLite)
-   **Autenticação**: NextAuth.js
-   **E-mail**: Nodemailer
-   **Utilitários de Data**: date-fns
-   **Deployment**: Vercel (recomendado)

## 📋 Pré-requisitos

-   Node.js 18+
-   Conta Google Cloud Platform (para Google Auth e Google Calendar, se for integrar)
-   Conta Twilio (para WhatsApp, se for integrar)

## ⚙️ Configuração

### 1. Clone o repositório
```bash
git clone <repository-url>
cd psicologa-agendamento
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:

#### NextAuth.js
-   `NEXTAUTH_URL`: URL base da sua aplicação (ex: `http://localhost:3000` em desenvolvimento, ou sua URL de produção).
-   `NEXTAUTH_SECRET`: Uma string longa e aleatória para assinar tokens JWT. Pode ser gerada com `openssl rand -base64 32`.

#### Google OAuth (para Login com Google)
1.  Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2.  Crie um novo projeto ou selecione um existente.
3.  Vá para "APIs e Serviços" > "Credenciais".
4.  Crie credenciais de "ID do cliente OAuth" para "Aplicativo da Web".
5.  Adicione `http://localhost:3000/api/auth/callback/google` (e sua URL de produção) como "URIs de redirecionamento autorizados".
6.  Obtenha seu Client ID e Client Secret.

Adicione as seguintes variáveis ao seu arquivo `.env.local`:
-   `GOOGLE_CLIENT_ID`: Seu Client ID do Google OAuth.
-   `GOOGLE_CLIENT_SECRET`: Seu Client Secret do Google OAuth.

#### Configuração de E-mail (Nodemailer)
Para o envio de e-mails de confirmação e redefinição de senha, configure as seguintes variáveis:
-   `EMAIL_SERVER_HOST`: Host do servidor SMTP (ex: `smtp.seudominio.com` ou `smtp.gmail.com`).
-   `EMAIL_SERVER_PORT`: Porta do servidor SMTP (ex: `587` para TLS, `465` para SSL).
-   `EMAIL_SERVER_USER`: Usuário do e-mail (geralmente o endereço de e-mail).
-   `EMAIL_SERVER_PASSWORD`: Senha do e-mail.
-   `EMAIL_FROM`: Endereço de e-mail do remetente (ex: `"Dra. Jandira Frederick" <noreply@seudominio.com>`).
-   `ADMIN_EMAIL`: O e-mail do administrador para receber notificações (ex: `admin@seudominio.com`).

#### Configuração do Banco de Dados (Prisma)
-   `DATABASE_URL`: URL de conexão com o banco de dados. Para SQLite local, mantenha `file:./dev.db`.

### 4. Execute as Migrações do Prisma
Após configurar o `.env.local`, aplique as migrações do banco de dados:
```bash
npx prisma migrate dev
```
Siga as instruções no terminal para nomear a migração.

### 5. Execute o projeto
```bash
npm run dev
```

Acesse `http://localhost:3000`

## 📱 Como Usar

### Para Pacientes
1.  Acesse a página inicial (`/`).
2.  Clique em "Agendar Consulta" para abrir o formulário.
3.  Selecione a data e horário disponível. Horários já agendados estarão desabilitados.
4.  Preencha seus dados (nome, e-mail, telefone, CPF, motivo da consulta).
5.  Confirme o agendamento.
6.  Se for um novo usuário, você receberá um e-mail com um link para definir sua senha e acessar o portal.
7.  Acesse o Portal do Paciente (`/portal/paciente`) para ver seus agendamentos, recomendações e gerenciar seu perfil.

### Para a Psicóloga (Administrador)
1.  Acesse a página de login (`/auth/signin`).
2.  Faça login com uma conta de administrador.
3.  Você será redirecionado para o Painel Administrativo (`/admin`).
4.  Gerencie agendamentos, disponibilidade, pacientes e outros usuários administradores através do menu lateral.

## 🔒 Segurança e Privacidade

-   ✅ **Autenticação Segura:** Utiliza NextAuth.js com suporte a credenciais e Google OAuth.
-   ✅ **Autorização Baseada em Role:** Acesso restrito a áreas administrativas e de paciente com base na `role` do usuário.
-   ✅ **Fluxo de Senha Seguro:** Implementado fluxo de redefinição de senha com tokens temporários e criptografia de senhas (bcrypt).
-   ✅ **Validação de Entrada de Dados:** Zod e React Hook Form garantem a validação robusta dos dados de formulário.
-   ✅ **Proteção contra Conflitos:** O sistema verifica a disponibilidade de horários no último segundo para evitar agendamentos duplicados.
-   ✅ **Rate Limiting:** Um middleware básico foi implementado para limitar o número de requisições às APIs por IP, ajudando a prevenir ataques de força bruta e spam.

---

### ⚠️ **Recomendação Importante para Produção (Rate Limiting)** ⚠️

O middleware de Rate Limiting implementado em `src/middleware.ts` utiliza um `Map` em memória para armazenar o contador de requisições por IP. **Esta abordagem é adequada apenas para ambientes de desenvolvimento e testes.**

**Para implantação em produção, é CRÍTICO substituir o `Map` em memória por uma solução de cache distribuído (como Redis, Upstash, ou um serviço de rate limiting oferecido pela sua plataforma de hospedagem como a Vercel).**

Sem um cache distribuído, o rate limiting não funcionará corretamente em ambientes com múltiplas instâncias do servidor (o que é comum em produção para escalabilidade), e os limites seriam redefinidos a cada reinício do servidor.

---

## 📊 Estrutura do Projeto

```
src/
├── app/
│   ├── api/             # Rotas de API (admin, agendamentos, auth, portal, bookable-slots, horarios-bloqueados)
│   ├── admin/           # Páginas e layout do painel administrativo
│   ├── auth/            # Páginas de autenticação (login, forgot-password, reset-password)
│   ├── portal/          # Páginas e layout do portal do paciente
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx       # Layout principal da aplicação
│   └── page.tsx         # Página inicial (Home Page)
├── components/          # Componentes reutilizáveis (formulários, botões, etc.)
│   ├── AgendamentoFormMelhorado.tsx
│   ├── AdminBookableSlotManager.tsx
│   ├── AdminUserManagement.tsx
│   ├── BookableSlotPicker.tsx
│   ├── ForgotPasswordForm.tsx
│   ├── LoginForm.tsx
│   ├── ResetPasswordForm.tsx
│   ├── SignInButtons.tsx
│   └── ... (outros componentes)
├── lib/                 # Funções utilitárias e configurações
│   ├── auth.ts          # Configuração do NextAuth.js
│   ├── email.ts         # Serviço de envio de e-mails
│   ├── prisma.ts        # Cliente Prisma
│   ├── utils.ts         # Funções utilitárias (ex: validação de CPF)
│   └── ...
├── prisma/              # Esquema do banco de dados e migrações
│   └── schema.prisma
├── public/              # Arquivos estáticos
├── middleware.ts        # Middleware de Rate Limiting
└── ...
```

## 📞 Suporte

Para dúvidas sobre configuração ou personalização:
-   Consulte a documentação das APIs e bibliotecas utilizadas.
-   Verifique os logs de erro no console do navegador e no terminal do servidor.

## 📄 Licença

Este projeto é proprietário e destinado ao uso específico da Dra. Jandira Frederick.

---

**Desenvolvido com ❤️ para facilitar o acesso à saúde mental**