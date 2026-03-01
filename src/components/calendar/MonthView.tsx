import React from 'react'
import { format, isSameMonth, isSameDay, isToday, addDays, differenceInDays } from 'date-fns'
import { updateEvent } from '../../lib/actions'
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
    isGuest: boolean
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
    resolveConflicts,
    isGuest
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
                ), settings))
            } else {
                await updateEvent(eventId, { start: newStart, end: newEnd })
                // The revalidatePath in the server action will trigger a refresh for logged-in users
            }
        }
    }

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
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, day)}
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
                                        draggable={!event.isGoal || event.confirmed}
                                        onDragStart={(e) => handleDragStart(e, event)}
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
