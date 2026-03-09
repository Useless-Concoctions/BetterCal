import {
    addMinutes,
    isSameDay,
    setHours,
    setMinutes,
    startOfDay,
    areIntervalsOverlapping,
    addHours,
    getHours
} from 'date-fns'
import { WeatherData, isWeatherSuitable } from './weather-utils'

export interface CalendarEvent {
    id: string
    title: string
    start: Date
    end: Date
    location?: string
    locationType?: 'anywhere' | 'specific'
    isGoal?: boolean
    confirmed?: boolean
    frequency?: 'daily' | 'weekly' | 'monthly'
    frequencyCount?: number
    preferredTime?: 'morning' | 'afternoon' | 'evening'
    source?: 'personal' | 'work' | 'shared' | 'ingested' | 'subscription'
    emoji?: string
    isPublic?: boolean
    calendarId?: string
    duration?: number
    weatherConstraint?: string
}

export type PopoverPosition = { x: number; y: number; width: number; height: number } | null;

export function findFirstAvailableSlot(
    date: Date,
    durationMinutes: number,
    existingEvents: CalendarEvent[],
    startHour: number = 0,
    endHour: number = 23,
    weather: WeatherData | null = null,
    weatherConstraint?: string
): Date {
    // If the provided date is today and its time is already past startHour, use the provided date's time
    let searchStart = setMinutes(setHours(startOfDay(date), startHour), 0)

    // If the date passed in already has a specific time (e.g. from DND correction), 
    // and that time is later than the generic startHour, we should respect it
    if (getHours(date) > startHour || (getHours(date) === startHour && date.getMinutes() > 0)) {
        searchStart = date
    }

    if (isSameDay(searchStart, new Date())) {
        const now = new Date()
        if (now > searchStart) {
            // Round up to next 15 min block
            const minutes = now.getMinutes()
            const roundedMinutes = Math.ceil(minutes / 15) * 15
            searchStart = setMinutes(setHours(now, now.getHours()), roundedMinutes)
        }
    }

    const dayEnd = setMinutes(setHours(startOfDay(date), endHour), 59)

    const dayEvents = existingEvents
        .filter(e => isSameDay(e.start, date))
        .sort((a, b) => a.start.getTime() - b.start.getTime())

    let currentPtr = searchStart

    while (addMinutes(currentPtr, durationMinutes) <= dayEnd) {
        const slotStart = currentPtr
        const slotEnd = addMinutes(currentPtr, durationMinutes)

        const conflictingEvent = dayEvents.find(event =>
            areIntervalsOverlapping(
                { start: slotStart, end: slotEnd },
                { start: event.start, end: event.end }
            )
        )

        if (!conflictingEvent) {
            // Check weather suitability
            if (isWeatherSuitable(slotStart, weather, weatherConstraint)) {
                return slotStart
            }
            // If weather not suitable, treat as a "conflict" and advance
            currentPtr = addMinutes(currentPtr, 30) // Try 30 mins later
            continue
        }

        // Skip to the end of the conflicting event
        currentPtr = conflictingEvent.end

        // Ensure we don't get stuck in an infinite loop if an event has 0 duration
        if (conflictingEvent.start.getTime() === conflictingEvent.end.getTime()) {
            currentPtr = addMinutes(currentPtr, 15)
        }
    }

    // Fallback if no slot found today: push to the startHour of tomorrow
    const tomorrowAtStart = setMinutes(setHours(startOfDay(addHours(date, 24)), startHour), 0)
    return findFirstAvailableSlot(tomorrowAtStart, durationMinutes, existingEvents, startHour, endHour, weather, weatherConstraint)
}

export interface IntelligentSettings {
    morning: { start: number, end: number }
    afternoon: { start: number, end: number }
    evening: { start: number, end: number }
    quietHours: { start: number, end: number } // e.g. 22 to 7
    interests: string[]
    location: string
}

export const DEFAULT_SETTINGS: IntelligentSettings = {
    morning: { start: 6, end: 12 },
    afternoon: { start: 12, end: 18 },
    evening: { start: 18, end: 24 },
    quietHours: { start: 22, end: 7 },
    interests: ['Technology', 'Sports'],
    location: 'Toronto, Canada'
}

/**
 * Re-schedules all ghost goals to avoid conflicts, respect DND, and account for weather context.
 */
export function resolveConflicts(
    allEvents: CalendarEvent[],
    settings: IntelligentSettings = DEFAULT_SETTINGS,
    weather: WeatherData | null = null
): CalendarEvent[] {
    const hardEvents = allEvents.filter(e => !e.isGoal || e.confirmed)
    const ghostGoals = allEvents.filter(e => e.isGoal && !e.confirmed)

    // Start with hard events
    const resolved: CalendarEvent[] = [...hardEvents]

    // Process each ghost goal and find its best position
    ghostGoals.forEach(goal => {
        let { start: startHour, end: endHour } = settings.morning

        if (goal.preferredTime === 'afternoon') {
            ({ start: startHour, end: endHour } = settings.afternoon)
        } else if (goal.preferredTime === 'evening') {
            ({ start: startHour, end: endHour } = settings.evening)
        }

        const duration = goal.duration || 60

        // Liquid Scheduling: Find the first available slot starting from the goal's original start date
        // but allowing it to move forward indefinitely until a slot is found.
        let finalStart = findFirstAvailableSlot(goal.start, duration, resolved, startHour, endHour, weather, goal.weatherConstraint)

        // Simple Quiet Hours logic check
        const isQuietHours = (hr: number) => {
            if (settings.quietHours.start > settings.quietHours.end) {
                return hr >= settings.quietHours.start || hr < settings.quietHours.end
            }
            return hr >= settings.quietHours.start && hr < settings.quietHours.end
        }

        const startHr = getHours(finalStart)
        if (isQuietHours(startHr)) {
            let parsedQuietHoursEndDay = finalStart;
            if (settings.quietHours.start > settings.quietHours.end && startHr >= settings.quietHours.start) {
                parsedQuietHoursEndDay = addHours(finalStart, 24);
            }
            const quietHoursEndDate = setMinutes(setHours(parsedQuietHoursEndDay, settings.quietHours.end), 0)
            finalStart = findFirstAvailableSlot(quietHoursEndDate, duration, resolved, startHour, endHour, weather, goal.weatherConstraint)
        }

        const newEnd = addMinutes(finalStart, duration)

        resolved.push({
            ...goal,
            start: finalStart,
            end: newEnd
        })
    })

    return resolved
}

