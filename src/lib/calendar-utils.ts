import {
    addMinutes,
    isSameDay,
    setHours,
    setMinutes,
    startOfDay,
    isWithinInterval,
    areIntervalsOverlapping,
    addHours,
    getHours
} from 'date-fns'

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
    preferredTime?: 'morning' | 'afternoon' | 'evening'
    source?: 'personal' | 'work' | 'shared'
    emoji?: string
    duration?: number
}

/**
 * Finds the first available slot of a given duration on a specific day.
 * @param date The date to search on.
 * @param durationMinutes Length of the slot.
 * @param existingEvents Current events to avoid.
 * @param startHour When to start looking (default 0 for any time).
 * @param endHour when to stop looking (default 23).
 */
export function findFirstAvailableSlot(
    date: Date,
    durationMinutes: number,
    existingEvents: CalendarEvent[],
    startHour: number = 0,
    endHour: number = 23
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
            return slotStart
        }

        // Skip to the end of the conflicting event
        currentPtr = conflictingEvent.end

        // Ensure we don't get stuck in an infinite loop if an event has 0 duration
        if (conflictingEvent.start.getTime() === conflictingEvent.end.getTime()) {
            currentPtr = addMinutes(currentPtr, 15)
        }
    }

    // Fallback if no slot found today: push to the same startHour tomorrow
    return findFirstAvailableSlot(addHours(date, 24), durationMinutes, existingEvents, startHour, endHour)
}

export interface IntelligentSettings {
    morning: { start: number, end: number }
    afternoon: { start: number, end: number }
    evening: { start: number, end: number }
    quietHours: { start: number, end: number } // e.g. 22 to 7
}

export const DEFAULT_SETTINGS: IntelligentSettings = {
    morning: { start: 6, end: 12 },
    afternoon: { start: 12, end: 18 },
    evening: { start: 18, end: 24 },
    quietHours: { start: 22, end: 7 }
}

/**
 * Re-schedules all ghost goals to avoid conflicts with confirmed events and respect DND.
 */
export function resolveConflicts(allEvents: CalendarEvent[], settings: IntelligentSettings = DEFAULT_SETTINGS): CalendarEvent[] {
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

        // We wrap the slot finding in a way that respects Quiet Hours
        const findSlotWithQuietHours = (date: Date, dur: number, currentEvents: CalendarEvent[]): Date => {
            let candidate = findFirstAvailableSlot(date, dur, currentEvents, startHour, endHour)

            // Basic Quiet Hours check - if the slot starts or ends during Quiet Hours, we need a better check
            // For now, let's just ensure startHour and endHour don't overlap with Quiet Hours in the simple case.
            // A more robust implementation would check every 15m block against the Quiet Hours range.
            return candidate
        }

        const duration = goal.duration || 60
        const newStart = findFirstAvailableSlot(goal.start, duration, resolved, startHour, endHour)

        // Final sanity check: if the newStart is within Quiet Hours, we'll try to push it past Quiet Hours end
        let finalStart = newStart
        const startHr = getHours(finalStart)

        // Simple Quiet Hours logic: if 10pm-7am
        const isQuietHours = (hr: number) => {
            if (settings.quietHours.start > settings.quietHours.end) {
                return hr >= settings.quietHours.start || hr < settings.quietHours.end
            }
            return hr >= settings.quietHours.start && hr < settings.quietHours.end
        }

        if (isQuietHours(startHr)) {
            // Push to end of Quiet Hours on that day (or next)
            let parsedQuietHoursEndDay = finalStart;
            // If Quiet Hours spans midnight (e.g. 22 to 7) and current hour is >= 22, the end is tomorrow
            if (settings.quietHours.start > settings.quietHours.end && startHr >= settings.quietHours.start) {
                parsedQuietHoursEndDay = addHours(finalStart, 24);
            }
            const quietHoursEndDate = setMinutes(setHours(parsedQuietHoursEndDay, settings.quietHours.end), 0)
            finalStart = findFirstAvailableSlot(quietHoursEndDate, duration, resolved, startHour, endHour)
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

