import React, { useState } from 'react';
import { 
  Settings, Key, Cpu, Database, ShieldCheck, RefreshCw, 
  Check, X, Eye, EyeOff, Save, ExternalLink, Sliders
} from 'lucide-react';

export function AppSettingsModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('general');
  const [autoSave, setAutoSave] = useState(true);
  const [autoReload, setAutoReload] = useState(true);
  const [autoApproveTools, setAutoApproveTools] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('obsidian');

  // API Keys state
  const [keys, setKeys] = useState({
    anthropic: '',
    openai: '',
    groq: '',
    openrouter: '',
    lmstudioUrl: 'http://127.0.0.1:1234',
    ollamaUrl: 'http://127.0.0.1:11434',
    wpUrl: 'http://127.0.0.1:8000',
    wpKey: 'krikkit_mcp_bridge_key_2026'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    localStorage.setItem('kova_settings', JSON.stringify({
      autoSave,
      autoReload,
      autoApproveTools,
      selectedTheme,
      keys
    }));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card settings-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-icon-badge">
              <Settings size={18} style={{ color: 'var(--accent-emerald)' }} />
            </div>
            <div>
              <h3 className="modal-title">Studio Settings</h3>
              <p className="modal-subtitle">Configure AI model keys, local endpoints, and automation preferences</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="settings-nav-tabs">
          <button 
            className={`settings-nav-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Sliders size={13} />
            <span>General & Editor</span>
          </button>
          <button 
            className={`settings-nav-btn ${activeTab === 'models' ? 'active' : ''}`}
            onClick={() => setActiveTab('models')}
          >
            <Key size={13} />
            <span>API Keys & Engines</span>
          </button>
          <button 
            className={`settings-nav-btn ${activeTab === 'wordpress' ? 'active' : ''}`}
            onClick={() => setActiveTab('wordpress')}
          >
            <Database size={13} />
            <span>WordPress Headless</span>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <div className="setting-row">
                <div>
                  <h4 className="setting-title">Auto-Save Modified Files</h4>
                  <p className="setting-desc">Automatically write verified AST edits to disk without manual confirmation.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoSave} 
                  onChange={e => setAutoSave(e.target.checked)} 
                  className="setting-toggle" 
                />
              </div>

              <div className="setting-row">
                <div>
                  <h4 className="setting-title">Live Preview Auto-Reload</h4>
                  <p className="setting-desc">Trigger Fast Refresh and iframe reload immediately when components are written.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoReload} 
                  onChange={e => setAutoReload(e.target.checked)} 
                  className="setting-toggle" 
                />
              </div>

              <div className="setting-row">
                <div>
                  <h4 className="setting-title">Autonomous Permission Bypassing</h4>
                  <p className="setting-desc">Run Claude Code and OpenCode with <code>--dangerously-skip-permissions</code> for uninterrupted building.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoApproveTools} 
                  onChange={e => setAutoApproveTools(e.target.checked)} 
                  className="setting-toggle" 
                />
              </div>

              <div className="setting-row">
                <div>
                  <h4 className="setting-title">Studio Color Palette</h4>
                  <p className="setting-desc">Kova Studio workspace theme and elevation contrast.</p>
                </div>
                <select 
                  className="chat-select" 
                  value={selectedTheme} 
                  onChange={e => setSelectedTheme(e.target.value)}
                >
                  <option value="obsidian">Obsidian Dark (#09090b) • Default</option>
                  <option value="midnight">Midnight Navy (#050814)</option>
                  <option value="graphite">Deep Graphite (#121214)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: API KEYS & LOCAL ENDPOINTS */}
          {activeTab === 'models' && (
            <div className="settings-section">
              <div className="input-group">
                <label className="input-label">Anthropic API Key (Claude 3.7 / 3.5)</label>
                <input 
                  type="password"
                  className="modal-text-input"
                  placeholder="sk-ant-api03-..."
                  value={keys.anthropic}
                  onChange={e => setKeys({ ...keys, anthropic: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">OpenAI API Key (Codex / GPT-4o / o3-mini)</label>
                <input 
                  type="password"
                  className="modal-text-input"
                  placeholder="sk-proj-..."
                  value={keys.openai}
                  onChange={e => setKeys({ ...keys, openai: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Groq API Key (Ultra-Fast Qwen 3.8 / GPT-OSS)</label>
                <input 
                  type="password"
                  className="modal-text-input"
                  placeholder="gsk_..."
                  value={keys.groq}
                  onChange={e => setKeys({ ...keys, groq: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">LM Studio Local Server Endpoint</label>
                <input 
                  type="text"
                  className="modal-text-input"
                  value={keys.lmstudioUrl}
                  onChange={e => setKeys({ ...keys, lmstudioUrl: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Ollama Local Daemon Endpoint</label>
                <input 
                  type="text"
                  className="modal-text-input"
                  value={keys.ollamaUrl}
                  onChange={e => setKeys({ ...keys, ollamaUrl: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* TAB 3: WORDPRESS */}
          {activeTab === 'wordpress' && (
            <div className="settings-section">
              <div className="input-group">
                <label className="input-label">WordPress Site URL</label>
                <input 
                  type="text"
                  className="modal-text-input"
                  value={keys.wpUrl}
                  onChange={e => setKeys({ ...keys, wpUrl: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Krikkit MCP Bridge Security Key</label>
                <input 
                  type="text"
                  className="modal-text-input"
                  value={keys.wpKey}
                  onChange={e => setKeys({ ...keys, wpKey: e.target.value })}
                />
              </div>

              <div className="info-box-setting">
                <span>The WordPress MCP Bridge plugin is active in <code>backend/web/app/mu-plugins/krikkit-mcp-bridge.php</code>. It enables authenticated REST operations to <code>/wp-json/krikkit/v1/</code> with administrator permissions.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-close-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="editor-btn primary" onClick={handleSave}>
            {savedSuccess ? <Check size={13} /> : <Save size={13} />}
            <span>{savedSuccess ? 'Preferences Saved!' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppSettingsModal;
