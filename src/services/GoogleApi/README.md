# 📘 Integração com Google APIs - OAuth2 e Google Calendar

Este repositório contém a implementação da autenticação OAuth2 com as APIs do Google, incluindo Google Meet e Google Calendar. Ele permite a autenticação segura e a criação de eventos no Google Calendar.

## 🚀 Tecnologias Utilizadas
- **Node.js** - Ambiente de execução do JavaScript.
- **Google APIs** - Biblioteca oficial para interação com os serviços do Google.
- **OAuth2** - Protocolo de autenticação seguro para acesso a serviços do Google.
- **File System (fs)** - Para leitura e escrita de credenciais e tokens.
- **Path** - Para manipulação de caminhos de arquivos.

---

## 📂 Estrutura do Código

### 🔑 Autenticação e Geração de Token OAuth2
O primeiro passo para acessar as APIs do Google é obter um token de acesso.

#### `getAccessToken(oAuth2Client)`
Solicita um token de acesso ao usuário e o salva para uso futuro.
```ts
const getAccessToken = (oAuth2Client) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Autorize este aplicativo visitando o URL:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("\nInsira o código da página de autorização: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error("Erro ao tentar recuperar o token:", err.message);
        return;
      }
      oAuth2Client.setCredentials(token);
      fs.writeFile(tokenPath, JSON.stringify(token), (err) => {
        if (err) console.error("Erro ao salvar o token:", err.message);
        else console.log("Token armazenado com sucesso em:", tokenPath);
      });
    });
  });
};
```

---

### 🔐 Configuração do Cliente OAuth2

#### `authorize(credentials)`
Carrega o token salvo ou solicita autenticação ao usuário.
```ts
const authorize = (credentials) => {
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(tokenPath)) {
    const token = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
    oAuth2Client.setCredentials(token);
    console.log("Autenticado com sucesso usando o token salvo.");
    return oAuth2Client;
  } else {
    getAccessToken(oAuth2Client);
  }
};
```

---

### 📅 Criação de Eventos no Google Calendar

#### `createEvent()`
Cria um evento no Google Calendar com link de conferência Meet.
```ts
const createEvent = async () => {
  const auth = await getAuthenticatedClient();
  const calendar = google.calendar({ version: "v3", auth });

  const event = {
    summary: "Mentoria de Programação",
    description: "Sessão de mentoria para revisar código.",
    start: {
      dateTime: "2025-01-17T10:00:00-03:00",
      timeZone: "America/Sao_Paulo",
    },
    end: {
      dateTime: "2025-01-17T11:00:00-03:00",
      timeZone: "America/Sao_Paulo",
    },
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}`,
      },
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
    });
  } catch (error) {
    console.error("Erro ao criar evento:", error.message);
  }
};

createEvent();
```

---

## 🚀 Como Executar o Projeto

### 1️⃣ Instalar Dependências
```sh
npm install googleapis fs path readline
```

### 2️⃣ Configurar Credenciais
- Crie um projeto no [Google Cloud Console](https://console.cloud.google.com/).
- Ative a API do Google Calendar e Google Meet.
- Gere as credenciais OAuth2 e baixe o arquivo `credentials.json`.
- Mova o `credentials.json` para `./meetService/meetCredentials.json`.

### 3️⃣ Executar a Autenticação
```sh
node index.js
```
Ao rodar o script pela primeira vez, ele gerará um link de autorização. Acesse o link, conceda permissões e copie o código gerado para o terminal.

### 4️⃣ Criar um Evento no Google Calendar
```sh
node createEvent.js
```
Isso criará um evento no Google Calendar vinculado ao seu usuário autenticado.

---

## 📌 Considerações Finais
- **O que o código faz?**
  1. Autentica-se nas APIs do Google usando OAuth2.
  2. Salva o token para reutilização futura.
  3. Cria eventos no Google Calendar com conferência Google Meet.

- **Benefícios:**
  1. Permite criação automática de eventos no Google Calendar.
  2. Usa autenticação segura via OAuth2.
  3. Integração direta com a API do Google Meet.

Caso precise de mais ajustes, me avise! 🚀

