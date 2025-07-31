# 🚀 Guia Completo de Instalação e Configuração (Windows)

Este guia detalha todos os passos para configurar e executar o projeto do site da **Dra. Jandira Frederick** em sua máquina Windows.

## 1. Pré-requisitos de Software

Antes de começar, você precisa ter os seguintes programas instalados:

- **[Node.js](https://nodejs.org/en/download/)**: Essencial para rodar o projeto. Baixe a versão LTS.
- **[Visual Studio Code](https://code.visualstudio.com/download)**: Editor de código recomendado.
- **[7-Zip](https://www.7-zip.org/download.html)**: Para descompactar o arquivo do projeto (`.tar.gz`).
- **[Git](https://git-scm.com/download/win)**: Sistema de controle de versão, útil para o deploy.

## 2. Baixar e Extrair o Projeto

1.  **Baixe o arquivo** `psicologa-agendamento-melhorado.tar.gz` que enviei na mensagem anterior.
2.  **Crie uma pasta** para o projeto (ex: `C:\Projetos\site-psicologa`).
3.  **Mova o arquivo** `.tar.gz` para dentro desta pasta.
4.  **Clique com o botão direito** no arquivo, vá em `7-Zip` -> `Extrair Aqui`.
5.  Isso criará a pasta `psicologa-agendamento` com todo o código-fonte.

## 3. Configurar o Banco de Dados (Firebase/Firestore)

O projeto usa o Firebase como banco de dados. Siga estes passos para criar o seu:

1.  **Acesse o [Firebase Console](https://console.firebase.google.com/)** com sua conta Google.
2.  Clique em **"Adicionar projeto"** e dê um nome a ele (ex: `dra-jandira-site`).
3.  Siga os passos de criação. Desative o Google Analytics se não for usar agora.
4.  No painel do projeto, clique no ícone **`</>` (Web)** para adicionar um aplicativo da web.
5.  Dê um apelido ao app e clique em **"Registrar app"**.
6.  O Firebase mostrará suas **credenciais de configuração**. Copie-as!
    ```javascript
    const firebaseConfig = {
      apiKey: "SUA_API_KEY",
      authDomain: "SEU_PROJETO.firebaseapp.com",
      projectId: "SEU_PROJECT_ID",
      storageBucket: "SEU_PROJETO.appspot.com",
      messagingSenderId: "SEU_SENDER_ID",
      appId: "SEU_APP_ID"
    };
    ```
7.  No menu lateral esquerdo, vá em **Build -> Firestore Database**.
8.  Clique em **"Criar banco de dados"**.
9.  Inicie no **modo de produção** e clique em "Avançar".
10. Escolha a localização do servidor (recomendo `southamerica-east1` para o Brasil).
11. Clique em **"Ativar"**.
12. Vá para a aba **"Regras"** e cole as regras de segurança do arquivo `ESTRUTURA_BANCO_DADOS.md`.

O banco de dados está pronto! As coleções (`users`, `appointments`, etc.) serão criadas automaticamente quando a aplicação rodar.

## 4. Configurar as APIs

Consulte o arquivo `APIS_NECESSARIAS.md` para um guia detalhado de como obter as chaves para:

- **Google OAuth**: Para o login com Google.
- **Google Calendar API**: Para a agenda.
- **Twilio**: Para as notificações via WhatsApp.

## 5. Configurar o Ambiente Local

1.  Abra a pasta do projeto (`psicologa-agendamento`) no **Visual Studio Code**.
2.  Na raiz do projeto, renomeie o arquivo `.env.example` para `.env.local`.
3.  Abra o arquivo `.env.local` e preencha com **todas as chaves** que você obteve nos passos anteriores (Firebase, Google, Twilio, etc.).

    ```env
    # Firebase
    NEXT_PUBLIC_FIREBASE_API_KEY=COLE_SUA_CHAVE_AQUI
    # ...e as outras chaves do Firebase

    # Google Calendar
    GOOGLE_CLIENT_EMAIL=COLE_SEU_EMAIL_DE_SERVIÇO_AQUI
    # ...e as outras chaves do Google

    # NextAuth
    NEXTAUTH_SECRET=GERAR_UMA_CHAVE_SECRETA_LONGA_E_ALEATORIA
    # ...e as outras chaves
    ```

## 6. Instalar Dependências e Rodar o Projeto

1.  No VS Code, abra o terminal integrado (`Ctrl + '` ou `View -> Terminal`).
2.  Execute o comando para instalar todas as dependências:
    ```bash
    npm install
    ```
3.  Após a instalação, execute o comando para iniciar o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
4.  O terminal mostrará que o site está rodando! Abra seu navegador e acesse:

    - **Site Principal:** [http://localhost:3000](http://localhost:3000)
    - **Área Administrativa:** [http://localhost:3000/admin](http://localhost:3000/admin) (senha: `admin123`)

## 7. Estrutura de Pastas

Não é necessário criar nenhuma pasta manualmente. A estrutura já está pronta no arquivo `.tar.gz`:

```
psicologa-agendamento/
├── public/             # Imagens e arquivos estáticos
├── src/
│   ├── app/            # Rotas e páginas do site
│   │   ├── api/        # Endpoints da API (backend)
│   │   ├── auth/       # Páginas de login/registro
│   │   ├── portal/     # Portal do paciente
│   │   └── page.tsx    # Página inicial
│   ├── components/     # Componentes React reutilizáveis
│   └── lib/            # Configurações (Firebase, etc.)
├── .env.local          # Suas chaves secretas (NÃO COMPARTILHE!)
├── package.json        # Lista de dependências
└── README.md           # Documentação geral
```

Pronto! Seguindo estes passos, o site estará 100% funcional na sua máquina local.

