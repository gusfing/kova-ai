import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Folder, FolderOpen, FileCode, FileText, File, Plus, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react'

function getFileIcon(fileName) {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) return <FileCode className="size-3.5 text-sky-400 shrink-0" />
    if (fileName.endsWith('.ts') || fileName.endsWith('.js')) return <FileCode className="size-3.5 text-amber-400 shrink-0" />
    if (fileName.endsWith('.css')) return <FileCode className="size-3.5 text-emerald-400 shrink-0" />
    if (fileName.endsWith('.json')) return <FileText className="size-3.5 text-purple-400 shrink-0" />
    if (fileName.endsWith('.md')) return <FileText className="size-3.5 text-zinc-400 shrink-0" />
    return <File className="size-3.5 text-zinc-500 shrink-0" />
}

export function FilesBrowser({
    workspacePath = '',
    activeFile = '',
    onSelectFile = () => {},
    onNewFile = () => {}
}) {
    const [fileList, setFileList] = useState([
        'src/app/page.tsx',
        'src/app/layout.tsx',
        'src/components/landing/kova/KovaHero.tsx',
        'src/components/landing/kova/KovaNav.tsx',
        'src/components/landing/kova/KovaFeatures.tsx',
        'src/components/landing/kova/KovaPricing.tsx',
        'src/components/landing/kova/KovaFaq.tsx',
        'src/components/landing/kova/KovaFooter.tsx',
        'package.json'
    ])
    const [openFolders, setOpenFolders] = useState({ 'src': true, 'src/app': true, 'src/components': true, 'src/components/landing': true, 'src/components/landing/kova': true })

    const toggleFolder = (folder) => {
        setOpenFolders(prev => ({ ...prev, [folder]: !prev[folder] }))
    }

    return (
        <div className="flex flex-col h-full bg-zinc-950 border-r border-white/10 text-xs">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-zinc-900/60">
                <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px]">Explorer</span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={onNewFile}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                        title="New File"
                    >
                        <Plus className="size-3.5" />
                    </button>
                </div>
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono">
                {fileList.map((filePath) => {
                    const parts = filePath.split('/')
                    const name = parts[parts.length - 1]
                    const depth = parts.length - 1
                    const isSelected = activeFile === filePath

                    return (
                        <div
                            key={filePath}
                            onClick={() => onSelectFile(filePath)}
                            style={{ paddingLeft: `${depth * 12 + 6}px` }}
                            className={`flex items-center gap-2 py-1 px-2 rounded-lg cursor-pointer transition-colors ${
                                isSelected ? 'bg-emerald-500/15 text-emerald-400 font-semibold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                            }`}
                        >
                            {getFileIcon(name)}
                            <span className="truncate">{name}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
export default FilesBrowser

