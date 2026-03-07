import React from 'react'
import { format, subMonths, addMonths, subWeeks, addWeeks, subDays, addDays } from 'date-fns'
import { Plus, Settings, RefreshCw, ChevronLeft, ChevronRight, Calendar, Columns, Square, List, LogIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

    const handlePrev = () => {
        if (view === 'week') setCurrentDate(subWeeks(currentDate, 1))
        else if (view === 'day' || view === 'schedule') setCurrentDate(subDays(currentDate, 1))
        else setCurrentDate(subMonths(currentDate, 1))
    }

    const handleNext = () => {
        if (view === 'week') setCurrentDate(addWeeks(currentDate, 1))
        else if (view === 'day' || view === 'schedule') setCurrentDate(addDays(currentDate, 1))
        else setCurrentDate(addMonths(currentDate, 1))
    }

    return (
        <nav className="top-nav" style={{
            background: view === 'social' ? 'transparent' : 'var(--background)',
            borderBottom: view === 'social' ? 'none' : '1px solid var(--border)',
            transition: 'all 0.5s ease'
        }}>
            <div className="nav-left">
                <div
                    className="logo-text"
                    onClick={() => setView('month')}
                    style={{ color: view === 'social' ? 'var(--socal-text-contrast)' : 'var(--foreground)' }}
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
                        style={{ color: view === 'social' ? 'var(--socal-text-contrast)' : undefined }}
                    >
                        Calendar
                    </div>

                    <div ref={viewsContainerRef} className="nav-link-container" style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                        <div
                            className={`nav-link ${isViewsOpen ? 'active' : ''}`}
                            onClick={() => setIsViewsOpen(!isViewsOpen)}
                            style={{ color: view === 'social' ? 'var(--socal-text-contrast)' : undefined }}
                        >
                            Views
                        </div>

                        <AnimatePresence>
                            {isViewsOpen && (
                                <motion.div
                                    style={{ display: 'flex', alignItems: 'baseline', gap: '16px', overflow: 'hidden' }}
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 'auto', opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <div
                                        className={`nav-link ${view === 'month' ? 'active' : ''}`}
                                        onClick={() => setView('month')}
                                    >
                                        Month
                                    </div>
                                    <div
                                        className={`nav-link ${view === 'week' ? 'active' : ''}`}
                                        onClick={() => setView('week')}
                                    >
                                        Week
                                    </div>
                                    <div
                                        className={`nav-link ${view === 'day' ? 'active' : ''}`}
                                        onClick={() => setView('day')}
                                    >
                                        Day
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="nav-right">
                <div className="nav-right-group" style={{ gap: '24px', display: 'flex', alignItems: 'center' }}>
                    <div className="nav-controls-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1 className="month-display" style={{ width: 'auto', minWidth: '180px', color: view === 'social' ? 'var(--socal-text-contrast)' : 'var(--foreground)' }}>{format(currentDate, 'MMMM yyyy')}</h1>
                        <div className="nav-arrows" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: view === 'social' ? 'var(--socal-text-contrast)' : 'var(--muted)' }}>
                            <span className="nav-arrow-btn" onClick={handlePrev} title="Previous" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
                                <ChevronLeft size={20} />
                            </span>
                            <span className="nav-arrow-btn" onClick={handleNext} title="Next" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
                                <ChevronRight size={20} />
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                            onClick={() => {
                                setView('social')
                                setIsViewsOpen(false)
                            }}
                            style={{
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: view === 'social' ? 1 : 0.6,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <span style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                letterSpacing: '0.1em',
                                background: 'linear-gradient(90deg, var(--socal-grad-1, #f97316), var(--socal-grad-2, #ec4899))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                SoCal
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0px', color: view === 'social' ? 'var(--socal-text-contrast)' : 'var(--foreground)' }}>
                            <div
                                id="plus-btn"
                                className="plus-btn"
                                style={{ color: 'inherit' }}
                                onClick={(e: React.MouseEvent) => {
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    setPopoverPosition({ x: rect.x, y: rect.y, width: rect.width, height: rect.height })
                                    setIsCommandOpen(true)
                                }}
                                title="Add Event"
                            >
                                <Plus size={14} strokeWidth={2.5} />
                            </div>

                            <div
                                className="plus-btn"
                                style={{ color: 'inherit' }}
                                onClick={(e: React.MouseEvent) => {
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    setPopoverPosition({ x: rect.x, y: rect.y, width: rect.width, height: rect.height })
                                    setIsSettingsOpen(true)
                                }}
                                title="Settings"
                            >
                                <Settings size={14} strokeWidth={2.5} />
                            </div>

                            {session ? (
                                <div className="plus-btn">
                                    <img
                                        src={session.user?.image || `https://ui-avatars.com/api/?name=${session.user?.name}`}
                                        alt="Profile"
                                        className="user-avatar"
                                        onClick={() => signOut()}
                                        title="Sign Out"
                                        style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                                    />
                                </div>
                            ) : (
                                <div
                                    className="plus-btn"
                                    style={{ color: 'inherit' }}
                                    onClick={() => signIn()}
                                    title="Sign In"
                                >
                                    <LogIn size={14} strokeWidth={2.5} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}
