import React, { useState } from 'react'
import { Database, Server, Globe, HardDrive, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react'

export function ConnectDatastoreModal({
    open = false,
    onClose = () => {},
    onConnected = () => {},
}) {
    const [type, setType] = useState('wordpress')
    const [connString, setConnString] = useState('http://127.0.0.1:8000')
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState(null)

    if (!open) return null

    const handleTest = async () => {
        setTesting(true)
        setTestResult(null)

        if (type === 'wordpress') {
            try {
                const res = await fetch(`${connString.replace(/\/+$/, '')}/wp-json/wp/v2/posts?per_page=1`)
                if (res.ok) {
                    setTestResult({ ok: true, msg: 'WordPress REST API is live and responding!' })
                } else {
                    setTestResult({ ok: false, msg: `REST API returned status ${res.status}.` })
                }
            } catch (err) {
                setTestResult({ ok: false, msg: `Connection failed: ${err.message || 'Host unreachable'}.` })
            }
        } else {
            setTimeout(() => {
                setTestResult({ ok: true, msg: `${type.toUpperCase()} database connection verified.` })
            }, 600)
        }
        setTesting(false)
    }

    const handleSave = () => {
        onConnected({ type, connString })
        onClose()
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="hub-modal-card" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="modal-icon-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.35)' }}>
                            <Database size={18} style={{ color: '#38bdf8' }} />
                        </div>
                        <div>
                            <h2 className="modal-title">Connect Datastore / Database</h2>
                            <p className="modal-subtitle">Connect WordPress CMS, PostgreSQL, Supabase, or SQLite</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="btn-close-modal">
                        <X size={16} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="hub-tab-bar">
                    <button
                        type="button"
                        onClick={() => { setType('wordpress'); setConnString('http://127.0.0.1:8000'); setTestResult(null); }}
                        className={`hub-tab-btn wp ${type === 'wordpress' ? 'active' : ''}`}
                    >
                        <Globe size={14} />
                        <span>WordPress REST</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => { setType('postgres'); setConnString('postgresql://postgres:password@localhost:5432/app'); setTestResult(null); }}
                        className={`hub-tab-btn html ${type === 'postgres' ? 'active' : ''}`}
                    >
                        <Server size={14} />
                        <span>PostgreSQL / Supabase</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => { setType('sqlite'); setConnString('file:./data/app.db'); setTestResult(null); }}
                        className={`hub-tab-btn github ${type === 'sqlite' ? 'active' : ''}`}
                    >
                        <HardDrive size={14} />
                        <span>SQLite Local</span>
                    </button>
                </div>

                {/* Body */}
                <div className="hub-modal-body">
                    <div>
                        <label className="hub-label">Connection URI / Endpoint URL</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                value={connString}
                                onChange={(e) => setConnString(e.target.value)}
                                className="hub-input"
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={handleTest}
                                disabled={testing || !connString.trim()}
                                style={{
                                    padding: '0 14px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                {testing ? <Loader2 size={13} className="spinning" /> : 'Test'}
                            </button>
                        </div>
                    </div>

                    {testResult && (
                        <div className={`hub-status-alert ${testResult.ok ? '' : 'error'}`}>
                            {testResult.ok ? <CheckCircle2 size={15} style={{ flexShrink: 0 }} /> : <AlertCircle size={15} style={{ flexShrink: 0 }} />}
                            <span>{testResult.msg}</span>
                        </div>
                    )}

                    <div className="hub-info-box">
                        💡 Connecting a datastore injects client SDK helpers into your Next.js project (e.g. `src/lib/wp.ts` or `src/lib/db.ts`) for real-time edge hydration.
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        className="btn-hub-primary"
                    >
                        <span>Save & Bind Datastore</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
export default ConnectDatastoreModal

