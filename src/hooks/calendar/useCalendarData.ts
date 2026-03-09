import { useState, useEffect } from 'react'
import { CalendarEvent, IntelligentSettings, DEFAULT_SETTINGS, resolveConflicts } from '../../lib/calendar-utils'
import { getForecast, WeatherData } from '../../lib/weather-utils'
import { getEvents } from '../../lib/actions'
import { Session } from 'next-auth'

export function useCalendarData(session: Session | null) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState<'month' | 'week' | 'day' | 'schedule' | 'socal'>('month')
    const [isViewsOpen, setIsViewsOpen] = useState(false)
    const [isCommandOpen, setIsCommandOpen] = useState(false)
    const [isEventModalOpen, setIsEventModalOpen] = useState(false)
    const [modalDateContext, setModalDateContext] = useState<Date | null>(null)
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
    const [commandInput, setCommandInput] = useState('')
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [popoverPosition, setPopoverPosition] = useState<{ x: number, y: number, width: number, height: number } | null>(null)
    const [selectedCustomEmoji, setSelectedCustomEmoji] = useState<string | null>(null)
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [settings, setSettings] = useState<IntelligentSettings>(DEFAULT_SETTINGS)
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null)

    // Fetch forecast on mount
    useEffect(() => {
        getForecast().then(setWeatherData)
    }, [])

    // Fetch events on mount and when session/guest status changes
    useEffect(() => {
        if (session?.user?.id) {
            getEvents(session.user.id).then(data => {
                setEvents(resolveConflicts(data as CalendarEvent[], settings, weatherData))
            })
        } else {
            // Always treat as guest if not logged in
            const savedEvents = localStorage.getItem('bettercal_guest_events')
            if (savedEvents) {
                try {
                    const parsed = JSON.parse(savedEvents)
                    setEvents(resolveConflicts(parsed.map((e: any) => ({ ...e, start: new Date(e.start), end: new Date(e.end) })), settings, weatherData))
                } catch (e) {
                    console.error("Failed to parse guest events", e)
                }
            }
        }
    }, [session, settings, weatherData])

    // Persist local events when not logged in
    useEffect(() => {
        if (!session) {
            localStorage.setItem('bettercal_guest_events', JSON.stringify(events))
        }
    }, [events, session])

    // Persist settings
    useEffect(() => {
        const saved = localStorage.getItem('bettercal_settings')
        if (saved) {
            try {
                setSettings(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse settings", e)
            }
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('bettercal_settings', JSON.stringify(settings))
    }, [settings])

    return {
        currentDate, setCurrentDate,
        view, setView,
        isViewsOpen, setIsViewsOpen,
        isCommandOpen, setIsCommandOpen,
        isEventModalOpen, setIsEventModalOpen,
        modalDateContext, setModalDateContext,
        selectedEvent, setSelectedEvent,
        commandInput, setCommandInput,
        events, setEvents,
        popoverPosition, setPopoverPosition,
        selectedCustomEmoji, setSelectedCustomEmoji,
        isEmojiPickerOpen, setIsEmojiPickerOpen,
        isSettingsOpen, setIsSettingsOpen,
        settings, setSettings,
        weatherData, setWeatherData
    }
}
