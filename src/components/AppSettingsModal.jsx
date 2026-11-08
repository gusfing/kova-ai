import React, { useState, useEffect } from 'react'
import { Settings, X, Globe, Save, Keyboard, Shield, Cpu, RefreshCw, CheckCircle2 } from 'lucide-react'
import { LAB_BTN_PRIMARY, LAB_BTN_OUTLINE } from '../lib/labConstants'

function LabSwitch({ checked, onChange, label }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange?.(!checked)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
                checked ? 'bg-emerald-500' : 'bg-zinc-800'
            }`}
        >
            <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-md ${
                    checked ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    )
}

function SettingsRow({ title, description, children }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-white/10 py-4 last:border-b-0">
            <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">{description}</p>
            </div>
            <div className="shrink-0 pt-0.5">{children}</div>
        </div>
    )
}

export function AppSettingsModal({
    open = false,
    onClose = () => {},
    onConfigureWordPress = null,
}) {
    const [autoSave, setAutoSave] = useState(() => localStorage.getItem('kova_auto_save') !== 'false')
    const [showShortcuts, setShowShortcuts] = useState(true)

    const handleToggleAutoSave = (val) => {
        setAutoSave(val)
        localStorage.setItem('kova_auto_save', val ? 'true' : 'false')
    }

    if (!open) return null

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-dialog-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
            <div
                className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-200">
                            <Settings className="size-5" />
                        </div>
                        <div>
                            <h2 id="settings-dialog-title" className="text-base font-bold text-white tracking-tight">
                                App Settings & Preferences
                            </h2>
                            <p className="text-xs text-zinc-400">Configure workspace auto-save, WordPress syncing, and shortcuts</p>
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
                <div className="flex-1 overflow-y-auto py-2 divide-y divide-white/10">
                    <SettingsRow
                        title="Auto Save"
                        description="Automatically write generated components and edits to disk as you build."
                    >
                        <LabSwitch
                            checked={autoSave}
                            onChange={handleToggleAutoSave}
                            label="Toggle Auto Save"
                        />
                    </SettingsRow>

                    <SettingsRow
                        title="WordPress Core Connection"
                        description="Configure headless WordPress endpoint for live posts and WooCommerce sync."
                    >
                        <button
                            type="button"
                            onClick={() => {
                                onClose()
                                onConfigureWordPress?.()
                            }}
                            className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-400 hover:bg-sky-500/20 transition cursor-pointer flex items-center gap-1.5"
                        >
                            <Globe className="size-3.5" />
                            <span>Configure</span>
                        </button>
                    </SettingsRow>

                    <SettingsRow
                        title="Local AI Engines"
                        description="LM Studio (127.0.0.1:1234) and Ollama (127.0.0.1:11434) zero-token cost inference."
                    >
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                            Ready
                        </span>
                    </SettingsRow>

                    <div className="py-4">
                        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
                            <Keyboard className="size-4" />
                            <span>Workspace Shortcuts</span>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1">
                                <span className="text-zinc-400">Trigger Slash Commands Menu</span>
                                <kbd className="font-mono bg-zinc-900 border border-white/10 px-2 py-0.5 rounded text-emerald-400">/</kbd>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-zinc-400">Send Chat Prompt</span>
                                <kbd className="font-mono bg-zinc-900 border border-white/10 px-2 py-0.5 rounded text-zinc-300">Enter</kbd>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-zinc-400">New Line in Chat</span>
                                <kbd className="font-mono bg-zinc-900 border border-white/10 px-2 py-0.5 rounded text-zinc-300">Shift + Enter</kbd>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-zinc-400">Dismiss Overlays / Modals</span>
                                <kbd className="font-mono bg-zinc-900 border border-white/10 px-2 py-0.5 rounded text-zinc-300">Esc</kbd>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end border-t border-white/10 pt-4 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}
export default AppSettingsModal
