import React, { useState, useEffect, useRef } from 'react'
import { Search, FileCode, FileText, File, X } from 'lucide-react'

export function FileJumpOverlay({
    open = false,
    files = [],
    onSelectFile = () => {},
    onClose = () => {}
}) {
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef(null)

    const filtered = files.filter(f => f.toLowerCase().includes(query.toLowerCase()))

    useEffect(() => {
        if (open) {
            setQuery('')
            setSelectedIndex(0)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [open])

    if (!open) return null

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (filtered[selectedIndex]) {
                onSelectFile(filtered[selectedIndex])
                onClose()
            }
        } else if (e.key === 'Escape') {
            e.preventDefault()
            onClose()
        }
    }

    return (
        <div 
            className="modal-backdrop"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-3 shadow-2xl z-50 flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Bar */}
                <div className="flex items-center gap-2.5 px-3 py-2 border-b border-white/10 bg-zinc-900/60 rounded-xl mb-2">
                    <Search className="size-4 text-zinc-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search files by name (Ctrl+P / Cmd+P)..."
                        className="w-full bg-transparent text-xs text-white placeholder-zinc-500 outline-none font-mono"
                    />
                    <kbd className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">ESC</kbd>
                </div>

                {/* Results List */}
                <div className="max-h-64 overflow-y-auto space-y-1 font-mono text-xs">
                    {filtered.length === 0 ? (
                        <div className="p-4 text-center text-zinc-500 text-xs">No files matching query</div>
                    ) : (
                        filtered.map((filePath, idx) => {
                            const isSelected = idx === selectedIndex
                            return (
                                <div
                                    key={filePath}
                                    onClick={() => {
                                        onSelectFile(filePath)
                                        onClose()
                                    }}
                                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                                        isSelected ? 'bg-emerald-500/15 text-emerald-400 font-semibold' : 'text-zinc-300 hover:bg-zinc-900'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <FileCode className="size-3.5 shrink-0 text-zinc-400" />
                                        <span className="truncate">{filePath}</span>
                                    </div>
                                    <span className="text-[10px] text-zinc-500">Jump</span>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
export default FileJumpOverlay

