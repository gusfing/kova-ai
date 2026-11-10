import React, { useState } from 'react'
import { Globe, Rocket, Cloud, Server, ExternalLink, X, CheckCircle2, Loader2, Copy } from 'lucide-react'

export function PublishModal({
    open = false,
    projectName = 'Kova AI Flagship',
    onClose = () => {},
    onExportZip = () => {},
}) {
    const [target, setTarget] = useState('vercel')
    const [domain, setDomain] = useState('kova-site.vercel.app')
    const [publishing, setPublishing] = useState(false)
    const [publishedUrl, setPublishedUrl] = useState('')

    if (!open) return null

    const handleDeploy = () => {
        setPublishing(true)
        setTimeout(() => {
            setPublishing(false)
            setPublishedUrl(`https://${domain}`)
        }, 1500)
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="hub-modal-card" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="modal-icon-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.35)' }}>
                            <Rocket size={18} style={{ color: 'var(--accent-emerald)' }} />
                        </div>
                        <div>
                            <h2 className="modal-title">Publish & Deploy Project</h2>
                            <p className="modal-subtitle">Deploy {projectName} to global edge hosting or export production bundle</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="btn-close-modal">
                        <X size={16} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="hub-tab-bar">
                    <button
                        type="button"
                        onClick={() => setTarget('vercel')}
                        className={`hub-tab-btn html ${target === 'vercel' ? 'active' : ''}`}
                    >
                        <Cloud size={14} />
                        <span>Vercel Edge</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setTarget('netlify')}
                        className={`hub-tab-btn wp ${target === 'netlify' ? 'active' : ''}`}
                    >
                        <Globe size={14} />
                        <span>Netlify</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setTarget('wordpress')}
                        className={`hub-tab-btn github ${target === 'wordpress' ? 'active' : ''}`}
                    >
                        <Server size={14} />
                        <span>WordPress Sync</span>
                    </button>
                </div>

                {/* Body */}
                <div className="hub-modal-body">
                    {publishedUrl ? (
                        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center space-y-3">
                            <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                            <h3 className="font-bold text-white text-base">Your Site is Live on the Edge!</h3>
                            <a 
                                href={publishedUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-300 underline"
                            >
                                {publishedUrl} <ExternalLink size={12} />
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="hub-label">Deployment Target Domain</label>
                                <input
                                    type="text"
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    className="hub-input"
                                />
                                <span className="hub-sublabel">Zero-configuration continuous deployment branch from your local workspace.</span>
                            </div>

                            <div className="hub-info-box space-y-1">
                                <div className="font-semibold text-white">Edge Deployment Pipeline:</div>
                                <div>• Builds optimized Next.js 15 static assets & React Server Components.</div>
                                <div>• Binds headless WordPress REST API endpoints.</div>
                                <div>• Compresses CSS & images for sub-second Lighthouse scores.</div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleDeploy}
                                    disabled={publishing}
                                    className="btn-hub-primary"
                                    style={{ flex: 1 }}
                                >
                                    {publishing ? <Loader2 size={15} className="spinning" /> : <Rocket size={15} />}
                                    <span>{publishing ? 'Deploying to Edge…' : `Deploy to ${target.toUpperCase()}`}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onExportZip()
                                        onClose()
                                    }}
                                    className="btn-close-modal"
                                    style={{ width: 'auto', padding: '0 14px', height: 'auto' }}
                                    title="Export local ZIP archive"
                                >
                                    Export ZIP
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
export default PublishModal
