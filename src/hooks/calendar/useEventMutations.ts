import { Session } from 'next-auth'
import { addDays } from 'date-fns'
import { CalendarEvent, IntelligentSettings, resolveConflicts } from '../../lib/calendar-utils'
import { WeatherData } from '../../lib/weather-utils'
import { createEvent, deleteEvent, updateEvent, getEvents } from '../../lib/actions'

const getEmojiForTitle = (title: string): string => {
    const t = title.toLowerCase()
    if (t.includes('run') || t.includes('gym') || t.includes('workout')) return '🏃'
    if (t.includes('dinner') || t.includes('lunch') || t.includes('food') || t.includes('meal')) return '🍲'
    if (t.includes('meditation') || t.includes('yoga') || t.includes('zen')) return '🧘'
    if (t.includes('code') || t.includes('dev') || t.includes('work')) return '💻'
    return '📅'
}

export function useEventMutations(
    session: Session | null,
    setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>,
    settings: IntelligentSettings,
    weatherData: WeatherData | null,
    setSelectedEvent: (e: CalendarEvent | null) => void,
    setCommandInput: (val: string) => void,
    setIsCommandOpen: (open: boolean) => void,
    setIsEventModalOpen: (open: boolean) => void
) {

    const handleCreateEvent = async (parsedPreview: any, selectedCustomEmoji: string | null) => {
        if (!parsedPreview) return

        const title = parsedPreview.isGoal ? `Goal: ${parsedPreview.title}` : parsedPreview.title
        const emoji = selectedCustomEmoji || getEmojiForTitle(title)

        const baseEventData = {
            title,
            emoji,
            duration: parsedPreview.duration,
            preferredTime: parsedPreview.preferredTime,
            frequency: parsedPreview.frequency,
            frequencyCount: parsedPreview.frequencyCount,
            weatherConstraint: parsedPreview.weatherConstraint,
            isGoal: parsedPreview.isGoal,
            confirmed: !parsedPreview.isGoal,
        }

        const instances = []
        let numInstances = 1
        if (parsedPreview.frequency === 'daily') numInstances = 7
        else if (parsedPreview.frequency === 'weekly') numInstances = parsedPreview.frequencyCount || 1
        else if (parsedPreview.frequency === 'monthly') numInstances = parsedPreview.frequencyCount || 1

        for (let i = 0; i < numInstances; i++) {
            let start = parsedPreview.start;
            if (parsedPreview.frequency === 'daily') {
                start = addDays(parsedPreview.start, i)
            } else if (parsedPreview.frequency === 'weekly') {
                // If "5 times a week", spread them by about 1.4 days each
                const gap = 7 / (numInstances || 1)
                start = addDays(parsedPreview.start, Math.floor(i * gap))
            } else if (parsedPreview.frequency === 'monthly') {
                const gap = 30 / (numInstances || 1)
                start = addDays(parsedPreview.start, Math.floor(i * gap))
            }

            instances.push({
                ...baseEventData,
                start,
                end: new Date(start.getTime() + parsedPreview.duration * 60 * 1000),
            })
        }

        if (session?.user?.id) {
            for (const inst of instances) {
                await createEvent(session.user.id, inst)
            }
            const updated = await getEvents(session.user.id)
            setEvents(resolveConflicts(updated as CalendarEvent[], settings, weatherData))
        } else {
            const guestEvents: CalendarEvent[] = instances.map(inst => ({
                ...inst,
                id: Math.random().toString(36).substr(2, 9),
            }))
            setEvents(prev => resolveConflicts([...prev, ...guestEvents], settings, weatherData))
        }

        setCommandInput('')
        setIsCommandOpen(false)
        setIsEventModalOpen(false)
    }

    const handleDeleteEvent = async (id: string) => {
        if (session?.user?.id) {
            await deleteEvent(id)
            const updated = await getEvents(session.user.id)
            setEvents(resolveConflicts(updated as CalendarEvent[], settings, weatherData))
        } else {
            setEvents(prev => prev.filter(ev => ev.id !== id))
        }
        setSelectedEvent(null)
    }

    const handleConfirmEvent = async (id: string) => {
        if (session?.user?.id) {
            await updateEvent(id, { confirmed: true })
            const updated = await getEvents(session.user.id)
            setEvents(resolveConflicts(updated as CalendarEvent[], settings, weatherData))
        } else {
            setEvents(prev => resolveConflicts(prev.map(ev => ev.id === id ? { ...ev, confirmed: true } : ev), settings, weatherData))
        }
        setSelectedEvent(null)
    }

    return {
        handleCreateEvent,
        handleDeleteEvent,
        handleConfirmEvent
    }
}
