import React from 'react'
import { LAB_BTN_OUTLINE } from '../lib/labConstants'

/**
 * Ephemeral suggested-reply chips under assistant messages or right above composer.
 * Clicking a chip sends that text immediately or fills the composer.
 */
export function SuggestionChips({ items = [], onPick, disabled = false }) {
    const chips = Array.isArray(items) ? items.filter(Boolean) : []
    if (!chips.length) return null

    return (
        <div
            className="flex flex-wrap items-center gap-1.5 py-1"
            role="group"
            aria-label="Suggested templates"
        >
            {chips.map((item) => {
                const label = typeof item === 'string' ? item : item.title
                const prompt = typeof item === 'string' ? item : item.prompt
                return (
                    <button
                        key={label}
                        type="button"
                        disabled={disabled}
                        onClick={() => onPick?.(prompt || label)}
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium text-zinc-300 bg-zinc-900/90 border border-white/10 hover:border-emerald-500/40 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer shadow-xs"
                    >
                        {label}
                    </button>
                )
            })}
        </div>
    )
}
export default SuggestionChips

