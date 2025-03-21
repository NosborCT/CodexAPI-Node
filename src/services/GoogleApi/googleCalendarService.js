const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const credentialsPath = path.join(__dirname, "credentials.json");
const tokenPath = path.join(__dirname, "token.json");

// Configura e autentica o cliente OAuth2
const getAuthenticatedClient = async () => {
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Carrega o token salvo
  const token = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
  oAuth2Client.setCredentials(token);

  return oAuth2Client;
};

// Exemplo: Criar um evento no Google Calendar
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
