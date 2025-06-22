# 🔑 Configuração das Variáveis de Ambiente na Vercel

Com base nas credenciais fornecidas, aqui estão **TODAS** as variáveis de ambiente que você deve configurar na Vercel:

## 📋 Variáveis Obrigatórias (Configure TODAS)

### NextAuth.js (Autenticação)
```
NEXTAUTH_SECRET=sua_chave_secreta_muito_longa_e_aleatoria_aqui_pelo_menos_32_caracteres
NEXTAUTH_URL=https://psicologa-agendamento.vercel.app
```

### Google OAuth (Login com Google)
```
GOOGLE_CLIENT_ID=708072726813-9476nadl758h59t0lgpb86a23i829ebl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Firebase/Firestore (Banco de Dados)
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD190j2ARAuv96gApAiGvCV0oFNHYTIKKA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=meu-app-psicologia.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=meu-app-psicologia
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=meu-app-psicologia.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=708072726813
NEXT_PUBLIC_FIREBASE_APP_ID=1:708072726813:web:53a20f8e34891e13d781f4
```

## 🔧 Como Configurar na Vercel

1. **Acesse seu projeto na Vercel**: https://vercel.com/dashboard
2. **Selecione o projeto**: `psicologa-agendamento`
3. **Vá para Settings**: Clique na aba "Settings"
4. **Environment Variables**: Clique em "Environment Variables" no menu lateral
5. **Adicione cada variável**: 
   - Clique em "Add New"
   - Cole o **nome** da variável (ex: `NEXTAUTH_SECRET`)
   - Cole o **valor** da variável
   - Selecione **Production, Preview, Development** (todas as opções)
   - Clique em "Save"

## ⚠️ Atenções Especiais

### Para `NEXTAUTH_SECRET`:
Gere uma chave aleatória longa. Você pode usar este comando no terminal:
```bash
openssl rand -base64 32
```
Ou use um gerador online como: https://generate-secret.vercel.app/32

### Para `NEXTAUTH_URL`:
**DEVE** ser exatamente: `https://psicologa-agendamento.vercel.app`

## 🚀 Após Configurar

1. **Deploy Automático**: A Vercel iniciará um novo deploy automaticamente
2. **Aguarde**: Espere o deploy terminar (cerca de 1-2 minutos)
3. **Teste**: Acesse https://psicologa-agendamento.vercel.app
4. **Funcionalidades**: Teste o login com Google e o registro de usuário

## ✅ Funcionalidades Ativas Após Configuração

- ✅ Login com Google OAuth
- ✅ Registro de usuário com email/senha
- ✅ Portal do paciente
- ✅ Área administrativa
- ✅ Banco de dados Firebase/Firestore
- ❌ WhatsApp (desativado conforme solicitado)

## 🔍 Se Ainda Houver Erro 404

1. Verifique se **TODAS** as variáveis foram adicionadas corretamente
2. Certifique-se de que `NEXTAUTH_URL` está com a URL exata da Vercel
3. Aguarde alguns minutos após o deploy
4. Limpe o cache do navegador (Ctrl+F5)

Me avise quando terminar de configurar as variáveis!

