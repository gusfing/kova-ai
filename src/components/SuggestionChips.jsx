import React from 'react'

/**
 * Ephemeral suggested-reply chips under assistant messages or right above composer.
 * Clicking a chip opens the customize modal or sends the prompt directly.
 */
export function SuggestionChips({ items = [], onPick, disabled = false }) {
    const chips = Array.isArray(items) ? items.filter(Boolean) : []
    if (!chips.length) return null

    return (
        <div
            className="flex flex-wrap items-center gap-1.5 py-1"
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', padding: '4px 0' }}
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
                        className="suggestion-chip-btn"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '9999px',
                            padding: '4px 12px',
                            fontSize: '11.5px',
                            fontWeight: 500,
                            color: '#d4d4d8',
                            backgroundColor: 'rgba(24, 24, 27, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            transition: 'all 0.18s ease',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                            fontFamily: 'inherit',
                            outline: 'none',
                        }}
                        onMouseEnter={(e) => {
                            if (!disabled) {
                                e.currentTarget.style.backgroundColor = '#27272a'
                                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)'
                                e.currentTarget.style.color = '#ffffff'
                                e.currentTarget.style.transform = 'translateY(-1px)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!disabled) {
                                e.currentTarget.style.backgroundColor = 'rgba(24, 24, 27, 0.9)'
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                                e.currentTarget.style.color = '#d4d4d8'
                                e.currentTarget.style.transform = 'none'
                            }
                        }}
                    >
                        {label}
                    </button>
                )
            })}
        </div>
    )
}
export default SuggestionChips
