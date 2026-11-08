import React, { useState, useRef, useEffect } from 'react'
import { Plus, Globe, Code2, GitBranch, Upload, Sparkles, FolderArchive } from 'lucide-react'
import { IconWordPress, IconGithub, IconCode, IconPlus, IconUpload } from './Icons'

export function ComposerPlusMenu({
    disabled = false,
    onOpenImportHub,
    onOpenWordPress,
    onUploadComputer,
}) {
    const [open, setOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    const handleSelect = (action) => {
        setOpen(false)
        if (action === 'html') onOpenImportHub?.('html')
        else if (action === 'wp') onOpenImportHub?.('wp')
        else if (action === 'github') onOpenImportHub?.('github')
        else if (action === 'wordpress-bridge') onOpenWordPress?.()
        else if (action === 'upload') onUploadComputer?.()
    }

    return (
        <div className="relative inline-block" ref={menuRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-zinc-900/80 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white disabled:pointer-events-none disabled:opacity-40 ${
                    open ? 'bg-zinc-800 text-emerald-400 border-emerald-500/40' : ''
                }`}
                title="Add content, templates or connect WordPress"
                aria-label="Add options"
            >
                <Plus className="size-4" />
            </button>

            {open && (
                <div
                    className="absolute bottom-full left-0 mb-2 w-64 z-50 rounded-xl border border-white/10 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-md"
                    role="menu"
                >
                    <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        Import & Connect
                    </div>

                    <button
                        type="button"
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-zinc-200 transition hover:bg-emerald-500/10 hover:text-emerald-300 cursor-pointer"
                        onClick={() => handleSelect('html')}
                    >
                        <Code2 className="size-4 shrink-0 text-emerald-400" />
                        <div>
                            <div className="font-medium">HTML / CSS Template</div>
                            <div className="text-[10px] text-zinc-400">Import HTML code or zip file directly</div>
                        </div>
                    </button>

                    <button
                        type="button"
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-zinc-200 transition hover:bg-sky-500/10 hover:text-sky-300 cursor-pointer"
                        onClick={() => handleSelect('wp')}
                    >
                        <Globe className="size-4 shrink-0 text-sky-400" />
                        <div>
                            <div className="font-medium">WordPress Themes & Starters</div>
                            <div className="text-[10px] text-zinc-400">Headless Blog, WooCommerce, Portfolio</div>
                        </div>
                    </button>

                    <button
                        type="button"
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-zinc-200 transition hover:bg-purple-500/10 hover:text-purple-300 cursor-pointer"
                        onClick={() => handleSelect('wordpress-bridge')}
                    >
                        <Sparkles className="size-4 shrink-0 text-purple-400" />
                        <div>
                            <div className="font-medium">Connect WordPress Site</div>
                            <div className="text-[10px] text-zinc-400">Connect live REST API & sync content</div>
                        </div>
                    </button>

                    <button
                        type="button"
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-zinc-200 transition hover:bg-zinc-800 hover:text-white cursor-pointer"
                        onClick={() => handleSelect('github')}
                    >
                        <GitBranch className="size-4 shrink-0 text-amber-400" />
                        <div>
                            <div className="font-medium">Import from GitHub</div>
                            <div className="text-[10px] text-zinc-400">Clone and mount git repository</div>
                        </div>
                    </button>

                    <div className="my-1 border-t border-white/10" />

                    <button
                        type="button"
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-zinc-300 transition hover:bg-zinc-800 hover:text-white cursor-pointer"
                        onClick={() => handleSelect('upload')}
                    >
                        <Upload className="size-4 shrink-0 text-zinc-400" />
                        <span className="font-medium">Upload File from Computer</span>
                    </button>
                </div>
            )}
        </div>
    )
}
export default ComposerPlusMenu
