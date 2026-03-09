import { format, isSameDay, setHours, startOfDay, getHours, setMinutes } from 'date-fns'
import { CalendarEvent, PopoverPosition, IntelligentSettings } from '../../lib/calendar-utils'
import { updateEvent } from '../../lib/actions'
import { WeatherData } from '../../lib/weather-utils'

interface DayViewProps {
    currentDate: Date
    events: CalendarEvent[]
    setPopoverPosition: (pos: PopoverPosition) => void
    setModalDateContext: (date: Date) => void
    setIsCommandOpen: (open: boolean) => void
    setSelectedEvent: (event: CalendarEvent) => void
    setEvents: (fn: (prev: CalendarEvent[]) => CalendarEvent[]) => void
    settings: IntelligentSettings
    resolveConflicts: (events: CalendarEvent[], settings?: IntelligentSettings, weather?: WeatherData | null) => CalendarEvent[]
    isGuest: boolean
    weatherData?: WeatherData | null
}

export const DayView: React.FC<DayViewProps> = ({
    currentDate,
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

    const handleDrop = async (e: React.DragEvent, targetHour: Date) => {
        e.preventDefault()
        e.currentTarget.classList.remove('drag-over')
        const eventId = e.dataTransfer.getData('eventId')
        const event = events.find(ev => ev.id === eventId)

        if (event) {
            const h = getHours(targetHour)
            const newStart = setMinutes(setHours(targetHour, h), event.start.getMinutes())
            const duration = (event.end.getTime() - event.start.getTime())
            const newEnd = new Date(newStart.getTime() + duration)

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
                                setIsCommandOpen(true)
                            }}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, hourDate)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="row-time">{format(hourDate, 'h aa')}</div>
                            <div className="row-content">
                                {hourEvents.map((event: CalendarEvent) => (
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
                    )
                })}
            </div>
        </div>
    )
}
