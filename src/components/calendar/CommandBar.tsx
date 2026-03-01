import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'

interface CommandBarProps {
    isCommandOpen: boolean
    setIsCommandOpen: (open: boolean) => void
    commandInput: string
    setCommandInput: (val: string) => void
    popoverPosition: any
    parsedPreview: any
    onEnter: () => void
}

export const CommandBar: React.FC<CommandBarProps> = ({
    isCommandOpen,
    setIsCommandOpen,
    commandInput,
    setCommandInput,
    popoverPosition,
    parsedPreview,
    onEnter
}) => {
    return (
        <AnimatePresence>
            {isCommandOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="popover-overlay"
                    style={{ zIndex: 5000 }}
                    onClick={() => setIsCommandOpen(false)}
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
                        <div className="command-input-container" style={{ padding: '16px', paddingBottom: parsedPreview && commandInput.trim() ? '12px' : '16px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                            <input
                                autoFocus
                                type="text"
                                className="command-input"
                                style={{ fontSize: '15px', width: '100%' }}
                                placeholder="New event..."
                                value={commandInput}
                                onChange={e => setCommandInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && commandInput) {
                                        onEnter()
                                    }
                                }}
                            />
                            <AnimatePresence>
                                {parsedPreview && commandInput.trim() && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="smart-pill-container"
                                        style={{ padding: 0, margin: 0 }}
                                    >
                                        {parsedPreview.frequency !== 'daily' && (
                                            <div className="smart-pill pill-time">
                                                {parsedPreview.hasTime ? format(parsedPreview.start, 'MMM d, h:mm a') : format(parsedPreview.start, 'MMM d, yyyy')}
                                            </div>
                                        )}
                                        {parsedPreview.duration !== 60 && (
                                            <div className="smart-pill pill-duration">
                                                {parsedPreview.duration >= 60 ? `${(parsedPreview.duration / 60).toFixed(1).replace('.0', '')}h` : `${parsedPreview.duration}m`}
                                            </div>
                                        )}
                                        {parsedPreview.preferredTime && (
                                            <div className="smart-pill pill-time" style={{ textTransform: 'capitalize' }}>
                                                {parsedPreview.preferredTime}
                                            </div>
                                        )}
                                        {parsedPreview.frequency && (
                                            <div className="smart-pill" style={{ textTransform: 'capitalize' }}>
                                                🔁 {parsedPreview.frequency}
                                            </div>
                                        )}
                                        {parsedPreview.isGoal && !parsedPreview.hasTime && (
                                            <div className="smart-pill pill-goal">
                                                ✦ Flexible Goal
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="command-footer" style={{ padding: '12px 16px', gap: '16px' }}>
                            <div className="shortcut-hint" style={{ fontSize: '10px' }}><span className="key-cap" style={{ padding: '2px 4px' }}>↵</span> Create</div>
                            <div className="shortcut-hint" style={{ fontSize: '10px' }}><span className="key-cap" style={{ padding: '2px 4px' }}>esc</span> Close</div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
