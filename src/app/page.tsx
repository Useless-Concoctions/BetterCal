"use client"

import React, { useState, useMemo, useEffect } from 'react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addDays,
  isToday,
  setHours,
  setMinutes,
  isWithinInterval,
  getHours,
  startOfDay
} from 'date-fns'
import { ChevronDown, ArrowUpRight, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './globals.css'

type EventType = 'focus' | 'social' | 'health' | 'admin' | 'urgent'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: EventType
  location?: string
  locationType?: 'anywhere' | 'specific'
  isGoal?: boolean
  confirmed?: boolean
  frequency?: 'daily' | 'weekly' | 'monthly'
  preferredTime?: 'morning' | 'afternoon' | 'evening'
  source?: 'personal' | 'work' | 'shared'
}

const getEventType = (title: string): EventType => {
  const t = title.toLowerCase()
  if (t.includes('urgent') || t.includes('deadline') || t.includes('asap')) return 'urgent'
  if (t.includes('gym') || t.includes('run') || t.includes('health') || t.includes('meditate')) return 'health'
  if (t.includes('meet') || t.includes('sync') || t.includes('dinner') || t.includes('coffee') || t.includes('call')) return 'social'
  if (t.includes('focus') || t.includes('code') || t.includes('project') || t.includes('work')) return 'focus'
  return 'admin'
}

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Focus: Kernel Development',
    start: setMinutes(setHours(new Date(), 9), 0),
    end: setMinutes(setHours(new Date(), 12), 0),
    type: 'focus',
  },
  {
    id: '2',
    title: 'Smart Goal: Meditation',
    start: setMinutes(setHours(new Date(), 8), 0),
    end: setMinutes(setHours(new Date(), 8), 20),
    type: 'health',
    isGoal: true,
    confirmed: false,
    frequency: 'daily'
  },
  {
    id: '3',
    title: 'Quick Sync',
    start: setMinutes(setHours(new Date(), 14), 0),
    end: setMinutes(setHours(new Date(), 14), 30),
    type: 'social',
  },
  {
    id: '4',
    title: 'Dinner with Sarah',
    start: setMinutes(setHours(addDays(new Date(), 1), 19), 0),
    end: setMinutes(setHours(addDays(new Date(), 1), 21), 0),
    type: 'social',
  },
  {
    id: '5',
    title: 'Morning Run',
    start: setMinutes(setHours(addDays(new Date(), 2), 7), 0),
    end: setMinutes(setHours(addDays(new Date(), 2), 8), 0),
    type: 'health',
  }
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day' | 'schedule'>('month')
  const [isViewsOpen, setIsViewsOpen] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [commandInput, setCommandInput] = useState('')
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS)
  const [activeVibe, setActiveVibe] = useState<EventType>('admin')

  // INNOVATIVE: Real-time 'Vibe' calculation based on current time
  useEffect(() => {
    const checkVibe = () => {
      const now = new Date()
      const currentEvent = events.find(event =>
        isWithinInterval(now, { start: event.start, end: event.end })
      )

      const vibe = currentEvent ? currentEvent.type : 'admin'
      setActiveVibe(vibe)

      // Update CSS Variable for global UI tinting
      const colorMap = {
        focus: '#1e40af',
        social: '#be123c',
        health: '#15803d',
        admin: '#475569',
        urgent: '#b45309'
      }
      document.documentElement.style.setProperty('--current-vibe', colorMap[vibe])
      document.documentElement.style.setProperty('--border', vibe === 'admin' ? '#f0f0f0' : `${colorMap[vibe]}22`)
    }

    checkVibe()
    const timer = setInterval(checkVibe, 60000)
    return () => clearInterval(timer)
  }, [events])

  const goalStats = useMemo(() => {
    const allGoals = events.filter(e => e.isGoal)
    const confirmed = allGoals.filter(e => e.confirmed).length
    const total = allGoals.length
    const percent = total > 0 ? Math.round((confirmed / total) * 100) : 0
    return { confirmed, total, percent }
  }, [events])

  const parsedPreview = useMemo(() => {
    if (!commandInput) {
      return { title: 'Untitled Event', date: 'Tomorrow', time: '10:00 AM', type: 'admin' as EventType }
    }

    const input = commandInput.toLowerCase()

    // SMART NLP: Apple-style "dumb" parsing fix
    let title = commandInput
    let time = '10:00 AM'
    let dateStr = 'Tomorrow'

    // 1. Time Detection (Improved)
    const timeMatch = commandInput.match(/(\d{1,2}(?::\d{2})?\s*(am|pm))/i)
    if (timeMatch) {
      time = timeMatch[0].toUpperCase()
      title = title.replace(new RegExp(`\\s*at\\s*${timeMatch[0]}\\s*`, 'i'), ' ')
      title = title.replace(new RegExp(`\\s*${timeMatch[0]}\\s*`, 'i'), ' ')
    }

    // 2. Date Detection
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    days.forEach(day => {
      if (input.includes(day)) dateStr = day.charAt(0).toUpperCase() + day.slice(1);
    });
    if (input.includes('today')) dateStr = 'Today';
    if (input.includes('tomorrow')) dateStr = 'Tomorrow';

    // 3. Cleanup Title
    ['today', 'tomorrow', 'next week', 'this friday'].forEach((word: string) => {
      title = title.replace(new RegExp(`\\s*${word}\\s*`, 'i'), ' ')
    })
    title = title.replace(/^goal:|^smart:/i, '').trim()

    return {
      title: title || 'Untitled Event',
      date: dateStr,
      time,
      type: getEventType(commandInput)
    }
  }, [commandInput])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'c' && !isCommandOpen) {
        e.preventDefault()
        setIsCommandOpen(true)
      }
      if (e.key === 'Escape' && isCommandOpen) {
        setIsCommandOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCommandOpen])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })
  const weekStart = startOfWeek(currentDate)
  const weekEnd = endOfWeek(currentDate)
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const groupedEvents = useMemo(() => {
    const today = startOfDay(new Date())
    const nextMonth = addDays(today, 60)

    const groups: { [key: string]: CalendarEvent[] } = {}

    events.forEach(event => {
      const d = startOfDay(event.start)
      if (d >= today && d <= nextMonth) {
        const key = format(d, 'yyyy-MM-dd')
        if (!groups[key]) groups[key] = []
        groups[key].push(event)
      }
    })

    return Object.entries(groups)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dateStr, dayEvents]) => ({
        date: new Date(dateStr + 'T00:00:00'),
        events: dayEvents.sort((a, b) => a.start.getTime() - b.start.getTime())
      }))
  }, [events])

  return (
    <div className="app-wrapper">
      <nav className="top-nav">
        <div className="nav-left">
          <div
            className="logo-text"
            onClick={() => setView('month')}
            style={{ cursor: 'pointer' }}
          >
            BetterCal
          </div>
          <div className="nav-links">
            <div
              className={`nav-link ${view === 'month' ? 'active' : ''}`}
              onClick={() => setView('month')}
            >
              Calendar
            </div>

            <div className="nav-link-container">
              <div
                className={`nav-link ${(view === 'week' || view === 'day') ? 'active' : ''}`}
                onClick={() => setIsViewsOpen(!isViewsOpen)}
              >
                Views <ChevronDown size={14} strokeWidth={1.5} className="nav-link-sub" style={{ transform: isViewsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>

              <AnimatePresence>
                {isViewsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="views-dropdown"
                  >
                    {[
                      { id: 'month', label: 'Month' },
                      { id: 'week', label: 'Week' },
                      { id: 'day', label: 'Day' }
                    ].map(v => (
                      <div
                        key={v.id}
                        className={`dropdown-item ${view === v.id ? 'active' : ''}`}
                        onClick={() => {
                          setView(v.id as any)
                          setIsViewsOpen(false)
                        }}
                      >
                        <div className={`layer-dot ${view === v.id ? 'active' : ''}`} />
                        {v.label}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className={`nav-link ${view === 'schedule' ? 'active' : ''}`}
              onClick={() => setView('schedule')}
            >
              Schedule <ArrowUpRight size={13} strokeWidth={1.5} className="nav-link-sub" />
            </div>
          </div>
        </div>

        <div className="nav-right">
          <div className="nav-controls">
            <span className="text-btn muted" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>Prev</span>
            <span className="text-btn bold" onClick={() => setCurrentDate(new Date())}>Today</span>
            <span className="text-btn muted" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>Next</span>
          </div>
          <div className="nav-right-group">
            <h1 className="month-display">{format(currentDate, 'MMMM yyyy')}</h1>
            <div className="plus-btn" onClick={() => setIsCommandOpen(true)}>
              <Plus size={20} strokeWidth={2} />
            </div>
          </div>
        </div>
      </nav>

      <main className="main-stage">
        {view === 'month' && (
          <div className="calendar-grid">
            <div className="grid-cols">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="grid-label">{day}</div>
              ))}
            </div>

            <div className="days-matrix">
              {calendarDays.map((day) => {
                const dayEvents = events.filter((e: CalendarEvent) => isSameDay(e.start, day))
                const isCurrMonth = isSameMonth(day, monthStart)
                const isTday = isToday(day)

                return (
                  <div
                    key={day.toString()}
                    className={`day-box ${!isCurrMonth ? 'off-month' : ''} ${isTday ? 'today' : ''}`}
                  >
                    <div className="day-gravity-tint" />

                    <span className="day-num">{format(day, 'd')}</span>
                    <div className="event-list" style={{ marginTop: '8px', position: 'relative', zIndex: 2 }}>
                      {dayEvents.map((event: CalendarEvent) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`event-chip type-${event.type} ${event.isGoal && !event.confirmed ? 'ghost-goal' : ''}`}
                          style={{ marginBottom: '4px', cursor: event.isGoal && !event.confirmed ? 'alias' : 'pointer' }}
                          onClick={(e) => {
                            if (event.isGoal && !event.confirmed) {
                              e.stopPropagation()
                              setEvents(prev => prev.map(ev => ev.id === event.id ? { ...ev, confirmed: true } : ev))
                            }
                          }}
                        >
                          {event.isGoal && !event.confirmed && <span className="goal-indicator">✦</span>}
                          {event.title}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {view === 'schedule' && (
          <div className="schedule-view">
            {groupedEvents.map(({ date, events: dayEvents }: { date: Date, events: CalendarEvent[] }) => (
              <div key={date.toString()} className="schedule-day">
                <div className="schedule-date">
                  <div className="date-large">{format(date, 'd')}</div>
                  <div className="date-sub">{format(date, 'EEEE')}</div>
                </div>

                <div className="schedule-events">
                  {dayEvents.map((event: CalendarEvent) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="schedule-item"
                    >
                      <div className="item-time">
                        {format(event.start, 'h:mm a')}
                      </div>
                      <div className="item-content">
                        <div className="item-title">{event.title}</div>
                        <div className="item-meta">
                          <div className={`vibe-dot type-${event.type}`} style={{ background: `var(--${event.type}-text)` }} />
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          {event.locationType === 'anywhere' && <span> • Anywhere</span>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'week' && (
          <div className="week-grid">
            <div className="grid-cols">
              {weekDays.map(day => (
                <div key={day.toString()} className={`grid-label ${isToday(day) ? 'today-label' : ''}`}>
                  <span className="label-day">{format(day, 'EEE')}</span>
                  <span className="label-num">{format(day, 'd')}</span>
                </div>
              ))}
            </div>
            <div className="week-matrix">
              {weekDays.map(day => {
                const dayEvents = events.filter((e: CalendarEvent) => isSameDay(e.start, day))
                return (
                  <div key={day.toString()} className={`week-col ${isToday(day) ? 'today' : ''}`}>
                    <div className="event-list">
                      {dayEvents.map((event: CalendarEvent) => (
                        <motion.div
                          key={event.id}
                          layoutId={event.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`event-chip type-${event.type} ${event.isGoal && !event.confirmed ? 'ghost-goal' : ''}`}
                          onClick={() => {
                            if (event.isGoal && !event.confirmed) {
                              setEvents(prev => prev.map(ev => ev.id === event.id ? { ...ev, confirmed: true } : ev))
                            }
                          }}
                        >
                          <div className="event-time">{format(event.start, 'h:mm aa')}</div>
                          <div className="event-title">{event.title}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {view === 'day' && (
          <div className="day-grid">
            <div className="grid-cols">
              <div className="grid-label today-label">
                <span className="label-day">{format(currentDate, 'EEEE')}</span>
                <span className="label-num">{format(currentDate, 'd')}</span>
              </div>
            </div>

            <div className="day-timeline">
              {Array.from({ length: 24 }).map((_, i) => {
                const hourDate = setHours(startOfDay(currentDate), i)
                const hourEvents = events.filter((e: CalendarEvent) =>
                  isSameDay(e.start, currentDate) &&
                  getHours(e.start) === i
                )

                return (
                  <div key={i} className="timeline-row">
                    <div className="row-time">{format(hourDate, 'h aa')}</div>
                    <div className="row-content">
                      {hourEvents.map((event: CalendarEvent) => (
                        <motion.div
                          key={event.id}
                          layoutId={event.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`event-chip type-${event.type} ${event.isGoal && !event.confirmed ? 'ghost-goal' : ''}`}
                          onClick={() => {
                            if (event.isGoal && !event.confirmed) {
                              setEvents(prev => prev.map(ev => ev.id === event.id ? { ...ev, confirmed: true } : ev))
                            }
                          }}
                        >
                          <div className="event-time">{format(event.start, 'h:mm aa')}</div>
                          <div className="event-title">{event.title}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {isCommandOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="command-overlay"
            onClick={() => setIsCommandOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 40 }}
              className="command-bar"
              onClick={e => e.stopPropagation()}
            >
              <div className="command-input-container">
                <input
                  autoFocus
                  type="text"
                  className="command-input"
                  placeholder="Focus on kernel at 10am today..."
                  value={commandInput}
                  onChange={e => setCommandInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && commandInput) {
                      const start = parsedPreview.date === 'Today' ? new Date() : addDays(new Date(), 1)

                      const createEvent = (isGoal = false) => {
                        const newEvent: CalendarEvent = {
                          id: Math.random().toString(),
                          title: parsedPreview.title,
                          start: start,
                          end: new Date(start.getTime() + 60 * 60 * 1000),
                          type: parsedPreview.type,
                          isGoal,
                          locationType: commandInput.toLowerCase().includes('anywhere') ? 'anywhere' : 'specific',
                          confirmed: !isGoal
                        }
                        return newEvent
                      }

                      if (commandInput.toLowerCase().startsWith('goal') || commandInput.toLowerCase().startsWith('smart')) {
                        const tomorrowStart = setHours(setMinutes(addDays(new Date(), 1), 0), 9)
                        setEvents(prev => [...prev, {
                          ...createEvent(true),
                          start: tomorrowStart,
                          end: setHours(tomorrowStart, 10),
                          title: `Goal: ${parsedPreview.title}`
                        }])
                      } else {
                        setEvents([...events, createEvent()])
                      }

                      setCommandInput('')
                      setIsCommandOpen(false)
                    }
                  }}
                />
              </div>

              <div className="command-preview">
                <div className="preview-label">Predictive Slotting</div>
                <div className="preview-details">
                  <div className="preview-item">
                    <span className="preview-key">Event</span>
                    <span className="preview-value" style={{ color: `var(--${parsedPreview.type}-text)` }}>{parsedPreview.title}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-key">Date</span>
                    <span className="preview-value">{parsedPreview.date}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-key">Tag</span>
                    <span className={`event-chip type-${parsedPreview.type}`} style={{ fontSize: '10px', padding: '4px 10px' }}>
                      {parsedPreview.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="command-footer">
                <div className="shortcut-hint">
                  <span className="key-cap">ESC</span> to Cancel
                </div>
                <div className="shortcut-hint">
                  <span className="key-cap">ENTER</span> to Commit
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="goal-tracker-float"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="tracker-label">SPECTRAL RESONANCE</div>
        <div className="tracker-stats">
          <span className="stats-num">{goalStats.confirmed}</span>
          <span className="stats-divider">/</span>
          <span className="stats-total">{goalStats.total}</span>
        </div>
        <div className="tracker-bar-bg">
          <motion.div
            className="tracker-bar-fill"
            animate={{ width: `${goalStats.percent}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
          />
        </div>
        <div className="tracker-percent">{goalStats.percent}% COMMITMENT</div>
      </motion.div>
    </div>
  )
}
