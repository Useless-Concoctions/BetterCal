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
import { CalendarEvent, resolveConflicts } from '../lib/calendar-utils'
import { useSession } from 'next-auth/react'

// Custom Hooks
import { useCalendarData } from '../hooks/calendar/useCalendarData'
import { useCommandParser } from '../hooks/calendar/useCommandParser'
import { useEventMutations } from '../hooks/calendar/useEventMutations'

// Extracted Components
import { CalendarHeader } from '../components/calendar/CalendarHeader'
import { MonthView } from '../components/calendar/MonthView'
import { WeekView } from '../components/calendar/WeekView'
import { DayView } from '../components/calendar/DayView'
import { ScheduleView } from '../components/calendar/ScheduleView'
import { CommandBar } from '../components/calendar/CommandBar'
import { SettingsModal } from '../components/calendar/SettingsModal'
import { EventPopover } from '../components/calendar/EventPopover'
import { SoCalView } from '../components/calendar/SoCalView'

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

import { useSunTheme } from '../hooks/calendar/useSunTheme'

export default function CalendarPage() {
  const { data: session } = useSession()
  const viewsContainerRef = useRef<HTMLDivElement | null>(null)

  useSunTheme()

  const {
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
    selectedCustomEmoji, setIsSettingsOpen,
    isSettingsOpen,
    settings, setSettings,
    weatherData
  } = useCalendarData(session)

  const parsedPreview = useCommandParser(
    commandInput,
    modalDateContext,
    events,
    settings,
    weatherData
  )

  const { handleCreateEvent, handleDeleteEvent, handleConfirmEvent } = useEventMutations(
    session,
    setEvents,
    settings,
    weatherData,
    setSelectedEvent,
    setCommandInput,
    setIsCommandOpen,
    setIsEventModalOpen
  )

  const onEnterCreateEvent = () => handleCreateEvent(parsedPreview, selectedCustomEmoji)

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
    <div
      className="app-wrapper"
      style={{
        position: 'relative',
        background: 'var(--background)',
        overflow: 'hidden'
      }}
    >
      <div
        className="socal-bg-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, var(--socal-grad-1), var(--socal-grad-2))',
          opacity: view === 'socal' ? 1 : 0,
          transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden'
        }}
      >

      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
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
              events={events}
              monthStart={monthStart}
              calendarDays={calendarDays}
              setPopoverPosition={setPopoverPosition}
              setModalDateContext={setModalDateContext}
              setIsCommandOpen={setIsCommandOpen}
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
              setIsCommandOpen={setIsCommandOpen}
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
              setIsCommandOpen={setIsCommandOpen}
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

          {view === 'socal' && (
            <SoCalView />
          )}
        </main>

        <CommandBar
          isCommandOpen={isCommandOpen}
          setIsCommandOpen={setIsCommandOpen}
          commandInput={commandInput}
          setCommandInput={setCommandInput}
          popoverPosition={popoverPosition}
          parsedPreview={parsedPreview}
          onEnter={onEnterCreateEvent}
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

      </div>
    </div>
  )
}

