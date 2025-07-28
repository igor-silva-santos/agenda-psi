# Configuração da API do Google Calendar

## 📋 Pré-requisitos

1. Conta Google com acesso ao Google Calendar
2. Projeto no Google Cloud Console
3. API do Google Calendar habilitada
4. Conta de serviço (Service Account) criada

## 🔧 Passo a Passo da Configuração

### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Anote o **Project ID** (será usado mais tarde)

### 2. Habilitar a API do Google Calendar

1. No Google Cloud Console, vá para **APIs & Services** > **Library**
2. Procure por "Google Calendar API"
3. Clique em **Enable**

### 3. Criar Conta de Serviço (Service Account)

1. Vá para **APIs & Services** > **Credentials**
2. Clique em **Create Credentials** > **Service Account**
3. Preencha:
   - **Name**: `psicologa-calendar-service`
   - **Description**: `Conta de serviço para integração com Google Calendar`
4. Clique em **Create and Continue**
5. Pule as etapas de permissões (Role) e clique em **Done**

### 4. Gerar Chave da Conta de Serviço

1. Na lista de contas de serviço, clique na que você criou
2. Vá para a aba **Keys**
3. Clique em **Add Key** > **Create new key**
4. Selecione **JSON** e clique em **Create**
5. O arquivo JSON será baixado automaticamente

### 5. Configurar Permissões no Google Calendar

1. Abra o Google Calendar
2. Vá para **Settings** (ícone de engrenagem)
3. Na barra lateral, clique em **Settings**
4. Vá para a aba **Calendars**
5. Clique no calendário que você quer usar
6. Role até **Share with specific people**
7. Clique em **+ Add people**
8. Adicione o email da conta de serviço (encontrado no arquivo JSON como `client_email`)
9. Dê permissão **Make changes to events**
10. Clique em **Send**

### 6. Obter o Calendar ID

1. No Google Calendar, vá para **Settings**
2. Na barra lateral, clique em **Settings**
3. Vá para a aba **Calendars**
4. Clique no calendário que você quer usar
5. Role até **Integrate calendar**
6. Copie o **Calendar ID** (formato: `example@gmail.com` ou `example.com_abc123@group.calendar.google.com`)

### 7. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# Google Calendar API
GOOGLE_CLIENT_EMAIL=seu-service-account@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSua chave privada aqui\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=seu-calendar-id@gmail.com
```

**⚠️ Importante:**
- O `GOOGLE_PRIVATE_KEY` deve estar entre aspas duplas
- Mantenha as quebras de linha (`\n`) na chave privada
- O `GOOGLE_CALENDAR_ID` é o ID do calendário que você copiou

### 8. Testar a Configuração

Após configurar as variáveis, você pode testar a API:

1. Acesse: `http://localhost:3000/api/test-google-calendar`
2. Você deve receber uma resposta como:

```json
{
  "success": true,
  "message": "Google Calendar API funcionando corretamente",
  "details": {
    "configured": true,
    "connectionTest": true
  }
}
```

## 🔍 Solução de Problemas

### Erro 403 - Forbidden
- Verifique se a conta de serviço tem permissão no calendário
- Confirme se o email da conta de serviço foi adicionado corretamente

### Erro 404 - Not Found
- Verifique se o `GOOGLE_CALENDAR_ID` está correto
- Confirme se o calendário existe e é acessível

### Erro de Autenticação
- Verifique se o `GOOGLE_CLIENT_EMAIL` está correto
- Confirme se o `GOOGLE_PRIVATE_KEY` está formatado corretamente
- Verifique se a API do Google Calendar está habilitada no projeto

### Variáveis de Ambiente Não Encontradas
- Verifique se o arquivo `.env.local` está na raiz do projeto
- Confirme se as variáveis estão escritas corretamente
- Reinicie o servidor de desenvolvimento após adicionar as variáveis

## 📝 Exemplo de Configuração Completa

```env
# Google Calendar API
GOOGLE_CLIENT_EMAIL=psicologa-calendar@projeto-123456.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=psicologa@gmail.com
```

## 🚀 Deploy no Vercel

Para o deploy no Vercel, adicione as mesmas variáveis de ambiente:

1. Vá para o dashboard do Vercel
2. Selecione seu projeto
3. Vá para **Settings** > **Environment Variables**
4. Adicione as três variáveis:
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_CALENDAR_ID`
5. Faça o deploy novamente

## 📊 Monitoramento

A API agora inclui logs detalhados que você pode monitorar:

- ✅ Eventos criados com sucesso
- ⚠️ Avisos sobre configuração
- ❌ Erros detalhados com códigos de status

Os logs aparecerão no console do servidor e nos logs do Vercel. 