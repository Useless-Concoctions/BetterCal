import React from 'react'
import { format, isSameDay, setHours, startOfDay, getHours } from 'date-fns'
import { CalendarEvent } from '../../lib/calendar-utils'

interface DayViewProps {
    currentDate: Date
    events: CalendarEvent[]
    setPopoverPosition: (pos: any) => void
    setModalDateContext: (date: Date) => void
    setIsEventModalOpen: (open: boolean) => void
    setSelectedEvent: (event: CalendarEvent) => void
    setEvents: (fn: (prev: CalendarEvent[]) => CalendarEvent[]) => void
    settings: any
    resolveConflicts: any
}

export const DayView: React.FC<DayViewProps> = ({
    currentDate,
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
                        <div
                            key={i}
                            className="timeline-row"
                            onClick={(e: React.MouseEvent) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                setPopoverPosition({ x: rect.x, y: rect.y, width: rect.width, height: rect.height })
                                setModalDateContext(hourDate)
                                setIsEventModalOpen(true)
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="row-time">{format(hourDate, 'h aa')}</div>
                            <div className="row-content">
                                {hourEvents.map((event: CalendarEvent) => (
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
