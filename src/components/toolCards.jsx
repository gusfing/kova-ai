import React, { useState } from 'react'
import { FileCode, Terminal, CheckCircle2, AlertCircle, ChevronDown, ChevronRight, PenTool, Wrench, Sparkles, RefreshCw } from 'lucide-react'

/**
 * WriteFileCard - Displays file write activity in chat stream
 */
export function WriteFileCard({ path = '', linesCount = 0, onOpenFile }) {
    const fileName = path.replace(/\\/g, '/').split('/').pop() || path
    const [open, setOpen] = useState(false)

    return (
        <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-2.5 my-1.5 transition-all hover:border-emerald-500/30">
            <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
                        <PenTool className="size-3" />
                    </span>
                    <span className="font-mono text-zinc-200 truncate">{fileName}</span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">wrote</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {linesCount > 0 && (
                        <span className="text-[11px] font-mono text-emerald-400">+{linesCount} lines</span>
                    )}
                    {onOpenFile && (
                        <button
                            type="button"
                            onClick={() => onOpenFile(path)}
                            className="rounded px-2 py-0.5 text-[10px] font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition cursor-pointer"
                        >
                            View
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

/**
 * EditFileCard - Displays AST diff / patch edits in chat stream
 */
export function EditFileCard({ path = '', added = 0, removed = 0, onOpenFile }) {
    const fileName = path.replace(/\\/g, '/').split('/').pop() || path

    return (
        <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-2.5 my-1.5 transition-all hover:border-sky-500/30">
            <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-400">
                        <FileCode className="size-3" />
                    </span>
                    <span className="font-mono text-zinc-200 truncate">{fileName}</span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">patched</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-emerald-400">+{added}</span>
                    <span className="text-[11px] font-mono text-rose-400">-{removed}</span>
                    {onOpenFile && (
                        <button
                            type="button"
                            onClick={() => onOpenFile(path)}
                            className="rounded px-2 py-0.5 text-[10px] font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition cursor-pointer"
                        >
                            Diff
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

/**
 * ShellCard - Displays terminal command execution in chat stream
 */
export function ShellCard({ command = '', exitCode = 0, output = '' }) {
    const [expanded, setExpanded] = useState(false)
    const success = exitCode === 0

    return (
        <div className="rounded-xl border border-white/10 bg-zinc-900/80 my-1.5 overflow-hidden">
            <div 
                className="flex items-center justify-between gap-2 p-2.5 text-xs cursor-pointer hover:bg-white/5 transition"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <span className={`flex size-5 shrink-0 items-center justify-center rounded-md ${success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        <Terminal className="size-3" />
                    </span>
                    <code className="text-zinc-300 font-mono text-[11px] truncate">$ {command}</code>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {success ? 'exit 0' : `exit ${exitCode}`}
                    </span>
                    {expanded ? <ChevronDown className="size-3 text-zinc-500" /> : <ChevronRight className="size-3 text-zinc-500" />}
                </div>
            </div>

            {expanded && output && (
                <div className="border-t border-white/10 bg-black/60 p-2.5 font-mono text-[11px] text-zinc-400 max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {output}
                </div>
            )}
        </div>
    )
}

/**
 * TodoCard - Displays checklist tasks as agent plans and executes them
 */
export function TodoCard({ items = [], title = 'Autonomous Plan Tasks' }) {
    if (!items || items.length === 0) return null
    const doneCount = items.filter(i => i.done).length

    return (
        <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-3 my-2">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white tracking-tight">{title}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full">
                    {doneCount}/{items.length} Done
                </span>
            </div>

            <div className="space-y-1.5">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                        <span className={`flex size-4 shrink-0 items-center justify-center rounded-full mt-0.5 ${item.done ? 'bg-emerald-500 text-black font-bold' : 'border border-zinc-700 bg-zinc-800'}`}>
                            {item.done ? '✓' : ''}
                        </span>
                        <span className={item.done ? 'text-zinc-500 line-through' : 'text-zinc-300'}>
                            {item.label || item.text || item}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * RuntimeErrorCard - Appears when preview error occurs, offers one-click AI Auto-Repair
 */
export function RuntimeErrorCard({ error = '', onAutoRepair }) {
    if (!error) return null

    return (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 my-2 text-xs">
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-rose-400 font-semibold">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>Runtime / Build Exception Detected</span>
                </div>
                {onAutoRepair && (
                    <button
                        type="button"
                        onClick={() => onAutoRepair(error)}
                        className="flex items-center gap-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-black px-2.5 py-1 text-[11px] font-bold transition cursor-pointer shadow-md"
                    >
                        <Wrench className="size-3" />
                        <span>Fix with AI</span>
                    </button>
                )}
            </div>
            <div className="rounded-lg bg-black/60 p-2 font-mono text-[10px] text-rose-300 max-h-32 overflow-y-auto whitespace-pre-wrap border border-rose-500/20">
                {error}
            </div>
        </div>
    )
}

