import React, { useState, useEffect } from 'react'
import { Globe, CheckCircle2, AlertCircle, RefreshCw, X, Server, Download, Sparkles, ExternalLink } from 'lucide-react'
import { LAB_BTN_PRIMARY, LAB_BTN_OUTLINE } from '../lib/labConstants'
import { IconWordPress, IconClose } from './Icons'

const DEFAULT_MANAGED_URL = 'http://127.0.0.1:8000'

export function WordPressConnectModal({
    open = false,
    onClose = () => {},
}) {
    const [customUrl, setCustomUrl] = useState('')
    const [activeUrl, setActiveUrl] = useState(DEFAULT_MANAGED_URL)
    const [isCustom, setIsCustom] = useState(false)
    const [testStatus, setTestStatus] = useState(null) // { checking: bool, ok: bool, message: string }
    const [savedNotice, setSavedNotice] = useState(false)

    useEffect(() => {
        if (!open) return
        const stored = typeof window !== 'undefined' ? localStorage.getItem('krikkit_custom_wp_url') : null
        if (stored && stored.trim()) {
            setCustomUrl(stored)
            setActiveUrl(stored)
            setIsCustom(true)
        } else {
            setActiveUrl(DEFAULT_MANAGED_URL)
            setIsCustom(false)
        }
        setTestStatus(null)
        setSavedNotice(false)
    }, [open])

    if (!open) return null

    const handleTest = async (urlToTest) => {
        const candidate = (urlToTest || customUrl || '').trim().replace(/\/+$/, '')
        if (!candidate) {
            setTestStatus({ checking: false, ok: false, message: 'Please enter a valid WordPress URL.' })
            return
        }
        setTestStatus({ checking: true, ok: null, message: 'Checking WordPress REST API (/wp-json/wp/v2/posts)...' })
        try {
            const res = await fetch(`${candidate}/wp-json/wp/v2/posts?per_page=1`, {
                headers: { Accept: 'application/json' },
            })
            if (res.ok) {
                const data = await res.json()
                const count = Array.isArray(data) ? data.length : 0
                setTestStatus({
                    checking: false,
                    ok: true,
                    message: `Connection successful! REST API is live and returned ${count > 0 ? 'posts' : '0 posts'}.`,
                })
            } else {
                setTestStatus({
                    checking: false,
                    ok: false,
                    message: `Endpoint returned HTTP ${res.status} (${res.statusText}). Make sure REST API is public.`,
                })
            }
        } catch (err) {
            setTestStatus({
                checking: false,
                ok: false,
                message: `Connection error: ${err.message || 'CORS or unreachable host'}. Make sure your WordPress allows CORS.`,
            })
        }
    }

    const handleApplyCustom = () => {
        const clean = (customUrl || '').trim().replace(/\/+$/, '')
        if (!clean) return
        localStorage.setItem('krikkit_custom_wp_url', clean)
        setActiveUrl(clean)
        setIsCustom(true)
        setSavedNotice(true)
        window.dispatchEvent(
            new CustomEvent('krikkit_wordpress_changed', {
                detail: { url: clean, isCustom: true },
            })
        )
        setTimeout(() => setSavedNotice(false), 3000)
    }

    const handleResetManaged = () => {
        localStorage.removeItem('krikkit_custom_wp_url')
        setCustomUrl('')
        setActiveUrl(DEFAULT_MANAGED_URL)
        setIsCustom(false)
        setTestStatus(null)
        setSavedNotice(true)
        window.dispatchEvent(
            new CustomEvent('krikkit_wordpress_changed', {
                detail: { url: DEFAULT_MANAGED_URL, isCustom: false },
            })
        )
        setTimeout(() => setSavedNotice(false), 3000)
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wp-connect-title"
            className="modal-backdrop"
            onClick={onClose}
        >
            <div className="hub-modal-card" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="modal-icon-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.35)' }}>
                            <Globe size={18} style={{ color: '#38bdf8' }} />
                        </div>
                        <div>
                            <h2 id="wp-connect-title" className="modal-title">
                                WordPress Integration & Headless Sync
                            </h2>
                            <p className="modal-subtitle">
                                Connect local or remote WordPress sites to hydrate Next.js frontends in real-time
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-close-modal"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="hub-modal-body">
                    {savedNotice && (
                        <div className="hub-status-alert">
                            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                            <span>WordPress configuration updated successfully!</span>
                        </div>
                    )}

                    {/* Method 1: Bring Your Own WordPress */}
                    <div
                        className={`hub-starter-card ${isCustom ? 'active' : ''}`}
                        style={{ cursor: 'default' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8' }}>Option 1</span>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Custom Remote WordPress</span>
                            </div>
                            {isCustom && (
                                <span style={{ borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.2)', padding: '2px 8px', fontSize: '9px', fontWeight: 700, color: '#34d399' }}>
                                    Active Target
                                </span>
                            )}
                        </div>
                        <p style={{ fontSize: '11px', color: '#a1a1aa', margin: '4px 0 10px 0', lineHeight: 1.4 }}>
                            Connect your agency or client WordPress site by entering its root domain address.
                        </p>

                        <div>
                            <label className="hub-label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                WordPress Root URL
                            </label>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <input
                                    type="url"
                                    placeholder="https://my-wordpress-blog.com"
                                    value={customUrl}
                                    onChange={(e) => setCustomUrl(e.target.value)}
                                    className="hub-input"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    disabled={testStatus?.checking || !customUrl.trim()}
                                    onClick={() => handleTest(customUrl)}
                                    style={{
                                        padding: '0 12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: '#e4e4e7',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {testStatus?.checking ? 'Testing...' : 'Test REST'}
                                </button>
                                <button
                                    type="button"
                                    disabled={!customUrl.trim()}
                                    onClick={handleApplyCustom}
                                    style={{
                                        padding: '0 14px',
                                        borderRadius: '8px',
                                        background: '#38bdf8',
                                        color: '#000000',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        border: 'none',
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Connect
                                </button>
                            </div>

                            {testStatus && (
                                <div
                                    className={`hub-status-alert ${testStatus.ok ? '' : 'error'}`}
                                    style={{ marginTop: '10px' }}
                                >
                                    {testStatus.ok ? (
                                        <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                                    ) : (
                                        <AlertCircle size={15} style={{ flexShrink: 0 }} />
                                    )}
                                    <span>{testStatus.message}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Method 2: Managed Local WordPress */}
                    <div
                        className={`hub-starter-card ${!isCustom ? 'active' : ''}`}
                        style={{ cursor: 'default' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#10b981' }}>Option 2</span>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Local Managed WordPress</span>
                            </div>
                            {!isCustom && (
                                <span style={{ borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.2)', padding: '2px 8px', fontSize: '9px', fontWeight: 700, color: '#34d399' }}>
                                    Active Target
                                </span>
                            )}
                        </div>
                        <p style={{ fontSize: '11px', color: '#a1a1aa', margin: '4px 0 10px 0', lineHeight: 1.4 }}>
                            Default local environment running on <span style={{ fontFamily: 'monospace', color: '#fff' }}>http://127.0.0.1:8000</span>.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                type="button"
                                onClick={() => handleTest(DEFAULT_MANAGED_URL)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#e4e4e7',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Test Local Status
                            </button>
                            {isCustom && (
                                <button
                                    type="button"
                                    onClick={handleResetManaged}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        color: '#34d399',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Reset to Managed
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: 'var(--bg-surface-elevated)' }}>
                    <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
                        Active endpoint: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#34d399' }}>{activeUrl}</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-close-secondary"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}
export default WordPressConnectModal

