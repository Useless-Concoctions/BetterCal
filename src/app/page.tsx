"use client"

import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  startOfDay,
  setHours,
  setMinutes
} from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import * as chrono from 'chrono-node'
import { CalendarEvent, resolveConflicts, IntelligentSettings, DEFAULT_SETTINGS } from '../lib/calendar-utils'
import EmojiPicker from 'emoji-picker-react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { getEvents, createEvent, updateEvent, deleteEvent } from '../lib/actions'

// Extracted Components
import { CalendarHeader } from '../components/calendar/CalendarHeader'
import { MonthView } from '../components/calendar/MonthView'
import { WeekView } from '../components/calendar/WeekView'
import { DayView } from '../components/calendar/DayView'
import { ScheduleView } from '../components/calendar/ScheduleView'
import { CommandBar } from '../components/calendar/CommandBar'
import { SettingsModal } from '../components/calendar/SettingsModal'
import { EventPopover } from '../components/calendar/EventPopover'

import './globals.css'

const getEmojiForTitle = (title: string): string => {
  const t = title.toLowerCase()
  if (t.includes('run') || t.includes('gym') || t.includes('workout')) return '🏃'
  if (t.includes('dinner') || t.includes('lunch') || t.includes('food') || t.includes('meal')) return '🍲'
  if (t.includes('meditation') || t.includes('yoga') || t.includes('zen')) return '🧘'
  if (t.includes('code') || t.includes('dev') || t.includes('work')) return '💻'
  return '📅'
}

import { getForecast, WeatherData } from '../lib/weather-utils'

export default function CalendarPage() {
  const { data: session } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day' | 'schedule'>('month')
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
  const viewsContainerRef = useRef<HTMLDivElement>(null)

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

  const parsedPreview = useMemo(() => {
    if (!commandInput.trim()) return null
    const refDate = modalDateContext || new Date()
    let tempTitle = commandInput

    const isGoal = tempTitle.toLowerCase().startsWith('goal:') || tempTitle.toLowerCase().startsWith('smart goal:')
    tempTitle = tempTitle.replace(/^(goal:|smart goal:)/i, '').trim()

    let start = refDate
    let hasTime = false
    let duration = 60
    let preferredTime: 'morning' | 'afternoon' | 'evening' | undefined = undefined
    let weatherConstraint: 'outdoor' | 'clear' | 'none' = 'none'
    let frequency: 'daily' | 'weekly' | 'monthly' | undefined = undefined
    let frequencyCount: number | undefined = undefined

    // Improved frequency detection: "every day", "daily", "3 times a week", "once a month"
    const freqCountMatch = tempTitle.match(/(\d+|once|twice)\s*times?\s*(a|per|every)?\s*(week|month|day|weekly|monthly|daily)/i)
    if (freqCountMatch) {
      const countStr = freqCountMatch[1].toLowerCase()
      const unitStr = freqCountMatch[3].toLowerCase()

      if (countStr === 'once') frequencyCount = 1
      else if (countStr === 'twice') frequencyCount = 2
      else frequencyCount = parseInt(countStr)

      if (unitStr.includes('day')) frequency = 'daily'
      else if (unitStr.includes('week')) frequency = 'weekly'
      else if (unitStr.includes('month')) frequency = 'monthly'

      tempTitle = tempTitle.replace(freqCountMatch[0], '').replace(/\s+/g, ' ').trim()
    } else {
      const simpleFreqMatch = tempTitle.match(/\bevery\s*day\b|\bdaily\b|\bweekly\b|\bevery\s+week\b/i)
      if (simpleFreqMatch) {
        const match = simpleFreqMatch[0].toLowerCase()
        if (match.includes('day') || match.includes('daily')) frequency = 'daily'
        else if (match.includes('week')) frequency = 'weekly'
        frequencyCount = 1
        tempTitle = tempTitle.replace(simpleFreqMatch[0], '').replace(/\s+/g, ' ').trim()
      }
    }

    const prefMatch = tempTitle.match(/\bmorning\b|\bafternoon\b|\bevening\b/i)
    if (prefMatch) {
      preferredTime = prefMatch[0].toLowerCase() as any
      tempTitle = tempTitle.replace(prefMatch[0], '').replace(/\s+/g, ' ').trim()
    } else if (isGoal) {
      // Subtle inference: High energy -> Morning, Admin -> Afternoon, Leisure -> Evening
      const t = tempTitle.toLowerCase()
      if (t.match(/\b(gym|workout|run|code|deep work|focus|strategy|writing|study)\b/i)) {
        preferredTime = 'morning'
      } else if (t.match(/\b(admin|email|errand|grocery|groceries|shopping|call|sync|bills)\b/i)) {
        preferredTime = 'afternoon'
      } else if (t.match(/\b(dinner|relax|read|reading|movie|meditation|yoga|rest)\b/i)) {
        preferredTime = 'evening'
      }
    }

    const weatherMatch = tempTitle.match(/#(outdoor|outside|clear|sunny)\b/i)
    if (weatherMatch) {
      const tag = weatherMatch[1].toLowerCase()
      if (tag === 'clear' || tag === 'sunny') weatherConstraint = 'clear'
      else weatherConstraint = 'outdoor'
      tempTitle = tempTitle.replace(weatherMatch[0], '').replace(/\s+/g, ' ').trim()
    }

    const durationMatch = tempTitle.match(/(\d+)\s*(m|min|minute|minutes|h|hr|hour|hours)\b/i)
    if (durationMatch) {
      const value = parseInt(durationMatch[1])
      const unit = durationMatch[2].toLowerCase()
      if (unit.startsWith('h')) duration = value * 60
      else duration = value
      tempTitle = tempTitle.replace(durationMatch[0], '').replace(/\s+/g, ' ').trim()
    }

    const results = chrono.parse(tempTitle, refDate, { forwardDate: true })
    if (results.length > 0) {
      const result = results[0]
      start = result.start.date()
      hasTime = result.start.isCertain('hour')
      tempTitle = tempTitle.replace(result.text, '').replace(/\s+/g, ' ').trim()
      if (!hasTime && modalDateContext) {
        start = setHours(setMinutes(start, modalDateContext.getMinutes()), modalDateContext.getHours())
      }
    } else {
      start = modalDateContext ? setHours(setMinutes(start, modalDateContext.getMinutes()), modalDateContext.getHours()) : setHours(setMinutes(start, 0), 10)
    }

    let title = tempTitle
      .replace(/#(focus|social|health|urgent)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

    return { title: title || 'Untitled Event', start, hasTime, duration, preferredTime, frequency, frequencyCount, isGoal, weatherConstraint }
  }, [commandInput, modalDateContext])

  const handleCreateEvent = async () => {
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
    } else {
      setEvents(prev => prev.filter(ev => ev.id !== id))
    }
    setSelectedEvent(null)
  }

  const handleConfirmEvent = async (id: string) => {
    if (session?.user?.id) {
      await updateEvent(id, { confirmed: true })
      // Logic to refresh events after server action
      const updated = await getEvents(session.user.id)
      setEvents(resolveConflicts(updated as CalendarEvent[], settings))
    } else {
      setEvents(prev => resolveConflicts(prev.map(ev => ev.id === id ? { ...ev, confirmed: true } : ev), settings))
    }
    setSelectedEvent(null)
  }

  const monthStart = startOfMonth(currentDate)
  const startDate = startOfWeek(monthStart)
  const calendarDays = Array.from({ length: 42 }).map((_, i) => addDays(startDate, i))

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate)
    return eachDayOfInterval({ start, end: addDays(start, 6) })
  }, [currentDate])

  const groupedEvents = useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>()
    events.forEach(event => {
      const dateKey = format(startOfDay(event.start), 'yyyy-MM-dd')
      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      groups.get(dateKey)?.push(event)
    })

    return Array.from(groups.entries())
      .map(([dateStr, items]) => ({
        date: new Date(dateStr + 'T12:00:00'), // Use noon to avoid TZ shifts
        events: items.sort((a, b) => a.start.getTime() - b.start.getTime())
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [events])

  return (
    <div className="app-wrapper">
      <CalendarHeader
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        view={view}
        setView={setView}
        isViewsOpen={isViewsOpen}
        setIsViewsOpen={setIsViewsOpen}
        setIsCommandOpen={setIsCommandOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        setPopoverPosition={setPopoverPosition}
        viewsContainerRef={viewsContainerRef}
        session={session}
      />

      <main className="main-stage">
        {view === 'month' && (
          <MonthView
            currentDate={currentDate}
            events={events}
            monthStart={monthStart}
            calendarDays={calendarDays}
            setPopoverPosition={setPopoverPosition}
            setModalDateContext={setModalDateContext}
            setIsEventModalOpen={setIsEventModalOpen}
            setSelectedEvent={setSelectedEvent}
            setEvents={setEvents}
            settings={settings}
            resolveConflicts={resolveConflicts}
            isGuest={!session}
            weatherData={weatherData}
          />
        )}

        {view === 'week' && (
          <WeekView
            weekDays={weekDays}
            events={events}
            setPopoverPosition={setPopoverPosition}
            setModalDateContext={setModalDateContext}
            setIsEventModalOpen={setIsEventModalOpen}
            setSelectedEvent={setSelectedEvent}
            setEvents={setEvents}
            settings={settings}
            resolveConflicts={resolveConflicts}
            isGuest={!session}
            weatherData={weatherData}
          />
        )}

        {view === 'day' && (
          <DayView
            currentDate={currentDate}
            events={events}
            setPopoverPosition={setPopoverPosition}
            setModalDateContext={setModalDateContext}
            setIsEventModalOpen={setIsEventModalOpen}
            setSelectedEvent={setSelectedEvent}
            setEvents={setEvents}
            settings={settings}
            resolveConflicts={resolveConflicts}
            isGuest={!session}
            weatherData={weatherData}
          />
        )}

        {view === 'schedule' && (
          <ScheduleView
            groupedEvents={groupedEvents}
            setPopoverPosition={setPopoverPosition}
            setSelectedEvent={setSelectedEvent}
          />
        )}
      </main>

      <CommandBar
        isCommandOpen={isCommandOpen}
        setIsCommandOpen={setIsCommandOpen}
        commandInput={commandInput}
        setCommandInput={setCommandInput}
        popoverPosition={popoverPosition}
        parsedPreview={parsedPreview}
        onEnter={handleCreateEvent}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        setIsOpen={setIsSettingsOpen}
        settings={settings}
        setSettings={setSettings}
        popoverPosition={popoverPosition}
      />

      {selectedEvent && (
        <EventPopover
          event={selectedEvent}
          popoverPosition={popoverPosition}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDeleteEvent}
          onConfirm={handleConfirmEvent}
        />
      )}

      {/* Settings and Event Modal logic would also be extracted or kept clean here */}
      <div style={{ position: 'fixed', bottom: 20, right: 20 }}>
        {session ? (
          <button onClick={() => signOut()} className="text-btn muted" style={{ fontSize: '12px' }}>Sign Out</button>
        ) : (
          <button onClick={() => signIn()} className="text-btn muted" style={{ fontSize: '12px' }}>Sign In</button>
        )}
      </div>
    </div>
  )
}
