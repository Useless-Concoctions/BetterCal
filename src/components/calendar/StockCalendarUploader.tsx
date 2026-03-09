"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Check, TrendingUp, Loader2, Calendar } from 'lucide-react'
import { processStockScreenshot, getEarningsDates, addEarningsToCalendar } from '../../lib/stock-actions'
import { CalendarEvent } from '../../lib/calendar-utils'

interface StockCalendarUploaderProps {
    userId?: string;
    onComplete?: () => void;
}

export const StockCalendarUploader: React.FC<StockCalendarUploaderProps> = ({ userId, onComplete }) => {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [status, setStatus] = useState<'idle' | 'processing' | 'fetching' | 'confirming' | 'done' | 'error'>('idle')
    const [foundStocks, setFoundStocks] = useState<{ symbol: string; companyName: string; earningsDate: Date }[]>([])
    const [errorMsg, setErrorMsg] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected) {
            setFile(selected)
            const reader = new FileReader()
            reader.onloadend = () => setPreview(reader.result as string)
            reader.readAsDataURL(selected)
            setStatus('idle')
        }
    }

    const handleProcess = async () => {
        if (!preview) return

        try {
            setStatus('processing')
            const symbols = await processStockScreenshot(preview)

            if (symbols.length === 0) {
                setStatus('error')
                setErrorMsg('No stock symbols identified. Try a clearer screenshot.')
                return
            }

            setStatus('fetching')
            const earnings = await getEarningsDates(symbols)

            if (earnings.length === 0) {
                setStatus('error')
                setErrorMsg('No upcoming earnings dates found for these symbols.')
                return
            }

            setFoundStocks(earnings)
            setStatus('confirming')
        } catch (err: any) {
            setStatus('error')
            setErrorMsg(err.message || 'Something went wrong.')
        }
    }

    const handleConfirm = async () => {
        if (!userId) {
            // If guest mode, we'd need to add to local state
            // For now, let's assume login for this advanced feature or hint it
            setStatus('error')
            setErrorMsg('Please log in to save to your calendar.')
            return
        }

        try {
            await addEarningsToCalendar(userId, foundStocks)
            setStatus('done')
            setTimeout(() => {
                if (onComplete) onComplete()
            }, 2000)
        } catch (err) {
            setStatus('error')
            setErrorMsg('Failed to add to calendar.')
        }
    }

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '500px',
            width: '100%',
            color: 'var(--foreground)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'var(--socal-grad-1, #38bdf8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}>
                    <TrendingUp size={20} />
                </div>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>Personalized Subscription</h2>
                    <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Subscribe to events based on your holdings</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {status === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                        {!preview ? (
                            <label style={{
                                border: '2px dashed rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                padding: '40px 20px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: 'rgba(255, 255, 255, 0.02)'
                            }}>
                                <Upload size={24} style={{ color: 'var(--muted)' }} />
                                <span style={{ fontSize: '14px', fontWeight: 600 }}>Drop screenshot or click to upload</span>
                                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                            </label>
                        ) : (
                            <div style={{ position: 'relative' }}>
                                <img src={preview} alt="Stock Preview" style={{ width: '100%', borderRadius: '12px', maxHeight: '200px', objectFit: 'cover' }} />
                                <button
                                    onClick={() => { setPreview(null); setFile(null); }}
                                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', color: 'white' }}
                                >
                                    <X size={16} />
                                </button>
                                <button
                                    onClick={handleProcess}
                                    style={{
                                        marginTop: '16px',
                                        width: '100%',
                                        padding: '12px',
                                        background: 'var(--foreground)',
                                        color: 'var(--background)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: 700,
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Find Related Calendars
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {(status === 'processing' || status === 'fetching') && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '40px 0' }}
                    >
                        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--socal-grad-1)' }} />
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontWeight: 700 }}>{status === 'processing' ? 'Identifying Stocks...' : 'Fetching Earnings...'}</p>
                            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                                {status === 'processing' ? 'Gemini is reading your screenshot' : 'Checking upcoming earnings calls'}
                            </p>
                        </div>
                    </motion.div>
                )}

                {status === 'confirming' && (
                    <motion.div
                        key="confirm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
                            {foundStocks.map((stock, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '14px' }}>{stock.symbol}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{stock.companyName}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{new Date(stock.earningsDate).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--socal-grad-1)' }}>Public Calendar</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleConfirm}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'var(--socal-grad-1, #38bdf8)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 700,
                                fontSize: '14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <Calendar size={16} /> Follow All
                        </button>
                    </motion.div>
                )}

                {status === 'done' && (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px 0' }}
                    >
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <Check size={32} />
                        </div>
                        <p style={{ fontWeight: 800, fontSize: '18px' }}>Sync Complete!</p>
                        <p style={{ fontSize: '14px', color: 'var(--muted)' }}>Your earnings calendar is up to date.</p>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
                    >
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                            <X size={24} />
                        </div>
                        <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '14px', fontWeight: 600 }}>{errorMsg}</p>
                        <button
                            onClick={() => setStatus('idle')}
                            style={{ background: 'none', border: 'none', color: 'var(--foreground)', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }}
                        >
                            Try Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
