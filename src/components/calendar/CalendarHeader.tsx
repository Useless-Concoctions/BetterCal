import React from 'react'
import { format, subMonths, addMonths } from 'date-fns'
import { Plus, Settings, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { signIn, signOut } from 'next-auth/react'
import { syncGoogleAction } from "../../lib/actions"

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
    session: any
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    currentDate,
    setCurrentDate,
    view,
    setView,
    isViewsOpen,
    setIsViewsOpen,
    setIsCommandOpen,
    setIsSettingsOpen,
    setPopoverPosition,
    viewsContainerRef,
    session
}) => {
    const [isSyncing, setIsSyncing] = React.useState(false)

    const handleSync = async () => {
        if (!session?.user?.id) return
        setIsSyncing(true)
        try {
            await syncGoogleAction(session.user.id)
        } finally {
            setIsSyncing(false)
        }
    }

    return (
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
                        className={`nav-link ${['month', 'week', 'day'].includes(view) ? 'active' : ''}`}
                        onClick={() => {
                            setView('month')
                            setIsViewsOpen(false)
                        }}
                    >
                        Calendar
                    </div>

                    <div ref={viewsContainerRef} className="nav-link-container" style={{ display: 'flex', alignItems: 'baseline' }}>
                        <div
                            className={`nav-link`}
                            onClick={() => setIsViewsOpen(!isViewsOpen)}
                        >
                            Views
                        </div>
                    </div>

                    <div
                        className={`nav-link ${view === 'schedule' ? 'active' : ''}`}
                        onClick={() => {
                            setView('schedule')
                            setIsViewsOpen(false)
                        }}
                    >
                        Schedule
                    </div>
                </div>
            </div>

            <div className="nav-right">
                <div className="nav-controls">
                    <span className="text-btn muted" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>Prev</span>
                    <span className="text-btn bold" onClick={() => setCurrentDate(new Date())}>Today</span>
                    <span className="text-btn muted" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>Next</span>
                </div>
                <div className="nav-right-group" style={{ gap: '24px' }}>
                    <h1 className="month-display">{format(currentDate, 'MMMM yyyy')}</h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {session && (
                            <button
                                className={`sync-icon-btn ${isSyncing ? 'syncing' : ''}`}
                                onClick={handleSync}
                                disabled={isSyncing}
                                aria-label="Sync Google Calendar"
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                            </button>
                        )}

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

                        {session ? (
                            <img
                                src={session.user?.image || `https://ui-avatars.com/api/?name=${session.user?.name}`}
                                alt="Profile"
                                className="user-avatar"
                                onClick={() => signOut()}
                                style={{ width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', marginLeft: '8px' }}
                            />
                        ) : (
                            <button
                                className="login-btn"
                                onClick={() => signIn()}
                                style={{ background: 'none', border: '1px solid var(--foreground)', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer' }}
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
