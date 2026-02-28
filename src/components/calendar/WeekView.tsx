import React from 'react'
import { format, isSameDay, isToday } from 'date-fns'
import { CalendarEvent } from '../../lib/calendar-utils'

interface WeekViewProps {
    weekDays: Date[]
    events: CalendarEvent[]
    setPopoverPosition: (pos: any) => void
    setModalDateContext: (date: Date) => void
    setIsEventModalOpen: (open: boolean) => void
    setSelectedEvent: (event: CalendarEvent) => void
    setEvents: (fn: (prev: CalendarEvent[]) => CalendarEvent[]) => void
    settings: any
    resolveConflicts: any
}

export const WeekView: React.FC<WeekViewProps> = ({
    weekDays,
    events,
    setPopoverPosition,
    setModalDateContext,
    setIsEventModalOpen,
    setSelectedEvent,
    setEvents,
    settings,
    resolveConflicts
}) => {
    return (
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
                        <div
                            key={day.toString()}
                            className={`week-col ${isToday(day) ? 'today' : ''}`}
                            onClick={(e: React.MouseEvent) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                setPopoverPosition({ x: rect.x, y: rect.y, width: rect.width, height: rect.height })
                                setModalDateContext(day)
                                setIsEventModalOpen(true)
                            }}
                        >
                            <div className="event-list">
                                {dayEvents.map((event: CalendarEvent) => (
                                    <div
                                        key={event.id}
                                        className={`event-chip ${event.isGoal && !event.confirmed ? 'ghost-goal' : ''}`}
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
                                        <div className="event-time">{format(event.start, 'h:mm aa')}</div>
                                        <div className="event-title">{event.title}</div>
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
