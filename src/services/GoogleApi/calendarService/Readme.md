# 📅 Integração com Google Calendar

Este módulo fornece funções para criar e deletar eventos no **Google Calendar** utilizando a API oficial do Google.

## 🚀 Tecnologias Utilizadas
- **Google APIs** - Biblioteca oficial para integração com serviços do Google.
- **GraphQL** - Utiliza GraphQLError para tratamento de erros.
- **Node.js** - Para execução do servidor e manipulação das requisições.

---

## 📂 Estrutura do Código
O código implementa duas funções principais:
- **`createGoogleCalendarEvent`** - Cria um evento no Google Calendar.
- **`deleteGoogleCalendarEvent`** - Remove um evento existente do Google Calendar.

---

## 📌 Funções

### `createGoogleCalendarEvent`
Cria um novo evento no Google Calendar com suporte a convidados e Google Meet.

```ts
export const createGoogleCalendarEvent = async (
  auth: any,
  eventData: {
    summary: string;
    description: string;
    startDateTime: string;
    endDateTime: string;
    attendees: { email: string }[];
  }
) => {
  const calendar = google.calendar({ version: "v3", auth });

  const event: calendar_v3.Schema$Event = {
    summary: eventData.summary,
    description: eventData.description,
    start: {
      dateTime: eventData.startDateTime,
      timeZone: "America/Sao_Paulo",
    },
    end: {
      dateTime: eventData.endDateTime,
      timeZone: "America/Sao_Paulo",
    },
    attendees: eventData.attendees,
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}`,
      },
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro ao criar o evento no Google Calendar:", error.message);
    } else {
      console.error("Erro desconhecido ao criar o evento no Google Calendar:", error);
    }
    throw new GraphQLError("Não foi possível criar o evento no Google Calendar.");
  }
};
```

**Parâmetros:**
- `auth`: Instância de autenticação com Google OAuth.
- `eventData`: Objeto contendo:
  - `summary`: Título do evento.
  - `description`: Descrição do evento.
  - `startDateTime`: Data e hora de início.
  - `endDateTime`: Data e hora de término.
  - `attendees`: Lista de emails dos convidados.

**O que faz?**
1. Cria uma conexão com a API do Google Calendar.
2. Define um objeto de evento com título, descrição, data e participantes.
3. Adiciona um link do Google Meet automaticamente.
4. Insere o evento no Google Calendar.
5. Retorna os dados do evento criado ou lança um erro caso falhe.

---

### `deleteGoogleCalendarEvent`
Deleta um evento existente do Google Calendar.

```ts
export const deleteGoogleCalendarEvent = async (auth: any, eventId: string) => {
  const calendar = google.calendar({ version: "v3", auth });
  try {
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro ao deletar evento do Google Calendar:", error.message);
    } else {
      console.error("Erro desconhecido ao deletar o evento do Google Calendar:", error);
    }
    throw new GraphQLError("Não foi possível deletar o evento no Google Calendar.");
  }
};
```

**Parâmetros:**
- `auth`: Instância de autenticação com Google OAuth.
- `eventId`: ID do evento a ser deletado.

**O que faz?**
1. Conecta-se ao Google Calendar.
2. Envia uma requisição para deletar o evento identificado pelo `eventId`.
3. Se houver erro, exibe no console e lança uma exceção GraphQLError.

---

## ⚡ Como Executar

1. **Instale as dependências:**
```sh
npm install googleapis graphql
```

2. **Configure a autenticação:**
   - Crie um projeto no Google Cloud.
   - Ative a API do Google Calendar.
   - Gere credenciais OAuth e baixe o arquivo JSON.
   - Salve como `credentials.json` na raiz do projeto.
   - Execute o script de autenticação para gerar `token.json`.

3. **Exemplo de uso:**
```ts
import { createGoogleCalendarEvent, deleteGoogleCalendarEvent } from "./googleCalendar";
import { getGoogleAuthClient } from "./auth";

(async () => {
  const auth = await getGoogleAuthClient();
  
  // Criar evento
  const newEvent = await createGoogleCalendarEvent(auth, {
    summary: "Reunião Importante",
    description: "Discussão sobre próximos passos do projeto.",
    startDateTime: "2025-02-20T15:00:00-03:00",
    endDateTime: "2025-02-20T16:00:00-03:00",
    attendees: [{ email: "exemplo@email.com" }],
  });
  console.log("Evento criado:", newEvent);
  
  // Deletar evento
  await deleteGoogleCalendarEvent(auth, newEvent.id);
  console.log("Evento deletado com sucesso.");
})();
```

---