# Manual de Configuração das APIs

## 🔧 Configuração do Google Calendar API

### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. No menu lateral, vá em "APIs e Serviços" > "Biblioteca"
4. Procure por "Google Calendar API" e ative

### 2. Criar Conta de Serviço

1. Vá em "APIs e Serviços" > "Credenciais"
2. Clique em "Criar Credenciais" > "Conta de serviço"
3. Preencha os dados:
   - Nome: `psicologa-agendamento`
   - Descrição: `Conta para sistema de agendamento`
4. Clique em "Criar e continuar"
5. Pule as permissões opcionais
6. Clique em "Concluído"

### 3. Gerar Chave JSON

1. Na lista de contas de serviço, clique na conta criada
2. Vá na aba "Chaves"
3. Clique em "Adicionar chave" > "Criar nova chave"
4. Selecione "JSON" e clique em "Criar"
5. O arquivo será baixado automaticamente

### 4. Configurar Calendário

1. Abra o Google Calendar
2. Crie um novo calendário para agendamentos:
   - Nome: "Consultas - Dra. Ana Silva"
   - Descrição: "Agendamentos de consultas"
3. Nas configurações do calendário, vá em "Compartilhar com pessoas específicas"
4. Adicione o email da conta de serviço (client_email do JSON) com permissão "Fazer alterações nos eventos"
5. Copie o ID do calendário (encontrado em "Integrar calendário")

### 5. Configurar Variáveis de Ambiente

No arquivo `.env.local`:
```env
GOOGLE_CLIENT_EMAIL=sua-conta-servico@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=seu-calendario-id@group.calendar.google.com
```

## 📱 Configuração do WhatsApp (Twilio)

### 1. Criar Conta Twilio

1. Acesse [Twilio](https://www.twilio.com/)
2. Crie uma conta gratuita
3. Verifique seu número de telefone

### 2. Configurar WhatsApp Business API

1. No Console Twilio, vá em "Messaging" > "Try it out" > "Send a WhatsApp message"
2. Siga as instruções para conectar seu número ao WhatsApp Business
3. Anote o número do WhatsApp Sandbox (ex: whatsapp:+14155238886)

### 3. Obter Credenciais

1. No Dashboard Twilio, encontre:
   - Account SID
   - Auth Token
2. Vá em "Phone Numbers" > "Manage" > "WhatsApp senders" para ver o número

### 4. Configurar Variáveis de Ambiente

No arquivo `.env.local`:
```env
TWILIO_ACCOUNT_SID=seu_account_sid_aqui
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### 5. Testar Integração

1. Use o Twilio Console para enviar uma mensagem de teste
2. Verifique se as mensagens estão sendo entregues
3. Configure webhooks se necessário para respostas

## 🔐 Configuração de Segurança

### 1. Senha Administrativa

No arquivo `.env.local`:
```env
ADMIN_PASSWORD=sua_senha_segura_aqui
```

### 2. NextAuth (Opcional)

Para autenticação mais robusta:
```env
NEXTAUTH_SECRET=sua_chave_secreta_muito_longa_e_aleatoria
NEXTAUTH_URL=http://localhost:3000
```

## 🚀 Deploy em Produção

### 1. Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. Deploy automático a cada push

### 2. Configurações Importantes

- Certifique-se de que todas as variáveis de ambiente estão configuradas
- Teste as integrações em ambiente de produção
- Configure domínio personalizado se necessário

## 🧪 Testes

### 1. Testar Google Calendar

```javascript
// Teste no console do navegador
fetch('/api/agendamento', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(console.log);
```

### 2. Testar WhatsApp

```javascript
// Teste no console do navegador
fetch('/api/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    telefone: '11999999999',
    nome: 'Teste',
    data: '2024-06-10',
    horario: '09:00',
    tipo: 'confirmacao'
  })
})
.then(res => res.json())
.then(console.log);
```

## 🔧 Solução de Problemas

### Google Calendar

**Erro 403 - Forbidden:**
- Verifique se a API está ativada
- Confirme se o calendário foi compartilhado com a conta de serviço
- Verifique as permissões da conta de serviço

**Erro 400 - Bad Request:**
- Verifique o formato das datas
- Confirme se o ID do calendário está correto

### WhatsApp/Twilio

**Erro 21211 - Invalid 'To' Phone Number:**
- Verifique o formato do número (deve incluir código do país)
- Confirme se o número está no Sandbox (modo de teste)

**Erro 20003 - Authentication Error:**
- Verifique Account SID e Auth Token
- Confirme se as credenciais estão corretas

### Geral

**Erro de CORS:**
- Adicione domínio nas configurações das APIs
- Configure headers CORS no Next.js se necessário

**Erro de Environment Variables:**
- Reinicie o servidor após alterar .env.local
- Verifique se não há espaços extras nas variáveis

## 📞 Suporte

Para dúvidas técnicas:
- Documentação Google Calendar API: https://developers.google.com/calendar
- Documentação Twilio: https://www.twilio.com/docs
- Documentação Next.js: https://nextjs.org/docs

