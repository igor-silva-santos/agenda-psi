# 📋 Levantamento de APIs Necessárias - Dra. Jandira Frederick

## 🔐 APIs de Autenticação

### 1. NextAuth.js
- **Propósito**: Sistema de autenticação completo para Next.js
- **Funcionalidades**:
  - Login/registro com email e senha
  - OAuth com Google
  - Gerenciamento de sessões
  - Proteção de rotas
- **Configuração necessária**:
  ```env
  NEXTAUTH_SECRET=sua_chave_secreta_muito_longa_e_aleatoria
  NEXTAUTH_URL=http://localhost:3000
  ```

### 2. Google OAuth API
- **Propósito**: Permitir login com conta Google
- **Configuração necessária**:
  ```env
  GOOGLE_CLIENT_ID=seu_google_client_id.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=seu_google_client_secret
  ```
- **Passos para obter**:
  1. Acessar Google Cloud Console
  2. Criar projeto ou usar existente
  3. Ativar Google+ API
  4. Criar credenciais OAuth 2.0
  5. Configurar URLs autorizadas

## 📧 APIs de Comunicação

### 3. Twilio WhatsApp Business API
- **Propósito**: Envio de notificações automáticas via WhatsApp
- **Funcionalidades**:
  - Confirmação de agendamento
  - Lembretes de consulta
  - Notificações de cancelamento
  - Ofertas de reagendamento automático
- **Configuração necessária**:
  ```env
  TWILIO_ACCOUNT_SID=seu_account_sid
  TWILIO_AUTH_TOKEN=seu_auth_token
  TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
  ```

### 4. SendGrid ou Nodemailer (Email)
- **Propósito**: Envio de emails como alternativa ao WhatsApp
- **Funcionalidades**:
  - Confirmações por email
  - Notificações de reagendamento
  - Recuperação de senha
- **Configuração necessária** (SendGrid):
  ```env
  SENDGRID_API_KEY=sua_sendgrid_api_key
  FROM_EMAIL=noreply@drajandira.com.br
  ```

## 📅 APIs de Calendário

### 5. Google Calendar API
- **Propósito**: Sincronização com agenda da psicóloga
- **Funcionalidades**:
  - Criar eventos de consulta
  - Verificar disponibilidade
  - Cancelar/reagendar eventos
  - Evitar conflitos de horário
- **Configuração necessária**:
  ```env
  GOOGLE_CLIENT_EMAIL=conta-servico@projeto.iam.gserviceaccount.com
  GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  GOOGLE_CALENDAR_ID=calendario-id@group.calendar.google.com
  ```

## 💳 APIs de Pagamento (Opcional/Futuro)

### 6. Stripe ou Mercado Pago
- **Propósito**: Processamento de pagamentos online
- **Funcionalidades**:
  - Pagamento de consultas
  - Assinaturas mensais
  - Reembolsos automáticos
- **Configuração necessária** (Stripe):
  ```env
  STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...
  ```

## 🗄️ APIs de Banco de Dados

### 7. Firebase/Firestore
- **Propósito**: Banco de dados NoSQL em tempo real
- **Funcionalidades**:
  - Armazenamento de usuários
  - Agendamentos
  - Anotações e atividades
  - Configurações do sistema
- **Configuração necessária**:
  ```env
  NEXT_PUBLIC_FIREBASE_API_KEY=sua_firebase_api_key
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=projeto.firebaseapp.com
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=projeto.appspot.com
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
  NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
  ```

## 🔔 APIs de Notificações

### 8. Firebase Cloud Messaging (FCM)
- **Propósito**: Notificações push no navegador
- **Funcionalidades**:
  - Lembretes de consulta
  - Notificações de cancelamento
  - Alertas administrativos
- **Configuração necessária**:
  ```env
  FIREBASE_SERVER_KEY=sua_server_key_fcm
  ```

## 📊 APIs de Analytics (Opcional)

### 9. Google Analytics 4
- **Propósito**: Monitoramento de uso do site
- **Configuração necessária**:
  ```env
  NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
  ```

## 🔒 APIs de Segurança

### 10. reCAPTCHA v3
- **Propósito**: Proteção contra spam e bots
- **Configuração necessária**:
  ```env
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY=sua_site_key
  RECAPTCHA_SECRET_KEY=sua_secret_key
  ```

## 📱 APIs de SMS (Backup)

### 11. Twilio SMS
- **Propósito**: Envio de SMS como backup do WhatsApp
- **Configuração necessária**:
  ```env
  TWILIO_PHONE_NUMBER=+1234567890
  ```

## 🌐 APIs de Geolocalização (Futuro)

### 12. Google Maps API
- **Propósito**: Mostrar localização do consultório
- **Configuração necessária**:
  ```env
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_maps_api_key
  ```

## 📋 Resumo de Prioridades

### 🔴 **Críticas (Implementar primeiro)**:
1. NextAuth.js (autenticação)
2. Google OAuth API (login social)
3. Firebase/Firestore (banco de dados)
4. Google Calendar API (sincronização agenda)
5. Twilio WhatsApp API (notificações)

### 🟡 **Importantes (Segunda fase)**:
6. SendGrid/Nodemailer (emails)
7. Firebase Cloud Messaging (notificações push)

### 🟢 **Opcionais (Futuro)**:
8. Stripe/Mercado Pago (pagamentos)
9. Google Analytics (analytics)
10. reCAPTCHA (segurança)
11. Google Maps (localização)

## 💰 Estimativa de Custos Mensais

- **Firebase**: Gratuito até 50k leituras/dia
- **Twilio WhatsApp**: ~$0.005 por mensagem
- **Google Calendar API**: Gratuito até 1M requisições/dia
- **SendGrid**: Gratuito até 100 emails/dia
- **Total estimado**: $10-30/mês para uso moderado

## 📝 Próximos Passos

1. **Você deve obter as credenciais das APIs críticas**
2. **Eu implementarei a integração no código**
3. **Testaremos todas as funcionalidades**
4. **Faremos o deploy em produção**

