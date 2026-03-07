import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, TrendingUp, Trophy, Star, Bell, Plus } from 'lucide-react'

const CATEGORIES = [
    { id: 'local', name: 'Local Events', icon: <MapPin size={16} />, color: '#be185d', bg: '#fce7f3' },
    { id: 'sports', name: 'Sports Schedules', icon: <Trophy size={16} />, color: '#0f766e', bg: '#ccfbf1' },
    { id: 'finance', name: 'Earnings Calls', icon: <TrendingUp size={16} />, color: '#15803d', bg: '#dcfce7' },
    { id: 'entertainment', name: 'Concerts & Shows', icon: <Star size={16} />, color: '#c2410c', bg: '#ffedd5' },
]

const FEATURED_CALENDARS = [
    {
        id: '1',
        title: 'F1 2026 World Championship',
        category: 'Sports',
        description: 'Every Grand Prix, qualifying session, and sprint race synced to your schedule.',
        image: 'https://images.unsplash.com/photo-1542652694-40abf526446e?auto=format&fit=crop&q=80&w=800',
        subscribers: '1.2M',
        color: '#0f766e',
        bg: '#ccfbf1'
    },
    {
        id: '2',
        title: 'S&P 500 Earnings Season',
        category: 'Finance',
        description: 'Quarterly earnings calls, product announcements, and shareholder meetings for the top 500 companies.',
        image: 'https://images.unsplash.com/photo-1611562402179-813c6e9ea362?auto=format&fit=crop&q=80&w=800',
        subscribers: '850K',
        color: '#15803d',
        bg: '#dcfce7'
    },
    {
        id: '3',
        title: 'Global Music Festivals 2026',
        category: 'Local',
        description: 'The ultimate guide to major music festivals around the world this summer.',
        image: 'https://images.unsplash.com/photo-1540039155732-680cb7daaa3f?auto=format&fit=crop&q=80&w=800',
        subscribers: '320K',
        color: '#be185d',
        bg: '#fce7f3'
    },
    {
        id: '4',
        title: 'AI & Future Tech Summits',
        category: 'Local',
        description: 'Keynotes, networking, and product launches from leading tech hubs globally.',
        image: 'https://images.unsplash.com/photo-1555547633-8a38ae3b78eb?auto=format&fit=crop&q=80&w=800',
        subscribers: '45K',
        color: '#a16207',
        bg: '#fef08a'
    }
]

export const SocialDiscoverView: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [subscribed, setSubscribed] = useState<string[]>([])

    const toggleSubscription = (id: string) => {
        setSubscribed(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    return (
        <div className="social-view-container" style={{
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
                        Public Calendars
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

