## Documentação do Projeto: Psicóloga Agendamento Online

Este documento descreve as funcionalidades e o comportamento esperado do sistema de agendamento online para a Dra. Jandira Frederick, bem como sugestões para futuras implementações e melhorias.

### 1. Área Inicial (Home Page)

*   **Funcionalidades:**
    *   Exibe informações gerais sobre a psicóloga (Dra. Jandira Frederick).
    *   Apresenta os serviços oferecidos.
    *   Pode incluir depoimentos e uma seção de Perguntas Frequentes (FAQ).
    *   Fornece informações de contato (telefone, e-mail, endereço).
    *   Possui um botão "Agendar Consulta" que, ao ser clicado, revela o formulário de agendamento.
    *   Contém um link "Entrar" para a página de login.
*   **Comportamento Esperado:**
    *   Design responsivo e agradável em diferentes dispositivos.
    *   Navegação intuitiva entre as seções da página.
    *   Informações claras e concisas sobre a psicóloga e seus serviços.
    *   O botão "Agendar Consulta" deve alternar a visibilidade do formulário de agendamento de forma suave.
    *   O link "Entrar" deve direcionar corretamente para a página de login.

### 2. Formulário de Agendar Consulta

*   **Funcionalidades:**
    *   Permite ao usuário selecionar uma data e hora disponíveis para a consulta.
    *   Coleta informações pessoais do paciente para o pré-agendamento (nome, e-mail, telefone, etc.).
*   **Comportamento Esperado:**
    *   O calendário deve exibir apenas os dias que possuem horários disponíveis, conforme configurado pelo administrador.
    *   Ao selecionar um dia, os horários disponíveis para aquele dia devem ser listados de forma clara.
    *   O usuário deve conseguir selecionar um horário específico.
    *   O formulário deve validar os dados inseridos antes da submissão.
    *   Após a submissão, o sistema deve processar o pré-agendamento.

### 3. Login

*   **Funcionalidades:**
    *   Permite que usuários existentes (pacientes e administradores) acessem o sistema.
    *   Suporta autenticação via credenciais (e-mail e senha).
    *   Suporta autenticação via Google.
*   **Comportamento Esperado:**
    *   Se o login for bem-sucedido e o usuário tiver a `role` "ADMIN", ele deve ser redirecionado para o Painel Administrativo (`/admin`).
    *   Se o login for bem-sucedido e o usuário tiver a `role` "PACIENTE" (ou nenhuma `role` específica, assumindo paciente), ele deve ser redirecionado para o Painel do Paciente (`/portal/paciente`).
    *   Mensagens de erro claras devem ser exibidas para credenciais inválidas ou outros problemas de autenticação.

### 4. Painel do Paciente

*   **Funcionalidades:**
    *   Exibe uma mensagem de boas-vindas personalizada para o paciente logado.
    *   Oferece acesso ao formulário de agendamento de novas consultas.
    *   Possui um botão para sair da sessão.
*   **Comportamento Esperado:**
    *   Acesso restrito apenas a pacientes autenticados.
    *   Exibição do nome do paciente logado.
    *   Navegação suave para o formulário de agendamento.
    *   O botão "Sair" deve encerrar a sessão do usuário e redirecioná-lo para a página inicial ou de login.

### 5. Painel Administrativo

*   **Funcionalidades:**
    *   **Gerenciar Agendamentos:**
        *   Visualiza uma lista de todos os agendamentos.
        *   Permite filtrar agendamentos por data e status.
        *   Permite atualizar o status de um agendamento (Pendente, Confirmado, Cancelado, Pré-agendado).
        *   Permite cancelar agendamentos.
    *   **Gerenciar Pacientes:**
        *   Possui um link para uma página dedicada à listagem de pacientes.
    *   **Gerenciar Disponibilidade:**
        *   Permite ao administrador selecionar qualquer dia futuro no calendário.
        *   Permite gerar horários agendáveis para o dia selecionado (ex: 09:00-10:00, 10:00-11:00).
        *   Permite remover horários agendáveis específicos.
    *   **Gerenciar Usuários (NOVO):**
        *   Permite adicionar novos usuários (com nome, e-mail, senha e `role` - PACIENTE ou ADMIN).
        *   Permite modificar o e-mail, nome, senha e `role` de usuários existentes.
        *   Permite excluir usuários.
*   **Comportamento Esperado:**
    *   Acesso estritamente restrito a usuários com a `role` "ADMIN".
    *   Navegação clara e eficiente entre as diferentes seções de gerenciamento (Agendamentos, Pacientes, Disponibilidade, Usuários).
    *   Listagens de dados (agendamentos, usuários) devem ser claras e fáceis de usar.
    *   Operações de criação, edição e exclusão devem fornecer feedback visual claro (sucesso/erro).

### 6. O que precisa ser implementado ou melhorado

*   **Funcionalidade de Agendamento Completa:**
    *   **Confirmação de Agendamento:** Envio automático de e-mail/WhatsApp para o paciente após o agendamento/pré-agendamento.
    *   **Bloqueio de Horários Agendados:** Garantir que um `BookableSlot` marcado como `isBooked: true` não possa ser selecionado por outros usuários. (Já implementado na API, mas precisa ser refletido na UI do paciente).
    *   **Integração com Google Calendar:** Sincronização automática dos agendamentos com o Google Calendar da psicóloga.
    *   **Visualização de Agendamentos (Paciente):** No Painel do Paciente, permitir que o paciente veja seus agendamentos futuros e passados.
    *   **Cancelamento/Remarcação (Paciente):** Permitir que o paciente cancele ou solicite a remarcação de consultas através do Painel do Paciente, com regras de antecedência.
    *   **Lembretes de Consulta:** Envio automático de lembretes (e-mail/WhatsApp) antes da consulta.

*   **Painel do Paciente:**
    *   **Gerenciamento de Perfil:** Opção para o paciente atualizar seus dados pessoais (telefone, CPF, etc.).
    *   **Histórico de Consultas:** Exibir um histórico detalhado das consultas realizadas.
    *   **Prontuário/Recomendações:** Seções para a psicóloga adicionar prontuários e recomendações que o paciente possa visualizar.

*   **Painel Administrativo:**
    *   **Gerenciamento de Pacientes:** Implementar a listagem, edição e exclusão de pacientes de forma completa, incluindo seus dados pessoais e prontuários.
    *   **Horários Bloqueados:** Adicionar uma interface para o administrador bloquear períodos específicos (férias, feriados, emergências) que não devem estar disponíveis para agendamento.
    *   **Horários de Atuação Recorrentes:** Permitir que o administrador defina padrões de horários de atuação semanais (ex: segundas e quartas das 9h às 12h).
    *   **Relatórios:** Geração de relatórios sobre agendamentos (número, status), pacientes (novos, ativos), etc.
    *   **Notificações Administrativas:** Sistema de notificação para a psicóloga sobre novos agendamentos, cancelamentos, etc.

*   **Segurança:**
    *   **Autenticação de Dois Fatores (2FA):** Implementar 2FA para a área administrativa para maior segurança.
    *   **Limitação de Tentativas de Login:** Bloquear IPs ou contas após múltiplas tentativas de login falhas.
    *   **Auditoria de Ações:** Registrar ações importantes realizadas por administradores para fins de auditoria.

*   **Experiência do Usuário (UX/UI):**
    *   **Melhoria Visual:** Refinar o design geral da aplicação para torná-la mais moderna e intuitiva.
    *   **Feedback Visual:** Melhorar o feedback visual para ações do usuário (ex: spinners de carregamento mais elaborados, mensagens de sucesso/erro mais amigáveis).
    *   **Internacionalização:** Se houver planos de atender a usuários de diferentes idiomas, implementar suporte a múltiplos idiomas.

*   **Performance:**
    *   Otimizar consultas ao banco de dados e o carregamento de dados para garantir uma experiência rápida, especialmente com o aumento do número de agendamentos e usuários.

