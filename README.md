# Sistema de Agendamento - Dra. Ana Silva

Sistema completo de agendamento de consultas para psicóloga, desenvolvido em Next.js com integração ao Google Calendar e notificações WhatsApp.

## 🚀 Funcionalidades

### Para Pacientes
- ✅ Agendamento online com calendário interativo
- ✅ Visualização de horários disponíveis em tempo real
- ✅ Formulário de dados com validação
- ✅ Confirmação automática por WhatsApp
- ✅ Lembretes 24h antes da consulta
- ✅ Interface responsiva (mobile e desktop)

### Para a Psicóloga
- ✅ Área administrativa protegida
- ✅ Visualização de todos os agendamentos
- ✅ Filtros por data e status
- ✅ Estatísticas de agendamentos
- ✅ Integração automática com Google Calendar
- ✅ Notificações por e-mail

### Integrações
- ✅ Google Calendar API (sincronização automática)
- ✅ WhatsApp Business API (via Twilio)
- ✅ Validação de formulários com Zod
- ✅ Interface moderna com Tailwind CSS

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Validação**: React Hook Form + Zod
- **Ícones**: Lucide React
- **APIs**: Google Calendar, Twilio WhatsApp
- **Deployment**: Vercel (recomendado)

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta Google Cloud Platform
- Conta Twilio (para WhatsApp)
- Conta Vercel (para deploy)

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

#### Google Calendar API
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a Google Calendar API
4. Crie uma conta de serviço
5. Baixe o arquivo JSON de credenciais
6. Extraia `client_email` e `private_key`
7. Crie um calendário no Google Calendar e obtenha o ID

#### Twilio WhatsApp
1. Crie uma conta no [Twilio](https://www.twilio.com/)
2. Configure o WhatsApp Business API
3. Obtenha Account SID, Auth Token e número WhatsApp

### 4. Execute o projeto
```bash
npm run dev
```

Acesse `http://localhost:3000`

## 📱 Como Usar

### Para Pacientes
1. Acesse a página inicial
2. Clique em "Agendar Consulta"
3. Selecione data e horário disponível
4. Preencha seus dados
5. Confirme o agendamento
6. Receba confirmação por WhatsApp

### Para a Psicóloga
1. Acesse `/admin`
2. Faça login com a senha configurada
3. Visualize e gerencie agendamentos
4. Use filtros para organizar consultas

## 🔒 Segurança e Privacidade

- ✅ Conformidade com LGPD
- ✅ Criptografia de dados sensíveis
- ✅ Autenticação segura para área admin
- ✅ Validação de entrada de dados
- ✅ Proteção contra ataques comuns

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas
- AWS Amplify
- Netlify
- Railway
- DigitalOcean App Platform

## 📊 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── agendamento/
│   │   └── whatsapp/
│   ├── admin/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AgendamentoForm.tsx
│   ├── CalendarioAgendamento.tsx
│   └── PsicologaInfo.tsx
└── types/
```

## 🔧 Personalização

### Informações da Psicóloga
Edite `src/components/PsicologaInfo.tsx` para atualizar:
- Nome e CRP
- Formação e especialidades
- Áreas de atuação
- Foto (substitua o emoji por uma imagem real)

### Horários de Funcionamento
Edite `src/components/CalendarioAgendamento.tsx`:
```typescript
const workingHours = [
  '08:00', '09:00', '10:00', '11:00',
  '14:00', '15:00', '16:00', '17:00', '18:00'
];
```

### Valores das Consultas
Atualize os valores em `src/components/CalendarioAgendamento.tsx`

### Cores e Estilo
O projeto usa Tailwind CSS. Principais cores:
- Azul: `blue-600` (primária)
- Verde: `green-600` (sucesso)
- Amarelo: `yellow-600` (atenção)

## 🐛 Solução de Problemas

### Erro de Autenticação Google
- Verifique se a API está ativada
- Confirme as credenciais da conta de serviço
- Verifique se o calendário foi compartilhado com a conta de serviço

### WhatsApp não funciona
- Confirme as credenciais do Twilio
- Verifique se o número está aprovado para WhatsApp Business
- Teste com o Twilio Console primeiro

### Problemas de Build
```bash
npm run build
```
Verifique erros de TypeScript e corrija antes do deploy

## 📞 Suporte

Para dúvidas sobre configuração ou personalização:
- Consulte a documentação das APIs utilizadas
- Verifique os logs de erro no console
- Teste cada integração separadamente

## 📄 Licença

Este projeto é proprietário e destinado ao uso específico da Dra. Ana Silva.

## 🔄 Atualizações Futuras

- [ ] Sistema de pagamento online
- [ ] Videoconferência integrada
- [ ] App mobile nativo
- [ ] Múltiplos profissionais
- [ ] Relatórios avançados
- [ ] Integração com prontuário eletrônico

---

**Desenvolvido com ❤️ para facilitar o acesso à saúde mental**

