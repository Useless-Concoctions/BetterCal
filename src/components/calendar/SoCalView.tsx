import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, TrendingUp, Trophy, Star, Bell, Plus, Sparkles } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { StockCalendarUploader } from './StockCalendarUploader'

const CATEGORIES = [
    { id: 'local', name: 'Local Events', icon: <MapPin size={16} />, color: '#be185d', bg: '#fce7f3' },
    { id: 'sports', name: 'Sports Schedules', icon: <Trophy size={16} />, color: '#0f766e', bg: '#ccfbf1' },
    { id: 'finance', name: 'Earnings Calls', icon: <TrendingUp size={16} />, color: '#15803d', bg: '#dcfce7' },
    { id: 'entertainment', name: 'Concerts & Shows', icon: <Star size={16} />, color: '#c2410c', bg: '#ffedd5' },
]

const FEATURED_CALENDARS: any[] = [
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
    const [showUploader, setShowUploader] = useState(false)

    const toggleSubscription = (id: string) => {
        setSubscribed(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    return (
        <div className="socal-view-container" style={{
            padding: '60px 80px',
            flex: 1,
            overflowY: 'auto',
            background: 'transparent'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ marginBottom: '80px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.2em',
                            color: 'var(--muted)',
                            textTransform: 'uppercase',
                            marginBottom: '24px'
                        }}
                    >
                        Explore Collections
                    </motion.div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '40px' }}>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                fontSize: '64px',
                                fontWeight: 900,
                                letterSpacing: '-0.06em',
                                lineHeight: 1,
                                color: 'var(--foreground)',
                                maxWidth: '600px',
                                textShadow: '0 2px 10px rgba(255,255,255,0.1)'
                            }}
                        >
                            Subscribe to the pulse of your world.
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{ position: 'relative', width: '320px', marginTop: '12px' }}
                        >
                            <Search size={18} style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                            <input
                                type="text"
                                placeholder="Search schedules..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 32px',
                                    border: 'none',
                                    borderBottom: '1px solid var(--border)',
                                    fontSize: '15px',
                                    outline: 'none',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: 'var(--foreground)',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '8px',
                                    paddingLeft: '36px'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--foreground)'
                                    e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--border)'
                                    e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                                }}
                            />
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                        </motion.div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', marginBottom: '64px', overflowX: 'auto', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                    <button
                        onClick={() => setActiveCategory(null)}
                        style={{
                            padding: '12px 0',
                            background: 'none',
                            border: 'none',
                            color: activeCategory === null ? 'var(--foreground)' : 'var(--muted)',
                            borderBottom: activeCategory === null ? '2px solid var(--foreground)' : '2px solid transparent',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        All Collections
                    </button>
                    {CATEGORIES.map((cat, i) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 0',
                                background: 'none',
                                border: 'none',
                                color: activeCategory === cat.id ? 'var(--foreground)' : 'var(--muted)',
                                borderBottom: activeCategory === cat.id ? `2px solid ${cat.color}` : '2px solid transparent',
                                fontWeight: 700,
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <AnimatePresence>
                    {(activeCategory === 'finance' || searchQuery.toLowerCase().includes('stock') || searchQuery.toLowerCase().includes('earning')) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ marginBottom: '40px', overflow: 'hidden' }}
                        >
                            {!showUploader ? (
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => setShowUploader(true)}
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
                                        onComplete={() => setShowUploader(false)}
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '12px',
                    background: 'transparent',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}>
                    {FEATURED_CALENDARS.filter(c => !activeCategory || c.category.toLowerCase() === activeCategory).map((cal, i) => (
                        <motion.div
                            key={cal.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 * i }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '120px 1fr 200px',
                                gap: '32px',
                                padding: '32px',
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                alignItems: 'center',
                                boxShadow: '0 4px 24px -1px rgba(0, 0, 0, 0.05)'
                            }}
                            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 12px 32px -4px rgba(0, 0, 0, 0.1)'
                            }}
                            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 24px -1px rgba(0, 0, 0, 0.05)'
                            }}
                        >
                            <div style={{ height: '80px', width: '120px', borderRadius: '8px', overflow: 'hidden' }}>
                                <img src={cal.image} alt={cal.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.2)' }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        letterSpacing: '0.05em',
                                        color: cal.color,
                                        textTransform: 'uppercase'
                                    }}>
                                        {cal.category}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Bell size={12} /> {cal.subscribers}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--foreground)', letterSpacing: '-0.04em' }}>{cal.title}</h3>
                                <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.4, maxWidth: '500px' }}>
                                    {cal.description}
                                </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); toggleSubscription(cal.id); }}
                                    style={{
                                        background: subscribed.includes(cal.id) ? 'transparent' : 'var(--foreground)',
                                        color: subscribed.includes(cal.id) ? 'var(--foreground)' : 'white',
                                        border: subscribed.includes(cal.id) ? '1px solid var(--border)' : 'none',
                                        padding: '10px 24px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
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
