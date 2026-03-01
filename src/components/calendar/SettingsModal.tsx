"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IntelligentSettings } from '../../lib/calendar-utils'

interface SettingsModalProps {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    settings: IntelligentSettings
    setSettings: (settings: IntelligentSettings) => void
    popoverPosition: any
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    setIsOpen,
    settings,
    setSettings,
    popoverPosition
}) => {
    const handleTimeChange = (category: keyof IntelligentSettings, field: 'start' | 'end', value: string) => {
        const numValue = parseInt(value)
        setSettings({
            ...settings,
            [category]: {
                ...settings[category],
                [field]: numValue
            }
        })
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="popover-overlay"
                    style={{ zIndex: 5000 }}
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        transition={{ type: "spring", stiffness: 450, damping: 30 }}
                        className="event-popover-card"
                        style={{
                            top: popoverPosition ? popoverPosition.y + popoverPosition.height + 8 : '15vh',
                            left: popoverPosition
                                ? (typeof window !== 'undefined' && popoverPosition.x > window.innerWidth / 2
                                    ? Math.max(20, popoverPosition.x - 340 + popoverPosition.width + 20)
                                    : Math.min(typeof window !== 'undefined' ? window.innerWidth - 340 : 1000, popoverPosition.x + 20))
                                : (typeof window !== 'undefined' ? window.innerWidth / 2 - 170 : 'calc(50% - 170px)'),
                            width: 340,
                            padding: '0'
                        }}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        {popoverPosition && <div className="popover-arrow" />}
                        <div className="command-input-container" style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="dropdown-label" style={{ border: 'none', padding: 0, marginBottom: 0 }}>SCHEDULE PREFERENCES</div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {(['morning', 'afternoon', 'evening', 'quietHours'] as const).map((cat) => (
                                    <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'capitalize', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                                            {cat === 'quietHours' ? 'Quiet Hours' : cat}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <select
                                                value={settings[cat].start}
                                                onChange={(e) => handleTimeChange(cat, 'start', e.target.value)}
                                                style={{ fontSize: '12px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border)', background: 'none' }}
                                            >
                                                {Array.from({ length: 24 }).map((_, i) => (
                                                    <option key={i} value={i}>{i}:00</option>
                                                ))}
                                            </select>
                                            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>to</span>
                                            <select
                                                value={settings[cat].end}
                                                onChange={(e) => handleTimeChange(cat, 'end', e.target.value)}
                                                style={{ fontSize: '12px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border)', background: 'none' }}
                                            >
                                                {Array.from({ length: 24 }).map((_, i) => (
                                                    <option key={i} value={i}>{i}:00</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="command-footer" style={{ padding: '12px 16px', gap: '16px' }}>
                            <div className="shortcut-hint" style={{ fontSize: '10px' }}><span className="key-cap" style={{ padding: '2px 4px' }}>esc</span> Close</div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
