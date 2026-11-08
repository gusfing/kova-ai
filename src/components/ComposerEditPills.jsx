import React from 'react'
import { Image, Link2, SquareDashedTopSolid, Type } from 'lucide-react'
import { IconClose } from './Icons'

const ICONS = {
    type: Type,
    card: SquareDashedTopSolid,
    link: Link2,
    image: Image,
}

/**
 * Inspect targets pill badges â€” icon and label share one cap-height.
 */
export function ComposerEditPills({
    targets = [],
    onRemove,
    disabled = false,
    className = '',
}) {
    if (!targets.length) return null

    return (
        <div className={`flex max-w-full flex-wrap gap-1.5 py-1 ${className}`}>
            {targets.map((target) => {
                const Icon = ICONS[target.icon] || SquareDashedTopSolid
                const label = target.label || target.name || target.id || 'Selected Element'
                return (
                    <span
                        key={target.id}
                        title={label}
                        className="inline-flex max-w-[14rem] items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] leading-tight text-emerald-300 shadow-sm"
                    >
                        <Icon className="block size-3 shrink-0 text-emerald-400" strokeWidth={2} />
                        <span className="min-w-0 truncate font-mono">{label}</span>
                        {onRemove ? (
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={() => onRemove(target.id)}
                                className="inline-flex size-3.5 shrink-0 items-center justify-center rounded text-emerald-400/70 hover:text-white hover:bg-emerald-500/20"
                                aria-label={`Remove ${label}`}
                            >
                                <IconClose className="size-2.5" />
                            </button>
                        ) : null}
                    </span>
                )
            })}
        </div>
    )
}
export default ComposerEditPills

