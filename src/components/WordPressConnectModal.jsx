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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
            <div
                className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                            <Globe className="size-5" />
                        </div>
                        <div>
                            <h2 id="wp-connect-title" className="text-base font-bold text-white tracking-tight">
                                WordPress Integration & Headless Sync
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Connect local or remote WordPress sites to hydrate Next.js frontends in real-time
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {savedNotice && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                            <span>WordPress configuration updated successfully!</span>
                        </div>
                    )}

                    {/* Method 1: Bring Your Own WordPress */}
                    <div
                        className={`rounded-xl border p-4 transition-all ${
                            isCustom ? 'border-sky-500/50 bg-sky-500/5' : 'border-white/10 bg-zinc-900/40'
                        }`}
                    >
                        <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">Option 1</span>
                                <span className="text-sm font-bold text-white">Custom Remote WordPress</span>
                            </div>
                            {isCustom && (
                                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                    Active Target
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                            Connect your agency or client WordPress site by entering its root domain address.
                        </p>

                        <div className="space-y-2">
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                                WordPress Root URL
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    placeholder="https://my-wordpress-blog.com"
                                    value={customUrl}
                                    onChange={(e) => setCustomUrl(e.target.value)}
                                    className="flex-1 rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-sky-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    disabled={testStatus?.checking || !customUrl.trim()}
                                    onClick={() => handleTest(customUrl)}
                                    className="rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer"
                                >
                                    {testStatus?.checking ? 'Testing...' : 'Test REST'}
                                </button>
                                <button
                                    type="button"
                                    disabled={!customUrl.trim()}
                                    onClick={handleApplyCustom}
                                    className="rounded-xl px-3.5 py-2 text-xs font-bold bg-sky-500 hover:bg-sky-400 text-black transition-colors cursor-pointer disabled:opacity-40"
                                >
                                    Connect
                                </button>
                            </div>

                            {testStatus && (
                                <div
                                    className={`mt-2 rounded-xl p-2.5 text-xs leading-relaxed flex items-center gap-2 ${
                                        testStatus.ok
                                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                                    }`}
                                >
                                    {testStatus.ok ? (
                                        <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                                    ) : (
                                        <AlertCircle className="size-4 shrink-0 text-rose-400" />
                                    )}
                                    <span>{testStatus.message}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Method 2: Managed Local WordPress */}
                    <div
                        className={`rounded-xl border p-4 transition-all ${
                            !isCustom ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-zinc-900/40'
                        }`}
                    >
                        <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Option 2</span>
                                <span className="text-sm font-bold text-white">Local Managed WordPress</span>
                            </div>
                            {!isCustom && (
                                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                    Active Target
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                            Default local environment running on <span className="font-mono text-zinc-200">http://127.0.0.1:8000</span>.
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleTest(DEFAULT_MANAGED_URL)}
                                className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
                            >
                                Test Local Status
                            </button>
                            {isCustom && (
                                <button
                                    type="button"
                                    onClick={handleResetManaged}
                                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
                                >
                                    Reset to Managed
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-white/10 pt-4 shrink-0 text-xs text-zinc-400">
                    <div>
                        Active endpoint: <span className="font-mono font-bold text-emerald-400">{activeUrl}</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 font-medium text-white transition cursor-pointer"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}
export default WordPressConnectModal
