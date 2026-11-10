import React from 'react'

export function SaveTray({
    dirtyCount = 0,
    autoSave = false,
    saving = false,
    onSave = () => {},
    onToggleAutoSave = () => {},
    onDiscard = () => {},
}) {
    if (autoSave || dirtyCount === 0) return null

    return (
        <div className="fixed right-5 bottom-5 z-40 flex flex-col items-end gap-1.5 pointer-events-auto">
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-950/90 p-1.5 shadow-2xl backdrop-blur-md">
                <button
                    type="button"
                    onClick={onSave}
                    disabled={saving}
                    className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 text-xs font-bold transition cursor-pointer shadow-md disabled:opacity-40"
                >
                    {saving ? 'Saving…' : dirtyCount > 1 ? `Save ${dirtyCount} files` : 'Save Changes'}
                </button>
                <button
                    type="button"
                    onClick={onToggleAutoSave}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                >
                    Auto save: Off
                </button>
                <button
                    type="button"
                    onClick={onDiscard}
                    disabled={saving}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 transition cursor-pointer"
                >
                    Discard
                </button>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono pr-2">
                Unsaved changes · Press Ctrl+S
            </span>
        </div>
    )
}
export default SaveTray
