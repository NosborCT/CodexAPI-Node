
import { google, calendar_v3 } from "googleapis";
import { GraphQLError } from "graphql";

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
    // Verifica se o erro é um objeto e tem a propriedade 'message'
    if (error instanceof Error) {
      console.error(
        "Erro ao criar o evento no Google Calendar:",
        error.message
      );
    } else {
      console.error(
        "Erro desconhecido ao criar o evento no Google Calendar:",
        error
      );
    }
    throw new GraphQLError(
      "Não foi possível criar o evento no Google Calendar."
    );
  }
};

export const deleteGoogleCalendarEvent = async (auth: any, eventId: string) => {
  const calendar = google.calendar({ version: "v3", auth });
  try {
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });
  } catch (error) {
    // Verifica se o erro é um objeto e tem a propriedade 'message'
    if (error instanceof Error) {
      console.error(
        "Erro ao deletar evento do Google Calendar:",
        error.message
      );
    } else {
      console.error(
        "Erro desconhecido ao deletar o evento do Google Calendar:",
        error
      );
    }
    throw new GraphQLError(
      "Não foi possível deletar o evento no Google Calendar."
    );
  }
};