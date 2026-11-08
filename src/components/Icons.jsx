import React from 'react'

export function LabIcon({ className = 'h-4 w-4' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 5v4M8 2h2a2 2 0 0 1 2 2v1h-2a2 2 0 0 1-2-2zm8.815 20h-9.63a1.185 1.185 0 0 1-1.029-1.773L10 13.5V9h4v4.5l3.844 6.727A1.185 1.185 0 0 1 16.814 22M9 9h6m1-6h-2a2 2 0 0 0-2 2v1h2a2 2 0 0 0 2-2z"
            />
        </svg>
    )
}

export function LabGlyph({ className = '', disc = false }) {
    return (
        <span
            className={[
                'inline-flex size-5 shrink-0 items-center justify-center leading-none',
                disc ? 'rounded-full bg-emerald-500/15 text-emerald-400' : '',
                className,
            ].filter(Boolean).join(' ')}
            aria-hidden
        >
            <LabIcon className="size-3.5" />
        </span>
    )
}

export function IconSend({ className = 'h-4 w-4' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M12 19V5" />
            <path d="m5 12 7-7 7 7" />
        </svg>
    )
}

export function IconAttach({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M16.5 7.5v7.25a4.25 4.25 0 1 1-8.5 0V7a2.75 2.75 0 0 1 5.5 0v7.25a1.25 1.25 0 1 1-2.5 0V8.25"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export function IconClose({ className = 'h-3.5 w-3.5' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export function IconWordPress({ className = 'h-5 w-5' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18.06A8.06 8.06 0 0 1 3.94 12c0-.52.06-1.03.16-1.52l4.8 13.16a8.04 8.04 0 0 1-4.96-5.58zm5.55-10.45c.2 1.34-.14 2.87-.93 4.54l-2.02 5.86-2.9-8.63c.63-.03 1.23-.1 1.23-.1.49-.06.43-.8-.06-.77 0 0-1.48.12-2.43.12-.91 0-2.4-.12-2.4-.12-.49-.03-.55.71-.06.77 0 0 .58.07 1.17.1l3.52 9.9-4.8-14.28c.63-.33 1.32-.57 2.05-.72l4.5 13.04 2.45-7.7c-.36-.96-.7-1.74-1.12-2.22-.54-.6-1.06-.66-1.52-.69-.49-.03-.55-.71-.06-.77 0 0 1.48.12 2.4.12.94 0 2.43-.12 2.43-.12.49-.03.55.71.06.77 0 0-.58.07-1.18.1zM12 3.94c1.19 0 2.32.26 3.34.73l-4.7 13.68L6.87 7.02c.7-.06 1.42-.08 2.1-.08 1.13 0 2.23.09 3.03.2z" />
        </svg>
    )
}

export function IconGithub({ className = 'h-5 w-5' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
    )
}

export function IconCode({ className = 'h-5 w-5' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
        </svg>
    )
}

export function IconPlus({ className = 'size-4' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
            />
        </svg>
    )
}

export function IconUpload({ className = 'size-4' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12 16V5M8 8l4-4 4 4M5 19h14"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export function IconInspect({ className = 'size-4' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="22" y1="12" x2="18" y2="12" />
            <line x1="6" y1="12" x2="2" y2="12" />
            <line x1="12" y1="6" x2="12" y2="2" />
            <line x1="12" y1="22" x2="12" y2="18" />
        </svg>
    )
}
