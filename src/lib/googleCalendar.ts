import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: 'https://www.googleapis.com/auth/calendar',
});

const calendar = google.calendar({
  version: 'v3',
  auth,
});

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

interface CalendarEvent {
  summary: string;
  description: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees?: { email: string }[];
}

export async function createCalendarEvent(event: CalendarEvent) {
  if (!CALENDAR_ID) {
    console.error('GOOGLE_CALENDAR_ID is not defined');
    return null;
  }
  try {
    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: event,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

export async function updateCalendarEvent(eventId: string, event: CalendarEvent) {
  if (!CALENDAR_ID) {
    console.error('GOOGLE_CALENDAR_ID is not defined');
    return null;
  }
  try {
    const response = await calendar.events.update({
      calendarId: CALENDAR_ID,
      eventId,
      requestBody: event,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
}

export async function deleteCalendarEvent(eventId: string) {
  if (!CALENDAR_ID) {
    console.error('GOOGLE_CALENDAR_ID is not defined');
    return null;
  }
  try {
    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId,
    });
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
}
