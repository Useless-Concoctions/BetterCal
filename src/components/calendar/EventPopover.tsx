import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { X, Trash2, MapPin, Clock } from 'lucide-react'
import { CalendarEvent } from '../../lib/calendar-utils'

interface EventPopoverProps {
    event: CalendarEvent
    popoverPosition: { x: number, y: number, width: number, height: number } | null
    onClose: () => void
    onDelete: (id: string) => void
}

export const EventPopover: React.FC<EventPopoverProps> = ({
    event,
    popoverPosition,
    onClose,
    onDelete
}) => {
    if (!popoverPosition) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="popover-overlay"
                style={{ zIndex: 5000 }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    className="event-popover-card"
                    style={{
                        top: popoverPosition.y + popoverPosition.height + 8,
                        left: typeof window !== 'undefined' && popoverPosition.x > window.innerWidth / 2
                            ? Math.max(20, popoverPosition.x - 340 + popoverPosition.width + 20)
                            : Math.min(typeof window !== 'undefined' ? window.innerWidth - 340 : 1000, popoverPosition.x + 20),
                        width: 340
                    }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                    <div className="popover-arrow" />

                    <div className="event-popover-header">
                        <div className="event-popover-meta">
                            <div className="event-popover-dot" style={{ backgroundColor: event.isGoal ? 'var(--rose-text)' : 'var(--blue-text)' }} />
                            <span style={{ flex: 1 }}>{event.emoji} {event.title}</span>
                            <button
                                onClick={onClose}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4, display: 'flex', alignItems: 'center' }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="event-popover-body">
                        <div className="popover-datetime">
                            <div className="popover-date" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={14} className="muted" />
                                {format(event.start, 'EEEE, MMMM d')}
                            </div>
                            <div className="popover-time" style={{ marginLeft: '22px' }}>
                                {format(event.start, 'h:mm a')} – {format(event.end, 'h:mm a')}
                            </div>
                        </div>

                        {event.location && (
                            <div className="popover-location" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)' }}>
                                <MapPin size={14} />
                                {event.location}
                            </div>
                        )}

                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => onDelete(event.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--rose-text)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    opacity: 0.8
                                }}
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
