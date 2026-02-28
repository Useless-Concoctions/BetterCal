import React from 'react'
import { format, subMonths, addMonths } from 'date-fns'
import { Plus, Settings } from 'lucide-react'

interface CalendarHeaderProps {
    currentDate: Date
    setCurrentDate: (date: Date) => void
    view: string
    setView: (view: any) => void
    isViewsOpen: boolean
    setIsViewsOpen: (open: boolean) => void
    setIsCommandOpen: (open: boolean) => void
    setIsSettingsOpen: (open: boolean) => void
    setPopoverPosition: (pos: any) => void
    viewsContainerRef: React.RefObject<HTMLDivElement | null>
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
                    >
    Schedule
                    </div >
                </div >
            </div >

    <div className="nav-right">
        <div className="nav-controls">
            <span className="text-btn muted" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>Prev</span>
            <span className="text-btn bold" onClick={() => setCurrentDate(new Date())}>Today</span>
            <span className="text-btn muted" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>Next</span>
        </div>
        <div className="nav-right-group" style={{ gap: '24px' }}>
            <h1 className="month-display">{format(currentDate, 'MMMM yyyy')}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div
                    id="plus-btn"
                    className="plus-btn"
                    onClick={(e: React.MouseEvent) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setPopoverPosition({ x: rect.x, y: rect.y, width: rect.width, height: rect.height })
                        setIsCommandOpen(true)
                    }}
                    style={{ cursor: 'pointer', opacity: 0.4, display: 'flex', alignItems: 'center', color: 'var(--foreground)' }}
                >
                    <Plus size={14} strokeWidth={3} />
                </div>
                <div className="header-right">
                    {session && (
                        <button
                            className={`sync-icon-btn ${isSyncing ? 'syncing' : ''}`}
                            onClick={handleSync}
                            disabled={isSyncing}
                            aria-label="Sync Google Calendar"
                        >
                            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                        </button>
                    )}
                    <div className="view-switcher">
                        <div
                            className="intelligence-btn"
                            onClick={(e: React.MouseEvent) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                setPopoverPosition({ x: rect.x, y: rect.y, width: rect.width, height: rect.height })
                                setIsSettingsOpen(true)
                            }}
                            style={{ cursor: 'pointer', opacity: 0.4, display: 'flex', alignItems: 'center', color: 'var(--foreground)' }}
                        >
                            <Settings size={14} strokeWidth={3} />
                        </div>
                    </div>
                </div>
            </div>
        </nav >
        )
}
