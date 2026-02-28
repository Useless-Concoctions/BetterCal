import React from 'react'
import { format, isSameMonth, isSameDay, isToday, addDays } from 'date-fns'
import { CalendarEvent } from '../../lib/calendar-utils'

interface MonthViewProps {
    currentDate: Date
    events: CalendarEvent[]
    monthStart: Date
    calendarDays: Date[]
    setPopoverPosition: (pos: any) => void
    setModalDateContext: (date: Date) => void
    setIsEventModalOpen: (open: boolean) => void
    setSelectedEvent: (event: CalendarEvent) => void
    setEvents: (fn: (prev: CalendarEvent[]) => CalendarEvent[]) => void
    settings: any
    resolveConflicts: any
}

export const MonthView: React.FC<MonthViewProps> = ({
    currentDate,
    events,
    monthStart,
    calendarDays,
    setPopoverPosition,
    setModalDateContext,
    setIsEventModalOpen,
    setSelectedEvent,
    setEvents,
    settings,
    resolveConflicts
}) => {
    return (
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

                    const confirmedGoal = dayEvents.find(e => e.isGoal && e.confirmed)

                    return (
                        <div
                            key={day.toString()}
                            className={`day-box ${!isCurrMonth ? 'off-month' : ''} ${isTday ? 'today' : ''}`}
                            onClick={(e: React.MouseEvent) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                setPopoverPosition({ x: rect.x, y: rect.y, width: rect.width, height: rect.height })
                                setModalDateContext(day)
                                setIsEventModalOpen(true)
                            }}
                        >
                            <div className="day-gravity-tint" />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                                <span className="day-num">{format(day, 'd')}</span>
                                {confirmedGoal?.emoji && (
                                    <span style={{ fontSize: '14px' }}>{confirmedGoal.emoji}</span>
                                )}
                            </div>
                            <div className="event-list" style={{ marginTop: '8px', position: 'relative', zIndex: 2 }}>
                                {dayEvents.map((event: CalendarEvent) => (
                                    <div
                                        key={event.id}
                                        className={`event-chip ${event.isGoal && !event.confirmed ? 'ghost-goal' : ''}`}
                                        style={{ marginBottom: '4px' }}
                                        onClick={(e: React.MouseEvent) => {
                                            e.stopPropagation()
                                            if (event.isGoal && !event.confirmed) {
                                                setEvents(prev => resolveConflicts(prev.map(ev => ev.id === event.id ? { ...ev, confirmed: true } : ev), settings))
                                            } else {
                                                const rect = e.currentTarget.getBoundingClientRect()
                                                setPopoverPosition({ x: rect.x, y: rect.y, width: rect.width, height: rect.height })
                                                setSelectedEvent(event)
                                            }
                                        }}
                                    >
                                        {event.isGoal && !event.confirmed && <span className="goal-indicator">✦</span>}
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
