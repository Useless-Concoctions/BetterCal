import React from 'react'
import { format, subMonths, addMonths, subWeeks, addWeeks, subDays, addDays } from 'date-fns'
import { Plus, Settings, RefreshCw, ChevronLeft, ChevronRight, Calendar, Columns, Square, List, LogIn, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn, signOut } from 'next-auth/react'
import { syncGoogleAction } from "../../lib/actions"
import { PopoverPosition } from '../../lib/calendar-utils'
import { Session } from 'next-auth'

interface CalendarHeaderProps {
    currentDate: Date
    setCurrentDate: (date: Date) => void
    view: 'week' | 'day' | 'schedule' | 'socal' | 'month'
    setView: (view: 'week' | 'day' | 'schedule' | 'socal' | 'month') => void
    activeCategory: string | null
    setActiveCategory: (cat: string | null) => void
    isViewsOpen: boolean
    setIsViewsOpen: (open: boolean) => void
    setIsCommandOpen: (open: boolean) => void
    setIsSettingsOpen: (open: boolean) => void
    setPopoverPosition: (pos: PopoverPosition) => void
    viewsContainerRef: React.RefObject<HTMLDivElement | null>
    session: Session | null
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    currentDate,
    setCurrentDate,
    view,
    setView,
    activeCategory,
    setActiveCategory,
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
        <nav className="top-nav" style={{
            background: 'transparent',
            position: 'relative'
        }}>
            {/* 
              Smooth opacity-based background transition 
              (Prevents browser color interpolation artifacts when fading to transparent) 
            */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--background)',
                    borderBottom: '1px solid var(--border)',
                    opacity: view === 'socal' ? 0 : 1,
                    transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: 'none',
                    zIndex: -1
                }}
            />

            <div className="nav-left">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                        className="logo-text"
                        onClick={() => {
                            setView('month')
                            setActiveCategory(null)
                            setIsViewsOpen(false)
                        }}
                        style={{
                            color: view === 'socal' ? 'var(--socal-text-contrast)' : 'var(--foreground)',
                            opacity: view !== 'socal' ? 1 : 0.5,
                            transition: 'all 0.5s ease',
                        }}
                    >
                        <span style={{ fontWeight: view !== 'socal' ? 950 : 400, transition: 'font-weight 0.5s ease' }}>Better</span><span style={{ fontWeight: 400 }}>Cal</span>
                    </div>
                    <div
                        className="logo-text"
                        onClick={() => {
                            setView('socal')
                            setActiveCategory(null)
                            setIsViewsOpen(false)
                        }}
                        style={{
                            color: view === 'socal' ? 'var(--socal-text-contrast)' : undefined,
                            background: view === 'socal' ? 'none' : 'linear-gradient(90deg, var(--socal-grad-1, #f97316), var(--socal-grad-2, #ec4899))',
                            WebkitBackgroundClip: view === 'socal' ? 'none' : 'text',
                            WebkitTextFillColor: view === 'socal' ? 'var(--socal-text-contrast)' : 'transparent',
                            opacity: view === 'socal' ? 1 : 0.5,
                            transition: 'all 0.5s ease',
                        }}
                    >
                        <span style={{ fontWeight: view === 'socal' ? 950 : 400, transition: 'font-weight 0.5s ease' }}>So</span><span style={{ fontWeight: 400 }}>Cal</span>
                    </div>
                </div>

                <div className="nav-links">
                    {view !== 'socal' ? (
                        <>
                            <div
                                className="nav-link"
                                onClick={() => {
                                    setCurrentDate(new Date())
                                    setIsViewsOpen(false)
                                }}
                                style={{
                                    transition: 'color 0.5s ease'
                                }}
                            >
                                Today
                            </div>

                            <div ref={viewsContainerRef} className="nav-link-container" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div
                                    className={`nav-link ${isViewsOpen ? 'active' : ''}`}
                                    onClick={() => setIsViewsOpen(!isViewsOpen)}
                                    style={{
                                        transition: 'color 0.5s ease'
                                    }}
                                >
                                    Views
                                </div>

                                <AnimatePresence>
                                    {isViewsOpen && (
                                        <motion.div
                                            style={{ display: 'flex', alignItems: 'center', gap: '16px', overflow: 'hidden' }}
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
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {['local', 'sports', 'finance', 'entertainment'].map(cat => (
                                <div
                                    key={cat}
                                    className={`nav-link ${activeCategory === cat ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                                    style={{
                                        color: 'var(--socal-text-contrast)',
                                        fontWeight: activeCategory === cat ? 900 : 500,
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {cat === 'entertainment' ? 'Concerts' : cat}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="nav-right">
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <div className="nav-date-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1 className="month-display" style={{
                            color: view === 'socal' ? 'var(--socal-text-contrast)' : 'var(--foreground)',
                            transition: 'color 0.5s ease'
                        }}>{format(currentDate, 'MMMM yyyy')}</h1>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0px',
                        color: view === 'socal' ? 'var(--socal-text-contrast)' : 'var(--foreground)',
                        transition: 'color 0.5s ease'
                    }}>
                        <div
                            className="plus-btn"
                            style={{ color: 'inherit' }}
                            title="Search calendars"
                            onClick={() => {
                                alert('Global search coming soon!')
                            }}
                        >
                            <Search size={14} strokeWidth={2.5} />
                        </div>

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
        </nav>
    )
}
