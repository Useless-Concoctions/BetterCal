"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Check, Image as ImageIcon, Loader2, Calendar } from 'lucide-react'
import { processGenericScreenshot } from '../../lib/gemini-actions'
import { createEvent } from '../../lib/actions'

interface EventIngestorProps {
    userId?: string;
    onComplete?: () => void;
}

export const EventIngestor: React.FC<EventIngestorProps> = ({ userId, onComplete }) => {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [status, setStatus] = useState<'idle' | 'processing' | 'confirming' | 'done' | 'error'>('idle')
    const [parsedEvent, setParsedEvent] = useState<any>(null)
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
            const eventData = await processGenericScreenshot(preview)

            if (!eventData) {
                setStatus('error')
                setErrorMsg('Could not find any event details in this image. Try another one.')
                return
            }

            setParsedEvent(eventData)
            setStatus('confirming')
        } catch (err: unknown) {
            setStatus('error')
            setErrorMsg((err as Error).message || 'Something went wrong.')
        }
    }

    const handleConfirm = async () => {
        if (!userId) {
            setStatus('error')
            setErrorMsg('Please log in to save to your calendar.')
            return
        }

        try {
            await createEvent(userId, {
                title: parsedEvent.title,
                start: new Date(parsedEvent.start),
                end: parsedEvent.end ? new Date(parsedEvent.end) : new Date(new Date(parsedEvent.start).getTime() + 60 * 60 * 1000),
                location: parsedEvent.location,
                emoji: parsedEvent.emoji || '📅',
                source: 'ingested',
                isGoal: false,
                confirmed: true
            })
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
                    background: 'linear-gradient(135deg, #f43f5e, #eab308)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}>
                    <ImageIcon size={20} />
                </div>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>Magic Ingestion</h2>
                    <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Upload a flyer or screenshot to add it to your calendar</p>
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
                                <span style={{ fontSize: '14px', fontWeight: 600 }}>Drop an image or click to upload</span>
                                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                            </label>
                        ) : (
                            <div style={{ position: 'relative' }}>
                                <img src={preview} alt="Event Preview" style={{ width: '100%', borderRadius: '12px', maxHeight: '200px', objectFit: 'cover' }} />
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
                                    Extract Event Details
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {status === 'processing' && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '40px 0' }}
                    >
                        <Loader2 size={32} className="animate-spin" style={{ color: '#f43f5e' }} />
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontWeight: 700 }}>Reading Image...</p>
                            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                                Gemini is analyzing the text and context
                            </p>
                        </div>
                    </motion.div>
                )}

                {status === 'confirming' && parsedEvent && (
                    <motion.div
                        key="confirm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '24px' }}>{parsedEvent.emoji || '📅'}</span>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>{parsedEvent.title}</h3>
                            </div>

                            <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                                <div style={{ display: 'flex', gap: '8px', color: 'var(--muted)' }}>
                                    <span style={{ fontWeight: 600, width: '60px' }}>Date:</span>
                                    <span style={{ color: 'var(--foreground)' }}>{new Date(parsedEvent.start).toLocaleString()}</span>
                                </div>
                                {parsedEvent.location && (
                                    <div style={{ display: 'flex', gap: '8px', color: 'var(--muted)' }}>
                                        <span style={{ fontWeight: 600, width: '60px' }}>Location:</span>
                                        <span style={{ color: 'var(--foreground)' }}>{parsedEvent.location}</span>
                                    </div>
                                )}
                                {parsedEvent.description && (
                                    <div style={{ display: 'flex', gap: '8px', color: 'var(--muted)' }}>
                                        <span style={{ fontWeight: 600, width: '60px' }}>Details:</span>
                                        <span style={{ color: 'var(--foreground)' }}>{parsedEvent.description}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleConfirm}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'linear-gradient(135deg, #f43f5e, #eab308)',
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
                            <Calendar size={16} /> Add to Calendar
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
                        <p style={{ fontWeight: 800, fontSize: '18px' }}>Added to Calendar!</p>
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
