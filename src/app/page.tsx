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
  const viewsContainerRef = useRef<HTMLDivElement>(null)

  // Fetch events on mount and when session/guest status changes
  useEffect(() => {
    if (session?.user?.id) {
      getEvents(session.user.id).then(data => {
        setEvents(resolveConflicts(data as CalendarEvent[], settings))
      })
    } else {
      // Always treat as guest if not logged in
      const savedEvents = localStorage.getItem('bettercal_guest_events')
      if (savedEvents) {
        try {
          const parsed = JSON.parse(savedEvents)
          setEvents(resolveConflicts(parsed.map((e: any) => ({ ...e, start: new Date(e.start), end: new Date(e.end) })), settings))
        } catch (e) {
          console.error("Failed to parse guest events", e)
        }
      }
    }
  }, [session, settings])

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
    const isGoal = /^goal:|^smart:/i.test(commandInput)
    let tempTitle = commandInput.replace(/^goal:|^smart:/i, '').trim()

    let start = refDate
    let hasTime = false
    let duration = 60
    let preferredTime: 'morning' | 'afternoon' | 'evening' | undefined = undefined
    let frequency: 'daily' | 'weekly' | 'monthly' | undefined = undefined

    const freqMatch = tempTitle.match(/\bevery\s*day\b|\bdaily\b|\bweekly\b|\bevery\s+week\b/i)
    if (freqMatch) {
      const match = freqMatch[0].toLowerCase()
      if (match.includes('day') || match.includes('daily')) frequency = 'daily'
      else if (match.includes('week')) frequency = 'weekly'
      tempTitle = tempTitle.replace(freqMatch[0], '').replace(/\s+/g, ' ').trim()
    }

    const prefMatch = tempTitle.match(/\bmorning\b|\bafternoon\b|\bevening\b/i)
    if (prefMatch) {
      preferredTime = prefMatch[0].toLowerCase() as any
      tempTitle = tempTitle.replace(prefMatch[0], '').replace(/\s+/g, ' ').trim()
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

    return { title: title || 'Untitled Event', start, hasTime, duration, preferredTime, frequency, isGoal }
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
      isGoal: parsedPreview.isGoal,
      confirmed: !parsedPreview.isGoal,
    }

    const instances = []
    const numInstances = parsedPreview.frequency === 'daily' ? 7 : (parsedPreview.frequency === 'weekly' ? 4 : 1)

    for (let i = 0; i < numInstances; i++) {
      const start = i === 0 ? parsedPreview.start : (
        parsedPreview.frequency === 'daily' ? addDays(parsedPreview.start, i) : addDays(parsedPreview.start, i * 7)
      )
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
      setEvents(prev => resolveConflicts([...prev, ...guestEvents], settings))
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
