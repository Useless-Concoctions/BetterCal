import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, TrendingUp, Trophy, Star, Bell, Plus, Sparkles, Image as ImageIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { StockCalendarUploader } from './StockCalendarUploader'
import { EventIngestor } from './EventIngestor'
import { getSubscriptions, subscribeToCalendar, unsubscribeFromCalendar, createEvent } from '../../lib/actions'

const CATEGORIES = [
    { id: 'local', name: 'Local Events', icon: <MapPin size={16} />, color: '#be185d', bg: '#fce7f3' },
    { id: 'sports', name: 'Sports Schedules', icon: <Trophy size={16} />, color: '#0f766e', bg: '#ccfbf1' },
    { id: 'finance', name: 'Earnings Calls', icon: <TrendingUp size={16} />, color: '#15803d', bg: '#dcfce7' },
    { id: 'entertainment', name: 'Concerts & Shows', icon: <Star size={16} />, color: '#c2410c', bg: '#ffedd5' },
]

const FEATURED_CALENDARS: { id: string, title: string, description: string, category: string, image: string, color: string, subscribers: string }[] = [
    {
        id: 'f1-2026',
        title: 'Formula 1 2026 Season',
        description: 'Every Grand Prix weekend, including practice, qualifying, and race times.',
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1534490484114-17365d62537c?auto=format&fit=crop&q=80&w=400',
        color: '#be185d',
        subscribers: '1.2M'
    },
    {
        id: 'nintendo-releases',
        title: 'Nintendo Releases & Directs',
        description: 'New game drops, DLC updates, and official Nintendo Direct presentations.',
        category: 'Entertainment',
        image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=400',
        color: '#c2410c',
        subscribers: '850k'
    },
    {
        id: 'aapl-earnings',
        title: 'Apple Earnings & Events',
        description: 'Quarterly financial reports and major Apple Event keynotes.',
        category: 'Finance',
        image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=400',
        color: '#15803d',
        subscribers: '420k'
    },
    {
        id: 'toronto-events',
        title: 'Toronto Concert Series',
        description: 'Major venue concerts across Scotiabank Arena, Budweiser Stage, and more.',
        category: 'Local',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400',
        color: '#be185d',
        subscribers: '15k'
    }
]

export const SoCalView: React.FC = () => {
    const { data: session } = useSession()
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [subscribed, setSubscribed] = useState<string[]>([])
    const [showStockUploader, setShowStockUploader] = useState(false)
    const [showEventIngestor, setShowEventIngestor] = useState(false)

    useEffect(() => {
        if (session?.user?.id) {
            getSubscriptions(session.user.id).then((subs) => {
                setSubscribed(subs.map(s => s.calendarId))
            })
        }
    }, [session?.user?.id])

    const toggleSubscription = async (id: string) => {
        if (!session?.user?.id) {
            alert('Please sign in to subscribe to calendars.');
            return;
        }

        const isSubscribed = subscribed.includes(id);

        // Optimistic UI update
        setSubscribed(prev => isSubscribed ? prev.filter(x => x !== id) : [...prev, id]);

        if (isSubscribed) {
            await unsubscribeFromCalendar(session.user.id, id);
        } else {
            await subscribeToCalendar(session.user.id, id);

            // Mock fetching public events for the newly subscribed calendar
            // In a real app, this would hit an external API or sync worker
            const mockStart = new Date();
            mockStart.setDate(mockStart.getDate() + 2); // 2 days from now
            mockStart.setHours(14, 0, 0, 0);

            const mockEnd = new Date(mockStart);
            mockEnd.setHours(16, 0, 0, 0);

            await createEvent(session.user.id, {
                title: `${FEATURED_CALENDARS.find(c => c.id === id)?.title} Event`,
                start: mockStart,
                end: mockEnd,
                isGoal: false,
                confirmed: true,
                isPublic: true,
                calendarId: id,
                emoji: '📅',
                source: 'subscription'
            });
        }
    }

    return (
        <div className="socal-view-container" style={{
            padding: '60px 80px',
            flex: 1,
            overflowY: 'auto',
            background: 'transparent'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ marginBottom: '40px' }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{
                            fontSize: '48px',
                            fontWeight: 900,
                            letterSpacing: '-0.04em',
                            lineHeight: 1.1,
                            color: 'white',
                            maxWidth: '700px',
                            textShadow: '0 2px 20px rgba(0,0,0,0.2)'
                        }}
                    >
                        Subscribe to the pulse of your world.
                    </motion.h1>
                </div>



                <AnimatePresence>
                    {(activeCategory === 'finance' || searchQuery.toLowerCase().includes('stock') || searchQuery.toLowerCase().includes('earning')) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ marginBottom: '40px', overflow: 'hidden' }}
                        >
                            {!showStockUploader ? (
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => setShowStockUploader(true)}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(168, 85, 247, 0.1))',
                                        border: '1px solid rgba(56, 189, 248, 0.3)',
                                        borderRadius: '24px',
                                        padding: '40px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <Sparkles size={16} style={{ color: '#38bdf8' }} />
                                            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#38bdf8' }}>SoCal AI Magic</span>
                                        </div>
                                        <h2 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '8px' }}>Follow your portfolio.</h2>
                                        <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Upload a screenshot of your holdings to automatically subscribe to every relevant earnings call.</p>
                                    </div>
                                    <div style={{ padding: '16px', background: 'white', borderRadius: '16px', color: 'black', fontWeight: 700 }}>
                                        Get Started
                                    </div>
                                </motion.div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                                    <StockCalendarUploader
                                        userId={session?.user?.id}
                                        onComplete={() => setShowStockUploader(false)}
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}
                    {(activeCategory === null || searchQuery.toLowerCase().includes('flyer') || searchQuery.toLowerCase().includes('poster')) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ marginBottom: '40px', overflow: 'hidden' }}
                        >
                            {!showEventIngestor ? (
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => setShowEventIngestor(true)}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(234, 179, 8, 0.1))',
                                        border: '1px solid rgba(244, 63, 94, 0.3)',
                                        borderRadius: '24px',
                                        padding: '40px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <ImageIcon size={16} style={{ color: '#f43f5e' }} />
                                            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f43f5e' }}>Universal Ingestion</span>
                                        </div>
                                        <h2 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '8px' }}>Digitize any flyer.</h2>
                                        <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Drop an image of a poster, flyer, or screenshot, and we'll instantly parse it into a calendar event.</p>
                                    </div>
                                    <div style={{ padding: '16px', background: 'white', borderRadius: '16px', color: 'black', fontWeight: 700 }}>
                                        Try it Out
                                    </div>
                                </motion.div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                                    <EventIngestor
                                        userId={session?.user?.id}
                                        onComplete={() => setShowEventIngestor(false)}
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: '24px',
                    background: 'transparent'
                }}>
                    {FEATURED_CALENDARS.filter(c => !activeCategory || c.category.toLowerCase() === activeCategory).map((cal, i) => (
                        <motion.div
                            key={cal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                                padding: '24px',
                                background: 'rgba(0, 0, 0, 0.15)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '24px',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 4px 24px -1px rgba(0, 0, 0, 0.1)',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.25)'
                                e.currentTarget.style.transform = 'translateY(-4px)'
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                            }}
                            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.15)'
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ height: '80px', width: '80px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0 }}>
                                    <img src={cal.image} alt={cal.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            letterSpacing: '0.1em',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            textTransform: 'uppercase'
                                        }}>
                                            {cal.category}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{cal.title}</h3>
                                </div>
                            </div>

                            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5, flex: 1 }}>
                                {cal.description}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Bell size={12} /> {cal.subscribers}
                                </span>
                                <button
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); toggleSubscription(cal.id); }}
                                    style={{
                                        background: subscribed.includes(cal.id) ? 'rgba(255, 255, 255, 0.1)' : 'white',
                                        color: subscribed.includes(cal.id) ? 'white' : 'black',
                                        border: subscribed.includes(cal.id) ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                                        padding: '8px 16px',
                                        borderRadius: '100px',
                                        fontSize: '13px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    {subscribed.includes(cal.id) ? 'Subscribed' : <><Plus size={14} strokeWidth={3} /> Subscribe</>}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
