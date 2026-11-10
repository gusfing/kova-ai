import React, { useState } from 'react'
import { Sparkles, X, Palette, Sliders, Check } from 'lucide-react'

const ACCENT_COLORS = [
    { id: 'emerald', label: 'Emerald', hex: '#10b981' },
    { id: 'amber', label: 'Amber', hex: '#f59e0b' },
    { id: 'sky', label: 'Sky Blue', hex: '#38bdf8' },
    { id: 'rose', label: 'Rose', hex: '#f43f5e' },
    { id: 'violet', label: 'Violet', hex: '#8b5cf6' },
]

export function SeedCustomizeModal({
    open = false,
    seed = { title: 'SaaS Platform Landing', prompt: 'Build a modern SaaS landing page.' },
    onClose = () => {},
    onConfirmBuild = () => {},
}) {
    const [title, setTitle] = useState(seed?.title || 'Modern SaaS Platform')
    const [selectedAccent, setSelectedAccent] = useState('emerald')
    const [targetAudience, setTargetAudience] = useState('AI developers and SaaS founders')
    const [extraNotes, setExtraNotes] = useState('Include dark obsidian styling, micro-borders, and high-converting CTA hero.')

    if (!open) return null

    const handleGenerate = () => {
        const customPrompt = `Build ${title} with ${selectedAccent} accent color, tailored for ${targetAudience}. Requirements: ${extraNotes}`
        onConfirmBuild(customPrompt)
        onClose()
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="hub-modal-card" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="modal-icon-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.35)' }}>
                            <Sliders size={18} style={{ color: 'var(--accent-emerald)' }} />
                        </div>
                        <div>
                            <h2 className="modal-title">Customize Starter: {seed?.title}</h2>
                            <p className="modal-subtitle">Tailor brand details, color palette, and audience before generation</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="btn-close-modal">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="hub-modal-body">
                    <div>
                        <label className="hub-label">Project / Site Name</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="hub-input"
                            placeholder="e.g. Kova Cloud Studio"
                        />
                    </div>

                    <div>
                        <label className="hub-label">Brand Accent Color</label>
                        <div className="flex gap-2.5 pt-1">
                            {ACCENT_COLORS.map(c => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setSelectedAccent(c.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        border: `1px solid ${selectedAccent === c.id ? c.hex : 'rgba(255,255,255,0.1)'}`,
                                        background: selectedAccent === c.id ? `${c.hex}20` : 'rgba(255,255,255,0.03)',
                                        color: selectedAccent === c.id ? '#fff' : '#a1a1aa',
                                        fontSize: '11px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.hex }} />
                                    <span>{c.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="hub-label">Target Audience / Niche</label>
                        <input
                            type="text"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            className="hub-input"
                            placeholder="e.g. Architects, coffee roasters, agency clients"
                        />
                    </div>

                    <div>
                        <label className="hub-label">Custom Requirements & Sections</label>
                        <textarea
                            rows={3}
                            value={extraNotes}
                            onChange={(e) => setExtraNotes(e.target.value)}
                            className="hub-textarea"
                            style={{ minHeight: '80px' }}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleGenerate}
                        className="btn-hub-primary"
                    >
                        <Sparkles size={15} />
                        <span>Build Custom Starter with AI</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
export default SeedCustomizeModal

