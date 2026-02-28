import React from 'react'
import { format } from 'date-fns'
import { CalendarEvent } from '../../lib/calendar-utils'

interface ScheduleViewProps {
    groupedEvents: { date: Date, events: CalendarEvent[] }[]
    setPopoverPosition: (pos: any) => void
    setSelectedEvent: (event: CalendarEvent) => void
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
    groupedEvents,
    setPopoverPosition,
    setSelectedEvent
}) => {
    return (
        <div className="schedule-view">
            {groupedEvents.map(({ date, events: dayEvents }) => (
                <div key={date.toString()} className="schedule-day">
                    <div className="schedule-date">
                        <div className="date-large">{format(date, 'd')}</div>
                        <div className="date-sub">{format(date, 'EEEE')}</div>
                    </div>

                    <div className="schedule-events">
                        {dayEvents.map((event: CalendarEvent) => (
                            <div
                                key={event.id}
                                className="schedule-item"
                                style={{ cursor: 'pointer' }}
                                onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation()
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    setPopoverPosition({ x: rect.x, y: rect.y, width: rect.width, height: rect.height })
                                    setSelectedEvent(event)
                                }}
                            >
                                <div className="item-time">
                                    {format(event.start, 'h:mm a')}
                                </div>
                                <div className="item-content">
                                    <div className="item-title">{event.title}</div>
                                    <div className="item-meta">
                                        {event.locationType === 'anywhere' && <span> • Anywhere</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
