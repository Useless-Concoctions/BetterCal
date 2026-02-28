import { google } from 'googleapis'
import { prisma } from './prisma'
import { CalendarEvent } from './calendar-utils'

export async function syncGoogleCalendar(userId: string) {
    // 1. Get the Google account for this user from the database
    const account = await prisma.account.findFirst({
        where: {
            userId,
            provider: 'google',
        },
    })

    if (!account || !account.access_token) {
        throw new Error('Google account not connected or access token missing')
    }

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_ID,
        process.env.GOOGLE_SECRET
    )

    auth.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
    })

    const calendar = google.calendar({ version: 'v3', auth })

    try {
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 50,
            singleEvents: true,
            orderBy: 'startTime',
        })

        const googleEvents = response.data.items || []

        // 2. Map Google events to our CalendarEvent format
        const mappedEvents: Omit<CalendarEvent, 'id'>[] = googleEvents.map((gEvent) => ({
            title: gEvent.summary || 'Untitled Google Event',
            start: new Date(gEvent.start?.dateTime || gEvent.start?.date || ''),
            end: new Date(gEvent.end?.dateTime || gEvent.end?.date || ''),
            location: gEvent.location || '',
            locationType: 'specific',
            source: 'shared', // Mark as shared/external
            emoji: '🌐',
        }))

        // 3. (Optional) Deduplicate and persist to our database
        // For now, we just return them for testing logic
        return mappedEvents
    } catch (error) {
        console.error('Error syncing Google Calendar:', error)
        throw error
    }
}
