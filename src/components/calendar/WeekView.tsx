import React from 'react'
import { format, isSameDay, isToday, addDays, differenceInDays } from 'date-fns'
import { CalendarEvent } from '../../lib/calendar-utils'
import { updateEvent } from '../../lib/actions'

interface WeekViewProps {
    weekDays: Date[]
    events: CalendarEvent[]
    setPopoverPosition: (pos: any) => void
    setModalDateContext: (date: Date) => void
    setIsCommandOpen: (open: boolean) => void
    setSelectedEvent: (event: CalendarEvent) => void
    setEvents: (fn: (prev: CalendarEvent[]) => CalendarEvent[]) => void
    settings: any
    resolveConflicts: any
    isGuest: boolean
    weatherData?: any
}

export const WeekView: React.FC<WeekViewProps> = ({
    weekDays,
    events,
    setPopoverPosition,
    setModalDateContext,
    setIsCommandOpen,
    setSelectedEvent,
    setEvents,
    settings,
    resolveConflicts,
    isGuest,
    weatherData
}) => {
    const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
        e.dataTransfer.setData('eventId', event.id)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        e.currentTarget.classList.add('drag-over')
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('drag-over')
    }

    const handleDrop = async (e: React.DragEvent, targetDay: Date) => {
        e.preventDefault()
        e.currentTarget.classList.remove('drag-over')
        const eventId = e.dataTransfer.getData('eventId')
        const event = events.find(ev => ev.id === eventId)

        if (event && !isSameDay(event.start, targetDay)) {
            const diffDays = differenceInDays(targetDay, event.start)
            const newStart = addDays(event.start, diffDays)
            const newEnd = addDays(event.end, diffDays)

            if (isGuest) {
                setEvents(prev => resolveConflicts(prev.map(ev =>
                    ev.id === eventId ? { ...ev, start: newStart, end: newEnd } : ev
                ), settings, weatherData))
            } else {
                await updateEvent(eventId, { start: newStart, end: newEnd })
            }
        }
    }

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
                                setIsCommandOpen(true)
                            }}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, day)}
                        >
                            <div className="event-list">
                                {dayEvents.map((event: CalendarEvent) => (
                                    <div
                                        key={event.id}
                                        className={`event-chip ${event.isGoal && !event.confirmed ? 'ghost-goal' : ''}`}
                                        draggable={!event.isGoal || event.confirmed}
                                        onDragStart={(e) => handleDragStart(e, event)}
                                        onClick={(e: React.MouseEvent) => {
                                            e.stopPropagation()
                                            if (event.isGoal && !event.confirmed) {
                                                setEvents(prev => resolveConflicts(prev.map(ev => ev.id === event.id ? { ...ev, confirmed: true } : ev), settings, weatherData))
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
                    );
                })}
            </div>
        </div>
    );
};
