import React, { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, ExternalLink, Check, X, ArrowRight, 
  Layers, Globe, Zap, Server
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

export function WordPressChatModal({ onDispatchAction, onOpenBridgeTab, onClose }) {
  const [isWpOnline, setIsWpOnline] = useState(false);
  const [checking, setChecking] = useState(false);
  const [wpUrl, setWpUrl] = useState('http://127.0.0.1:8000');

  const checkStatus = async () => {
    setChecking(true);
    try {
      const live = await invoke('check_wp_status');
      setIsWpOnline(Boolean(live));
    } catch (e) {
      setIsWpOnline(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleAction = (actionType) => {
    if (actionType === 'hydrate-posts') {
      const prompt = `🔌 [HEADLESS WORDPRESS INTEGRATION PASS]
Please connect and hydrate the latest WordPress posts into our Next.js frontend:
1. Target REST Endpoint: ${wpUrl}/wp-json/wp/v2/posts
2. Create or update a dynamic component (e.g. src/components/landing/WordPressBlogGrid.tsx).
3. Fetch post titles, excerpt, published date, and link.
4. Apply Impeccable Design: obsidian cards (#121215), micro-borders, emerald hover glows, and responsive grid.
5. Update src/app/page.tsx to render the WordPress section.`;

      onDispatchAction(prompt);
      onClose();
    } else if (actionType === 'custom-theme') {
      const prompt = `🔌 [WORDPRESS THEME EXPORT PASS]
Prepare our Next.js frontend components to serve as a headless WordPress decoupled theme:
1. Map WordPress categories and post types to Next.js route handlers.
2. Configure ISR (Incremental Static Regeneration) for instantaneous post updates.
3. Provide full headless integration code in src/lib/wordpress.ts.`;

      onDispatchAction(prompt);
      onClose();
    } else if (actionType === 'open-bridge') {
      onOpenBridgeTab();
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card wp-chat-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-icon-badge">
              <Database size={18} style={{ color: 'var(--accent-emerald)' }} />
            </div>
            <div>
              <h3 className="modal-title">WordPress Headless Integration</h3>
              <p className="modal-subtitle">Connect WordPress CMS, hydrate REST posts, and invoke MCP tools from chat</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Status bar */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '10px 14px', 
            borderRadius: '8px', 
            background: isWpOnline ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${isWpOnline ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`status-dot ${isWpOnline ? 'online' : 'offline'}`} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#f4f4f5' }}>
                {isWpOnline ? 'WordPress Core is Live on 127.0.0.1:8000' : 'WordPress Server Offline'}
              </span>
            </div>
            <button 
              className="editor-btn"
              style={{ padding: '2px 8px', fontSize: '10px' }}
              onClick={checkStatus}
              disabled={checking}
            >
              <RefreshCw size={11} className={checking ? 'spinning' : ''} />
              <span>Rescan</span>
            </button>
          </div>

          {/* Quick Actions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <div 
              className="template-pick-card"
              onClick={() => handleAction('hydrate-posts')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={15} style={{ color: 'var(--accent-emerald)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#f4f4f5' }}>
                    Hydrate Live WordPress Posts into Frontend
                  </span>
                </div>
                <ArrowRight size={13} style={{ color: 'var(--accent-emerald)' }} />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Instructs Kova AI to fetch <code>/wp-json/wp/v2/posts</code> and build a modern, high-contrast blog grid component.
              </p>
            </div>

            <div 
              className="template-pick-card"
              onClick={() => handleAction('custom-theme')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={15} style={{ color: '#06b6d4' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#f4f4f5' }}>
                    Configure Headless Theme & Decoupled Routes
                  </span>
                </div>
                <ArrowRight size={13} style={{ color: '#06b6d4' }} />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Sets up Next.js ISR (Incremental Static Regeneration) with dynamic route handlers for WordPress content.
              </p>
            </div>

            <div 
              className="template-pick-card"
              onClick={() => handleAction('open-bridge')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Server size={15} style={{ color: '#a855f7' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#f4f4f5' }}>
                    Open Full WordPress Bridge Workbench
                  </span>
                </div>
                <ArrowRight size={13} style={{ color: '#a855f7' }} />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Switch to the dedicated WordPress Bridge tab to test REST endpoints, view live posts, and inspect MCP status.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <a 
            href="http://127.0.0.1:8000/wp-admin" 
            target="_blank" 
            rel="noreferrer"
            style={{ fontSize: '11px', color: 'var(--accent-emerald)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Open WP Admin (admin / admin123)</span>
            <ExternalLink size={11} />
          </a>
          <button className="btn-close-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default WordPressChatModal;
