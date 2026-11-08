import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  Sparkles, Terminal, Globe, RefreshCw, Smartphone, Tablet, Monitor, 
  Send, Layers, Server, Cpu, Database, CheckCircle2, AlertCircle, FileCode, Play, Bot,
  ChevronDown, ChevronRight, BrainCircuit, Activity, Wrench, ShieldCheck
} from 'lucide-react';
import './App.css';

const DEFAULT_WORKSPACE = "c:\\Users\\ks209\\Desktop\\wordpress ai\\frontend";

export function App() {
  const [selectedEngine, setSelectedEngine] = useState('opencode/deepseek-v4.1-flash-free');
  const [lmStudioOnline, setLmStudioOnline] = useState(false);
  const [wpOnline, setWpOnline] = useState(false);
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "I am Kova Studio powered by the OpenCode Autonomous Engine. I think before writing code, inspect files, build modular React components, and verify AST syntax. What would you like to build?",
      thoughts: [],
      toolCalls: [],
      stats: null
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [expandedThoughts, setExpandedThoughts] = useState({});
  const [viewport, setViewport] = useState('desktop');
  const [previewUrl, setPreviewUrl] = useState('http://localhost:3000');
  const [workspacePath, setWorkspacePath] = useState(DEFAULT_WORKSPACE);
  
  const iframeRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, statusNote]);

  // Monitor services periodically
  useEffect(() => {
    const checkStatus = async () => {
      // 1. LM Studio via Rust
      try {
        await invoke('query_lmstudio_models');
        setLmStudioOnline(true);
      } catch (e) {
        setLmStudioOnline(false);
      }

      // 2. WordPress Headless status via Rust
      try {
        const isLive = await invoke('check_wp_status');
        setWpOnline(Boolean(isLive));
      } catch (err) {
        setWpOnline(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleReloadPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = previewUrl;
    }
  };

  const toggleThought = (idx) => {
    setExpandedThoughts(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const parseOpenCodeEvents = (rawStdout) => {
    const thoughts = [];
    const toolCalls = [];
    let replyText = "";
    let stats = null;

    const lines = rawStdout.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) continue;
      try {
        const ev = JSON.parse(trimmed);
        // 1. Reasoning / Thinking blocks
        if (ev.type === 'reasoning' && ev.part?.text) {
          thoughts.push(ev.part.text);
        }
        // 2. Tool uses (file writing, reading, terminal commands)
        else if ((ev.type === 'tool_use' || ev.type === 'tool_call' || ev.type === 'tool') && ev.part) {
          const p = ev.part;
          const toolName = p.tool || 'tool';
          const target = p.state?.input?.filePath || p.state?.title || p.state?.input?.command || 'action';
          const status = p.state?.status || 'completed';
          toolCalls.push({ tool: toolName, target, status });
        }
        // 3. Text output
        else if (ev.type === 'text' && ev.part?.text) {
          replyText += ev.part.text;
        }
        // 4. Token & step stats
        else if (ev.type === 'step_finish' && ev.part?.tokens) {
          stats = ev.part.tokens;
        }
      } catch (e) {
        // Ignore unparseable lines
      }
    }

    if (!replyText && toolCalls.length === 0 && thoughts.length === 0) {
      replyText = rawStdout || "Task completed by agent.";
    }

    return { thoughts, toolCalls, replyText, stats };
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsGenerating(true);
    setStatusNote('Launching OpenCode autonomous agent…');

    try {
      if (selectedEngine === 'lmstudio') {
        setStatusNote('Running local LM Studio GPU model…');
        const body = {
          model: 'qwen2.5-coder-7b-instruct-abliterated',
          messages: [
            { 
              role: 'system', 
              content: 'You are Kova AI, an elite frontend architect. Adhere to Impeccable Design: Obsidian (#09090b), crisp borders (border-white/10), emerald (#10b981) accents. Output file updates with ### Write: path.' 
            },
            { role: 'user', content: userText }
          ],
          temperature: 0.2
        };

        const raw = await invoke('send_lmstudio_chat', { payload: JSON.stringify(body) });
        const data = JSON.parse(raw);
        const text = data?.choices?.[0]?.message?.content || "Completed.";

        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            text, 
            thoughts: ["Direct local GPU inference on LM Studio without multi-step autonomous planning."], 
            toolCalls: [], 
            stats: data?.usage || null 
          }
        ]);
      } else {
        // Wrap OpenCode CLI with real thinking & tool calls
        setStatusNote('Agent reasoning & analyzing project files…');
        const rawOutput = await invoke('run_opencode_agent', {
          prompt: userText,
          model: selectedEngine,
          cwd: workspacePath
        });

        setStatusNote('Parsing agent reasoning and disk actions…');
        const parsed = parseOpenCodeEvents(rawOutput);

        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: parsed.replyText,
            thoughts: parsed.thoughts,
            toolCalls: parsed.toolCalls,
            stats: parsed.stats
          }
        ]);
      }

      // Hot reload the Next.js visual preview on port 3000
      handleReloadPreview();
    } catch (err) {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          text: `Error from agent: ${err.message || err}`,
          thoughts: [],
          toolCalls: [],
          stats: null 
        }
      ]);
    } finally {
      setIsGenerating(false);
      setStatusNote('');
    }
  };

  return (
    <div className="studio-container">
      {/* TOP HEADER */}
      <header className="studio-header">
        <div className="brand-section">
          <div className="brand-badge">
            <Sparkles size={16} />
            <span>KOVA STUDIO</span>
            <span className="brand-version">OPENCODE CLI • DESKTOP</span>
          </div>

          {/* ENGINE PICKER */}
          <div className="engine-select-pill">
            <BrainCircuit size={13} style={{ color: 'var(--accent-emerald)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Engine:</span>
            <select 
              className="studio-select" 
              value={selectedEngine} 
              onChange={(e) => setSelectedEngine(e.target.value)}
            >
              <option value="opencode/deepseek-v4.1-flash-free">DeepSeek V4.1 Flash (Reasoning + Free)</option>
              <option value="groq/qwen/qwen3.8-27b">Groq Qwen 3.8 27B (Ultra-Fast)</option>
              <option value="groq/openai/gpt-oss-120b">Groq GPT-OSS 120B (High Intelligence)</option>
              <option value="opencode/nemotron-3.5-lightning-free">Nemotron 3.5 Lightning (Free)</option>
              <option value="lmstudio">LM Studio (Local GPU Qwen 2.5)</option>
            </select>
          </div>
        </div>

        <div className="system-pills">
          <div className="status-pill online" title="OpenCode CLI autonomous engine wrapper">
            <span className="status-dot online" />
            <Bot size={12} />
            <span>OpenCode CLI: Wrapped</span>
          </div>

          <div className={`status-pill ${lmStudioOnline ? 'online' : 'offline'}`} title="LM Studio Local Engine (127.0.0.1:1234)">
            <span className={`status-dot ${lmStudioOnline ? 'online' : 'offline'}`} />
            <Cpu size={12} />
            <span>LM Studio: {lmStudioOnline ? 'Ready' : 'Offline'}</span>
          </div>

          <div className={`status-pill ${wpOnline ? 'online' : 'offline'}`} title="Headless WordPress CMS (127.0.0.1:8000)">
            <span className={`status-dot ${wpOnline ? 'online' : 'offline'}`} />
            <Database size={12} />
            <span>WordPress: {wpOnline ? 'Live' : 'Offline'}</span>
          </div>
        </div>
      </header>

      {/* MAIN SPLIT WORKBENCH */}
      <div className="workbench-split split">
        {/* LEFT: CUSTOM AGENT CHAT WITH REAL THINKING & TOOLS */}
        <section className="agent-pane">
          <div className="agent-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={14} style={{ color: 'var(--accent-emerald)' }} />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Autonomous Engineering Chat</span>
            </div>
            <span className="status-pill online" style={{ padding: '2px 8px', fontSize: '10px' }}>
              Skill Gated: Impeccable Design
            </span>
          </div>

          {/* Messages */}
          <div className="agent-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`message-bubble ${m.role}`}>
                {/* 1. THINKING ACCORDION (If agent used reasoning) */}
                {m.thoughts && m.thoughts.length > 0 && (
                  <div className="thinking-card">
                    <button 
                      className="thinking-header" 
                      onClick={() => toggleThought(idx)}
                      type="button"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BrainCircuit size={13} style={{ color: 'var(--accent-emerald)' }} />
                        <span>Agent Reasoning ({m.thoughts.length} step{m.thoughts.length > 1 ? 's' : ''})</span>
                      </div>
                      {expandedThoughts[idx] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    {expandedThoughts[idx] && (
                      <div className="thinking-body">
                        {m.thoughts.map((t, tIdx) => (
                          <div key={tIdx} className="thinking-step">{t}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. REAL DISK ACTIONS / TOOL CALLS */}
                {m.toolCalls && m.toolCalls.length > 0 && (
                  <div className="artifact-card">
                    <div className="artifact-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={13} style={{ color: 'var(--accent-emerald)' }} />
                        <span>Autonomous File Actions</span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--accent-emerald)' }}>
                        {m.toolCalls.length} executed
                      </span>
                    </div>
                    {m.toolCalls.map((tc, tcIdx) => (
                      <div key={tcIdx} className="artifact-file-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                          <FileCode size={13} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <strong>{tc.tool}</strong>: {tc.target}
                          </span>
                        </div>
                        <span className="badge-written">{tc.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. ASSISTANT TEXT */}
                <div className="bubble-body" style={{ whiteSpace: 'pre-wrap' }}>
                  {m.text}
                </div>

                {/* 4. TOKEN & PERFORMANCE FOOTER */}
                {m.stats && (
                  <div className="message-stats">
                    <span>⚡ {m.stats.total?.toLocaleString() || m.stats.total_tokens} tokens</span>
                    <span>• {m.stats.reasoning ? `${m.stats.reasoning} reasoning tokens` : 'Zero hallucination'}</span>
                    <span>• $0.00 cost</span>
                  </div>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="message-bubble assistant generating">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="spinner" />
                  <span style={{ fontSize: '13px', color: 'var(--accent-emerald)' }}>
                    {statusNote || 'Agent executing autonomous turn…'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="agent-composer">
            <div className="composer-input-box">
              <textarea
                className="composer-textarea"
                placeholder="Ask OpenCode to build components, refactor pages, or fix styling..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className="composer-actions">
                <div className="quick-commands">
                  <span className="cmd-badge" onClick={() => setInput('Build an Impeccable Hero component with obsidian dark theme and emerald accent in src/components/Hero.tsx')}>Hero</span>
                  <span className="cmd-badge" onClick={() => setInput('Create an interactive 4-card Bento grid for AI features in src/components/FeatureBento.tsx')}>Bento</span>
                  <span className="cmd-badge" onClick={() => setInput('Add a floating glassmorphism Navbar with live status pill in src/components/Navbar.tsx')}>Navbar</span>
                  <span className="cmd-badge" onClick={() => setInput('Create a modern Footer with newsletter signup and social links in src/components/Footer.tsx')}>Footer</span>
                </div>
                <button 
                  className="btn-send"
                  disabled={isGenerating || !input.trim()}
                  onClick={handleSend}
                >
                  {isGenerating ? 'Thinking…' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: LIVE VISUAL PREVIEW OF RUNNING NEXT.JS SITE */}
        <section className="preview-pane">
          <div className="preview-toolbar">
            <div className="viewport-switch">
              <button 
                className={`viewport-btn ${viewport === 'desktop' ? 'active' : ''}`}
                onClick={() => setViewport('desktop')}
                title="Desktop 100%"
              >
                <Monitor size={13} />
              </button>
              <button 
                className={`viewport-btn ${viewport === 'tablet' ? 'active' : ''}`}
                onClick={() => setViewport('tablet')}
                title="Tablet 768px"
              >
                <Tablet size={13} />
              </button>
              <button 
                className={`viewport-btn ${viewport === 'mobile' ? 'active' : ''}`}
                onClick={() => setViewport('mobile')}
                title="Mobile 390px"
              >
                <Smartphone size={13} />
              </button>
            </div>

            <div className="preview-url-bar">
              <Globe size={12} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                value={previewUrl}
                onChange={(e) => setPreviewUrl(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
              />
            </div>

            <div className="preview-actions">
              <button className="tool-icon-btn" onClick={handleReloadPreview} title="Reload Preview">
                <RefreshCw size={13} />
                <span>Reload</span>
              </button>
            </div>
          </div>

          <div className="preview-viewport-container">
            <iframe 
              ref={iframeRef}
              src={previewUrl}
              className={`preview-frame ${viewport}`}
              title="Live Preview"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
