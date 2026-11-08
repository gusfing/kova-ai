import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Database, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, Send, ArrowRight } from 'lucide-react';

export function WordPressBridge() {
  const [isWpOnline, setIsWpOnline] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [log, setLog] = useState('');

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const live = await invoke('check_wp_status');
      setIsWpOnline(Boolean(live));
      if (live) {
        setLog('Connected to Headless WordPress Core at http://127.0.0.1:8000');
      } else {
        setLog('WordPress server is offline. Run start.bat or php -S 127.0.0.1:8000 to launch.');
      }
    } catch (e) {
      setIsWpOnline(false);
      setLog(`Connection error: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWpPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/wp-json/wp/v2/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
        setLog(`Fetched ${data.length} post(s) successfully from REST API.`);
      } else {
        setLog(`Failed to fetch posts: HTTP ${res.status}`);
      }
    } catch (e) {
      setLog(`Fetch error (WordPress may be starting): ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="wp-bridge-container">
      <div className="wp-bridge-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={15} style={{ color: 'var(--accent-emerald)' }} />
          <span style={{ fontSize: '13px', fontWeight: 700 }}>HEADLESS WORDPRESS & MCP BRIDGE</span>
        </div>
        <button className="canvas-icon-btn" onClick={checkStatus} disabled={isLoading}>
          <RefreshCw size={12} className={isLoading ? 'spinning' : ''} />
          <span>Check Status</span>
        </button>
      </div>

      <div className="wp-bridge-content">
        {/* Status Cards */}
        <div className="wp-status-grid">
          <div className={`wp-card ${isWpOnline ? 'online' : 'offline'}`}>
            <div className="wp-card-header">
              <span className="wp-card-title">WordPress Core</span>
              <span className={`status-pill ${isWpOnline ? 'online' : 'offline'}`}>
                {isWpOnline ? 'Live on 127.0.0.1:8000' : 'Offline'}
              </span>
            </div>
            <p className="wp-card-desc">Headless CMS runtime powering REST API, Gutenberg blocks, and GraphQL schema.</p>
            <div className="wp-card-link">
              <a href="http://127.0.0.1:8000/wp-admin" target="_blank" rel="noreferrer">
                <span>Open WP Admin (admin / admin123)</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>

          <div className="wp-card online">
            <div className="wp-card-header">
              <span className="wp-card-title">Krikkit MCP Bridge</span>
              <span className="status-pill online">Active (mu-plugin)</span>
            </div>
            <p className="wp-card-desc">High-speed agent bridge routing requests with <code>X-Krikkit-Key</code> authentication.</p>
            <div className="wp-card-meta">
              <span>Endpoint: <code>/wp-json/krikkit/v1/dashboard</code></span>
            </div>
          </div>

          <div className="wp-card online">
            <div className="wp-card-header">
              <span className="wp-card-title">GraphQL & REST Endpoints</span>
              <span className="status-pill online">CORS Enabled</span>
            </div>
            <p className="wp-card-desc">Exposes headless schema directly to Next.js on port 3000 with cross-origin preflights.</p>
            <div className="wp-card-meta">
              <span>Endpoint: <code>/wp-json/wp/v2/posts</code></span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="wp-actions-bar">
          <button className="editor-btn primary" onClick={fetchWpPosts} disabled={isLoading || !isWpOnline}>
            <Database size={13} />
            <span>Test Fetch REST Posts</span>
          </button>
          <div className="wp-log-line">
            <span>{log || 'Ready.'}</span>
          </div>
        </div>

        {/* Fetched Posts preview */}
        {posts && posts.length > 0 && (
          <div className="wp-posts-list">
            <h4 style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>LIVE WORDPRESS POSTS</h4>
            {posts.map(p => (
              <div key={p.id} className="wp-post-item">
                <span className="wp-post-title" dangerouslySetInnerHTML={{ __html: p.title?.rendered || 'Untitled' }} />
                <span className="wp-post-date">{new Date(p.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WordPressBridge;
