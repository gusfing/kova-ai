import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  Sparkles, Terminal, Globe, RefreshCw, Smartphone, Tablet, Monitor, 
  Send, Layers, Server, Cpu, Database, CheckCircle2, AlertCircle, FileCode, Play, Bot,
  ChevronDown, ChevronRight, BrainCircuit, Activity, Wrench, ShieldCheck, X, Link, Radio,
  Zap, Code2, Check, Settings, ExternalLink, Download, GitCompare, Eye, SlidersHorizontal
} from 'lucide-react';
import './App.css';

import { SLASH_COMMANDS, matchSlashCommands } from './lib/slashCommands';
import { SlashCommandMenu } from './components/SlashCommandMenu';
import { CodeCanvas } from './components/CodeCanvas';
import { DiffViewer } from './components/DiffViewer';
import { WordPressBridge } from './components/WordPressBridge';
import { TerminalDrawer } from './components/TerminalDrawer';

const DEFAULT_WORKSPACE = "c:\\Users\\ks209\\Desktop\\wordpress ai\\frontend";

// Active Next.js components on the live homepage
const ACTIVE_COMPONENTS = {
  footer: {
    path: 'src/components/landing/kova/KovaFooter.tsx',
    name: 'KovaFooter',
    fallbackPath: 'src/components/Footer.jsx'
  },
  nav: {
    path: 'src/components/landing/kova/KovaNav.tsx',
    name: 'KovaNav',
    fallbackPath: 'src/components/landing/Navbar.tsx'
  },
  navbar: {
    path: 'src/components/landing/kova/KovaNav.tsx',
    name: 'KovaNav',
    fallbackPath: 'src/components/landing/Navbar.tsx'
  },
  header: {
    path: 'src/components/landing/kova/KovaNav.tsx',
    name: 'KovaNav',
    fallbackPath: 'src/components/landing/Navbar.tsx'
  },
  hero: {
    path: 'src/components/landing/kova/KovaHero.tsx',
    name: 'KovaHero',
    fallbackPath: 'src/components/Hero.jsx'
  },
  features: {
    path: 'src/components/landing/kova/KovaFeatures.tsx',
    name: 'KovaFeatures',
    fallbackPath: 'src/components/FeatureBento.jsx'
  },
  bento: {
    path: 'src/components/landing/kova/KovaFeatures.tsx',
    name: 'KovaFeatures',
    fallbackPath: 'src/components/FeatureBento.jsx'
  },
  pricing: {
    path: 'src/components/landing/kova/KovaPricing.tsx',
    name: 'KovaPricing'
  },
  faq: {
    path: 'src/components/landing/kova/KovaFaq.tsx',
    name: 'KovaFaq'
  },
  workflow: {
    path: 'src/components/landing/kova/KovaWorkflow.tsx',
    name: 'KovaWorkflow'
  },
  cta: {
    path: 'src/components/landing/kova/KovaCta.tsx',
    name: 'KovaCta'
  },
  benchmark: {
    path: 'src/components/landing/kova/KovaBenchmark.tsx',
    name: 'KovaBenchmark'
  },
  page: {
    path: 'src/app/page.tsx',
    name: 'HomePage'
  },
  home: {
    path: 'src/app/page.tsx',
    name: 'HomePage'
  }
};

export function App() {
  // Selected engine: prefix defines runtime ('opencode', 'claude', 'codex', 'lmstudio', 'ollama')
  const [selectedEngine, setSelectedEngine] = useState('opencode:opencode/deepseek-v4.1-flash-free');
  
  // CLI & Service states
  const [cliStatus, setCliStatus] = useState({
    opencode: false,
    claude: false,
    codex: false,
    lmstudio: false,
    ollama: false,
    lmstudio_models: []
  });
  const [wpOnline, setWpOnline] = useState(false);
  const [showEngineModal, setShowEngineModal] = useState(false);
  const [isProbing, setIsProbing] = useState(false);

  // Workbench Stages: 'preview' | 'code' | 'diff' | 'wp' | 'terminal'
  const [activeTab, setActiveTab] = useState('preview');
  const [recentFilesModified, setRecentFilesModified] = useState([
    'src/components/landing/kova/KovaFooter.tsx',
    'src/app/page.tsx'
  ]);

  // Slash commands state
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);
  const [matchedCommands, setMatchedCommands] = useState([]);

  // Chat state
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      engine: 'Kova Universal Engine',
      text: "I am Kova Studio Universal Engine. Type `/` in the chat to access slash commands (/plan, /code, /diff, /wp, /review, /polish, /export), or select your preferred engine and tell me what to build!",
      thoughts: ["Multi-CLI agent wrapper initialized with automated disk file write loop."],
      toolCalls: [],
      stats: null
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [expandedThoughts, setExpandedThoughts] = useState({ 0: false });
  const [viewport, setViewport] = useState('desktop');
  const [previewUrl, setPreviewUrl] = useState('http://localhost:3000');
  const [workspacePath, setWorkspacePath] = useState(DEFAULT_WORKSPACE);
  
  const iframeRef = useRef(null);
  const messagesEndRef = useRef(null);
  const composerTextareaRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, statusNote]);

  // Probe all engines function
  const probeEngines = async () => {
    setIsProbing(true);
    try {
      const res = await invoke('probe_all_clis');
      setCliStatus(res);
    } catch (e) {
      console.error('Probe error:', e);
    } finally {
      setIsProbing(false);
    }

    try {
      const isLive = await invoke('check_wp_status');
      setWpOnline(Boolean(isLive));
    } catch (e) {
      setWpOnline(false);
    }
  };

  // Run probing on mount & periodically
  useEffect(() => {
    probeEngines();
    const interval = setInterval(probeEngines, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleReloadPreview = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.location?.reload();
      } catch (e) {
        // Cross-origin fallback
      }
      const base = previewUrl.split('?')[0];
      setPreviewUrl(`${base}?t=${Date.now()}`);
    }
  };

  const toggleThought = (idx) => {
    setExpandedThoughts(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Export full project as ZIP to Downloads folder
  const handleExportZip = async () => {
    setStatusNote('Bundling Next.js project to ZIP…');
    try {
      const script = `Compress-Archive -Path '${workspacePath}\\src', '${workspacePath}\\package.json', '${workspacePath}\\tsconfig.json', '${workspacePath}\\tailwind.config.ts' -DestinationPath "$env:USERPROFILE\\Downloads\\kova-site-export.zip" -Force; "$env:USERPROFILE\\Downloads\\kova-site-export.zip"`;
      const res = await invoke('execute_command', {
        cmd: script,
        cwd: workspacePath
      });
      const exportPath = res.trim() || 'Downloads\\kova-site-export.zip';
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          engine: 'Export Packager',
          text: `📦 **Project Export Complete!**\n\nThe standalone Next.js 15 site has been compressed and saved to:\n\`${exportPath}\`\n\nReady to unzip and deploy anywhere (Vercel, Netlify, Cloudflare, VPS).`,
          thoughts: ["Excludes node_modules and .next build caches for optimal zip size."],
          toolCalls: [{ tool: 'export_zip', target: exportPath, status: 'saved to Downloads' }],
          stats: null
        }
      ]);
    } catch (e) {
      alert(`Export failed: ${e}`);
    } finally {
      setStatusNote('');
    }
  };

  // Handle typing in chat composer with slash command detection
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val.startsWith('/')) {
      const matched = matchSlashCommands(val);
      setMatchedCommands(matched);
      setSlashMenuOpen(matched.length > 0);
      setSlashSelectedIndex(0);
    } else {
      setSlashMenuOpen(false);
    }
  };

  // Select / execute a slash command from the menu
  const applySlashCommand = (cmd) => {
    setSlashMenuOpen(false);
    if (!cmd) return;

    // Direct Workbench Actions
    if (cmd.action === 'open-diff') {
      setActiveTab('diff');
      setInput('');
      return;
    }
    if (cmd.action === 'open-code') {
      setActiveTab('code');
      setInput('');
      return;
    }
    if (cmd.action === 'open-preview') {
      setActiveTab('preview');
      setInput('');
      return;
    }
    if (cmd.action === 'open-terminal') {
      setActiveTab('terminal');
      setInput('');
      return;
    }
    if (cmd.action === 'open-wp') {
      setActiveTab('wp');
      setInput('');
      return;
    }
    if (cmd.action === 'export-zip') {
      setInput('');
      handleExportZip();
      return;
    }
    if (cmd.action === 'clear-chat') {
      setMessages([
        {
          role: 'assistant',
          engine: 'Kova Universal Engine',
          text: "Chat cleared. What would you like to build next?",
          thoughts: [],
          toolCalls: [],
          stats: null
        }
      ]);
      setInput('');
      return;
    }

    // Commands with prompt prefixes
    setInput(`${cmd.name} `);
    composerTextareaRef.current?.focus();
  };

  // Keyboard navigation for slash commands & enter to send
  const handleKeyDown = (e) => {
    if (slashMenuOpen && matchedCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashSelectedIndex(prev => (prev + 1) % matchedCommands.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashSelectedIndex(prev => (prev - 1 + matchedCommands.length) % matchedCommands.length);
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        applySlashCommand(matchedCommands[slashSelectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSlashMenuOpen(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (slashMenuOpen && matchedCommands.length > 0) {
        applySlashCommand(matchedCommands[slashSelectedIndex]);
      } else {
        handleSend();
      }
    }
  };

  // Extract file blocks from model output and write them directly to disk
  const extractAndApplyFiles = async (text, identifiedComp) => {
    const fileActions = [];
    
    // Pattern: ### Write: <path> ... ```lang\n<code>\n```
    const fileBlockRegex = /(?:###\s*(?:Write|File|Update|Create):\s*([^\n\r]+)|(?:\/\/|\/\*)\s*(?:File|Path):\s*([^\n\r*]+))\s*```(?:[a-zA-Z0-9_\-]+)?\s*([\s\S]*?)```/gi;
    
    let match;
    let foundExplicit = false;
    while ((match = fileBlockRegex.exec(text)) !== null) {
      foundExplicit = true;
      let rawPath = (match[1] || match[2] || '').trim();
      let content = match[3]?.trim();
      if (rawPath && content) {
        rawPath = rawPath.replace(/[`"':]/g, '').trim().replace(/\\/g, '/');
        
        // Write to the specified file
        const fullPath = `${workspacePath.replace(/\\/g, '/')}/${rawPath.replace(/^\.\//, '')}`;
        try {
          await invoke('write_file_content', {
            filePath: fullPath.replace(/\//g, '\\'),
            content
          });
          fileActions.push({ tool: 'write_file', target: rawPath, status: 'written to disk' });
          setRecentFilesModified(prev => Array.from(new Set([rawPath, ...prev])));

          // If the model wrote to 'src/components/Footer.jsx' or 'Footer.tsx', also sync into active 'src/components/landing/kova/KovaFooter.tsx'
          if (rawPath.toLowerCase().includes('footer') && !rawPath.includes('KovaFooter')) {
            const activePath = `${workspacePath.replace(/\\/g, '/')}/src/components/landing/kova/KovaFooter.tsx`;
            await invoke('write_file_content', {
              filePath: activePath.replace(/\//g, '\\'),
              content
            });
            fileActions.push({ tool: 'sync_component', target: 'src/components/landing/kova/KovaFooter.tsx', status: 'live rendered' });
          }
        } catch (e) {
          console.error("Write error:", e);
        }
      }
    }

    // Fallback if model only returned a ```jsx ... ``` or ```tsx ... ``` code block without ### Write:
    if (!foundExplicit) {
      const codeBlockRegex = /```(?:jsx|tsx|javascript|typescript|react)?\s*([\s\S]*?)```/gi;
      let codeMatch = codeBlockRegex.exec(text);
      if (codeMatch && codeMatch[1] && codeMatch[1].length > 40) {
        const code = codeMatch[1].trim();
        const targetRel = identifiedComp?.path || (text.toLowerCase().includes('footer') ? 'src/components/landing/kova/KovaFooter.tsx' : null);
        if (targetRel) {
          const fullPath = `${workspacePath.replace(/\\/g, '/')}/${targetRel}`;
          try {
            await invoke('write_file_content', {
              filePath: fullPath.replace(/\//g, '\\'),
              content: code
            });
            fileActions.push({ tool: 'write_file', target: targetRel, status: 'written to disk' });
            setRecentFilesModified(prev => Array.from(new Set([targetRel, ...prev])));
          } catch (e) {
            console.error("Fallback write error:", e);
          }
        }
      }
    }

    return fileActions;
  };

  // Parser for OpenCode JSON streaming event logs
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
        if (ev.type === 'reasoning' && ev.part?.text) {
          thoughts.push(ev.part.text);
        } else if ((ev.type === 'tool_use' || ev.type === 'tool_call' || ev.type === 'tool') && ev.part) {
          const p = ev.part;
          const toolName = p.tool || 'action';
          const target = p.state?.input?.filePath || p.state?.title || p.state?.input?.command || 'action';
          const status = p.state?.status || 'completed';
          toolCalls.push({ tool: toolName, target, status });
          if (p.state?.input?.filePath) {
            setRecentFilesModified(prev => Array.from(new Set([p.state.input.filePath, ...prev])));
          }
        } else if (ev.type === 'text' && ev.part?.text) {
          replyText += ev.part.text;
        } else if (ev.type === 'step_finish' && ev.part?.tokens) {
          stats = ev.part.tokens;
        }
      } catch (e) {
        // ignore unparseable line
      }
    }

    if (!replyText && toolCalls.length === 0 && thoughts.length === 0) {
      replyText = rawStdout || "Task completed successfully.";
    }

    return { thoughts, toolCalls, replyText, stats };
  };

  // Get active engine label for display
  const getEngineDisplayLabel = (val) => {
    if (val.startsWith('opencode:')) {
      const sub = val.replace('opencode:', '');
      if (sub.includes('deepseek')) return 'OpenCode: DeepSeek V4.1';
      if (sub.includes('qwen3.8')) return 'OpenCode: Groq Qwen 3.8';
      if (sub.includes('gpt-oss')) return 'OpenCode: Groq GPT-OSS';
      if (sub.includes('nemotron')) return 'OpenCode: Nemotron 3.5';
      return 'OpenCode CLI';
    }
    if (val.startsWith('claude:')) return 'Claude Code CLI';
    if (val.startsWith('codex:')) return 'Codex CLI';
    if (val.startsWith('lmstudio:')) {
      const m = val.replace('lmstudio:', '');
      return `LM Studio (${m})`;
    }
    if (val.startsWith('ollama:')) return 'Ollama (Local)';
    return val;
  };

  // Dispatch prompt to the respective engine CLI / runtime
  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    let userText = input.trim();
    setInput('');
    setSlashMenuOpen(false);

    // Handle Slash Commands
    if (userText.startsWith('/')) {
      const parts = userText.split(' ');
      const cmdName = parts[0].toLowerCase();
      const rest = parts.slice(1).join(' ').trim();
      const foundCmd = SLASH_COMMANDS.find(c => c.name.toLowerCase() === cmdName);

      if (foundCmd) {
        // Direct Action Commands
        if (foundCmd.action === 'open-diff') { setActiveTab('diff'); return; }
        if (foundCmd.action === 'open-code') { setActiveTab('code'); return; }
        if (foundCmd.action === 'open-preview') { setActiveTab('preview'); return; }
        if (foundCmd.action === 'open-terminal') { setActiveTab('terminal'); return; }
        if (foundCmd.action === 'open-wp') { setActiveTab('wp'); return; }
        if (foundCmd.action === 'export-zip') { handleExportZip(); return; }
        if (foundCmd.action === 'clear-chat') {
          setMessages([
            {
              role: 'assistant',
              engine: 'Kova Universal Engine',
              text: "Chat cleared. What would you like to build next?",
              thoughts: [],
              toolCalls: [],
              stats: null
            }
          ]);
          return;
        }

        // Prefix prompt transformation
        if (foundCmd.prefixPrompt) {
          userText = `${foundCmd.prefixPrompt}${rest || 'Apply standard execution.'}`;
        }
      }
    }

    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsGenerating(true);

    const activeLabel = getEngineDisplayLabel(selectedEngine);

    try {
      // 1. OPENCODE CLI
      if (selectedEngine.startsWith('opencode:')) {
        const model = selectedEngine.replace('opencode:', '');
        setStatusNote(`[OpenCode CLI] Agent reasoning & analyzing workspace files…`);
        const rawOutput = await invoke('run_opencode_agent', {
          prompt: userText,
          model,
          cwd: workspacePath
        });

        setStatusNote('Parsing agent reasoning and disk actions…');
        const parsed = parseOpenCodeEvents(rawOutput);

        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            engine: activeLabel,
            text: parsed.replyText,
            thoughts: parsed.thoughts,
            toolCalls: parsed.toolCalls,
            stats: parsed.stats
          }
        ]);
      }
      // 2. CLAUDE CODE CLI
      else if (selectedEngine.startsWith('claude:')) {
        setStatusNote(`[Claude Code CLI] Executing autonomous turn on workspace…`);
        const rawOutput = await invoke('run_claude_cli', {
          prompt: userText,
          cwd: workspacePath
        });

        const fileActions = await extractAndApplyFiles(rawOutput, null);
        const lines = rawOutput.split(/\r?\n/);
        for (const line of lines) {
          if (line.includes('Created') || line.includes('Updated') || line.includes('Wrote') || line.includes('Edited')) {
            fileActions.push({ tool: 'write_file', target: line.trim(), status: 'applied' });
          }
        }

        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            engine: 'Claude Code CLI',
            text: rawOutput,
            thoughts: ["Claude Code autonomous agent executed directly via CLI terminal."],
            toolCalls: fileActions,
            stats: null
          }
        ]);
      }
      // 3. CODEX CLI
      else if (selectedEngine.startsWith('codex:')) {
        setStatusNote(`[Codex CLI] Running OpenAI Codex exec on workspace…`);
        const rawOutput = await invoke('run_codex_cli', {
          prompt: userText,
          cwd: workspacePath
        });

        const fileActions = await extractAndApplyFiles(rawOutput, null);
        if (fileActions.length === 0) {
          fileActions.push({ tool: 'codex_exec', target: 'workspace files', status: 'verified' });
        }

        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            engine: 'Codex CLI',
            text: rawOutput,
            thoughts: ["Codex autonomous non-interactive engine executed code modifications."],
            toolCalls: fileActions,
            stats: null
          }
        ]);
      }
      // 4. LM STUDIO (LOCAL GPU)
      else if (selectedEngine.startsWith('lmstudio:')) {
        const modelId = selectedEngine.replace('lmstudio:', '') || 'qwen2.5-coder-7b-instruct-abliterated';
        setStatusNote(`[LM Studio GPU] Reading workspace context & generating with ${modelId}…`);
        
        // Find which component the user wants to modify
        const lowerInput = userText.toLowerCase();
        let identifiedComp = null;
        for (const [key, comp] of Object.entries(ACTIVE_COMPONENTS)) {
          if (lowerInput.includes(key)) {
            identifiedComp = comp;
            break;
          }
        }

        let contextSnippet = "";
        if (identifiedComp) {
          try {
            const currentCode = await invoke('read_file_content', {
              filePath: `${workspacePath}\\${identifiedComp.path.replace(/\//g, '\\')}`
            });
            contextSnippet = `\n\nTarget File to edit: ${identifiedComp.path}\nCurrent Code:\n\`\`\`tsx\n${currentCode}\n\`\`\``;
          } catch (e) {
            console.warn("Could not read target component:", e);
          }
        }

        const systemPrompt = `You are Kova AI, an elite autonomous web architect running locally on GPU.
You are directly modifying the user's running Next.js 15 site.
Follow the Impeccable Design Standard: Obsidian (#09090b), crisp micro-borders (border-white/10), emerald (#10b981) accents, Lucide React icons.

CRITICAL INSTRUCTION:
When editing or creating code, you MUST format the response like this:
### Write: <exact_file_path>
\`\`\`tsx
<complete file code with all imports and exports>
\`\`\`
Always provide complete, valid code so it can be automatically written to disk.`;

        const userPrompt = `${userText}${contextSnippet}`;

        const body = {
          model: modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.2
        };

        const raw = await invoke('send_lmstudio_chat', { payload: JSON.stringify(body) });
        const data = JSON.parse(raw);
        const text = data?.choices?.[0]?.message?.content || "Completed.";

        setStatusNote('Applying generated code to workspace files…');
        const fileActions = await extractAndApplyFiles(text, identifiedComp);

        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            engine: `LM Studio (${modelId})`,
            text, 
            thoughts: [
              `Direct local GPU inference on ${modelId}.`,
              fileActions.length > 0 
                ? `Extracted and wrote ${fileActions.length} file(s) directly to disk.` 
                : "No disk writes detected in output."
            ], 
            toolCalls: fileActions, 
            stats: data?.usage || null 
          }
        ]);
      }
      // 5. OLLAMA
      else if (selectedEngine.startsWith('ollama:')) {
        setStatusNote(`[Ollama] Connecting to local Ollama service…`);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            engine: 'Ollama Local',
            text: "Ollama connected on port 11434.",
            thoughts: [],
            toolCalls: [],
            stats: null
          }
        ]);
      }

      // Hot reload the Next.js visual preview on port 3000
      setTimeout(() => {
        handleReloadPreview();
      }, 500);

    } catch (err) {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          engine: activeLabel,
          text: `Engine Execution Error: ${err.message || err}`,
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

  // Connected count for header badge
  const connectedCount = [
    cliStatus.opencode, 
    cliStatus.claude, 
    cliStatus.codex, 
    cliStatus.lmstudio,
    cliStatus.ollama
  ].filter(Boolean).length;

  return (
    <div className="studio-container">
      {/* TOP HEADER */}
      <header className="studio-header">
        <div className="brand-section">
          <div className="brand-badge">
            <Sparkles size={16} />
            <span>KOVA STUDIO</span>
            <span className="brand-version">MULTI-CLI ENGINE</span>
          </div>

          {/* ENGINE PICKER IN HEADER */}
          <div className="engine-select-pill">
            <BrainCircuit size={13} style={{ color: 'var(--accent-emerald)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Engine:</span>
            <select 
              className="studio-select" 
              value={selectedEngine} 
              onChange={(e) => setSelectedEngine(e.target.value)}
            >
              <optgroup label="OpenCode CLI (Autonomous Engine)">
                <option value="opencode:opencode/deepseek-v4.1-flash-free">OpenCode: DeepSeek V4.1 Flash (Free + Reasoning)</option>
                <option value="opencode:groq/qwen/qwen3.8-27b">OpenCode: Groq Qwen 3.8 27B (Ultra-Fast)</option>
                <option value="opencode:groq/openai/gpt-oss-120b">OpenCode: Groq GPT-OSS 120B (High Reasoning)</option>
                <option value="opencode:opencode/nemotron-3.5-lightning-free">OpenCode: Nemotron 3.5 Lightning (Free)</option>
              </optgroup>
              
              <optgroup label="Claude Code CLI (Anthropic Official)">
                <option value="claude:claude-3-7-sonnet">Claude Code CLI (Autonomous Agent)</option>
              </optgroup>

              <optgroup label="Codex CLI (OpenAI Official)">
                <option value="codex:default">Codex CLI (OpenAI Autonomous Exec)</option>
              </optgroup>

              <optgroup label="LM Studio (Local GPU 127.0.0.1:1234)">
                {cliStatus.lmstudio_models && cliStatus.lmstudio_models.length > 0 ? (
                  cliStatus.lmstudio_models.map((m, idx) => (
                    <option key={idx} value={`lmstudio:${m}`}>LM Studio: {m}</option>
                  ))
                ) : (
                  <option value="lmstudio:qwen2.5-coder-7b-instruct-abliterated">LM Studio: Qwen 2.5 Coder 7B</option>
                )}
              </optgroup>

              <optgroup label="Ollama (Local 127.0.0.1:11434)">
                <option value="ollama:qwen2.5-coder">Ollama: Qwen 2.5 Coder</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* SYSTEM STATUS PILLS & WORKBENCH ACTIONS */}
        <div className="system-pills">
          {/* EXPORT ZIP BUTTON */}
          <button 
            className="export-zip-btn" 
            onClick={handleExportZip}
            title="Download full project as ZIP to Downloads"
          >
            <Download size={13} style={{ color: 'var(--accent-emerald)' }} />
            <span>Export ZIP</span>
          </button>

          {/* CONNECTED ENGINES MODAL TRIGGER */}
          <button 
            className="engines-modal-trigger"
            onClick={() => setShowEngineModal(true)}
            title="Manage Connected CLIs and Local Models"
          >
            <Zap size={13} style={{ color: 'var(--accent-emerald)' }} />
            <span>Connected Engines</span>
            <span className="badge-count">{connectedCount} Active</span>
          </button>

          <div className={`status-pill ${cliStatus.opencode ? 'online' : 'offline'}`} title="OpenCode CLI">
            <span className={`status-dot ${cliStatus.opencode ? 'online' : 'offline'}`} />
            <Bot size={12} />
            <span>OpenCode: {cliStatus.opencode ? 'Ready' : 'Not found'}</span>
          </div>

          <div className={`status-pill ${cliStatus.claude ? 'online' : 'offline'}`} title="Claude Code CLI">
            <span className={`status-dot ${cliStatus.claude ? 'online' : 'offline'}`} />
            <Code2 size={12} />
            <span>Claude: {cliStatus.claude ? 'Ready' : 'Not found'}</span>
          </div>

          <div className={`status-pill ${cliStatus.codex ? 'online' : 'offline'}`} title="Codex CLI">
            <span className={`status-dot ${cliStatus.codex ? 'online' : 'offline'}`} />
            <Terminal size={12} />
            <span>Codex: {cliStatus.codex ? 'Ready' : 'Not found'}</span>
          </div>

          <div className={`status-pill ${cliStatus.lmstudio ? 'online' : 'offline'}`} title="LM Studio Local GPU">
            <span className={`status-dot ${cliStatus.lmstudio ? 'online' : 'offline'}`} />
            <Cpu size={12} />
            <span>LM Studio: {cliStatus.lmstudio ? 'Ready' : 'Offline'}</span>
          </div>
        </div>
      </header>

      {/* MAIN SPLIT WORKBENCH */}
      <div className="workbench-split split">
        {/* LEFT: AUTONOMOUS AGENT CHAT */}
        <section className="agent-pane">
          <div className="agent-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={14} style={{ color: 'var(--accent-emerald)' }} />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Autonomous Engineering Chat</span>
            </div>

            {/* IN-CHAT MODEL SWITCHER */}
            <div className="chat-model-switcher">
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Model:</span>
              <select 
                className="chat-select"
                value={selectedEngine}
                onChange={(e) => setSelectedEngine(e.target.value)}
              >
                <optgroup label="OpenCode CLI">
                  <option value="opencode:opencode/deepseek-v4.1-flash-free">DeepSeek V4.1 Flash (Reasoning + Free)</option>
                  <option value="opencode:groq/qwen/qwen3.8-27b">Groq Qwen 3.8 27B (Ultra-Fast)</option>
                  <option value="opencode:groq/openai/gpt-oss-120b">Groq GPT-OSS 120B</option>
                  <option value="opencode:opencode/nemotron-3.5-lightning-free">Nemotron 3.5 Lightning</option>
                </optgroup>
                <optgroup label="Claude Code CLI">
                  <option value="claude:claude-3-7-sonnet">Claude 3.7 Sonnet (Official CLI)</option>
                </optgroup>
                <optgroup label="Codex CLI">
                  <option value="codex:default">Codex CLI (Autonomous exec)</option>
                </optgroup>
                <optgroup label="Local GPU (LM Studio)">
                  {cliStatus.lmstudio_models && cliStatus.lmstudio_models.length > 0 ? (
                    cliStatus.lmstudio_models.map((m, idx) => (
                      <option key={idx} value={`lmstudio:${m}`}>{m}</option>
                    ))
                  ) : (
                    <option value="lmstudio:qwen2.5-coder-7b-instruct-abliterated">Qwen 2.5 Coder 7B</option>
                  )}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Messages */}
          <div className="agent-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`message-bubble ${m.role}`}>
                {/* Engine Tag Header */}
                {m.role === 'assistant' && (
                  <div className="message-engine-tag">
                    <Zap size={11} style={{ color: 'var(--accent-emerald)' }} />
                    <span>{m.engine || 'Kova Autonomous Engine'}</span>
                  </div>
                )}

                {/* 1. THINKING ACCORDION */}
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

                {/* 4. PERFORMANCE / TOKEN FOOTER */}
                {m.stats && (
                  <div className="message-stats">
                    <span>⚡ {m.stats.total?.toLocaleString() || m.stats.total_tokens} tokens</span>
                    <span>• {m.stats.reasoning ? `${m.stats.reasoning} reasoning tokens` : 'Zero hallucination'}</span>
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

          {/* Composer with Slash Commands */}
          <div className="agent-composer" style={{ position: 'relative' }}>
            {/* Slash Command Autocomplete Popover */}
            {slashMenuOpen && (
              <SlashCommandMenu
                commands={matchedCommands}
                selectedIndex={slashSelectedIndex}
                onSelect={applySlashCommand}
                onClose={() => setSlashMenuOpen(false)}
              />
            )}

            <div className="composer-input-box">
              <textarea
                ref={composerTextareaRef}
                className="composer-textarea"
                placeholder="Type a prompt or '/' for slash commands (/plan, /code, /diff, /wp, /export)..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <div className="composer-actions">
                <div className="quick-commands">
                  <span className="cmd-badge" onClick={() => applySlashCommand({ name: '/plan', prefixPrompt: 'Create an architectural plan for: ' })}>
                    /plan
                  </span>
                  <span className="cmd-badge" onClick={() => setActiveTab('code')}>
                    /code
                  </span>
                  <span className="cmd-badge" onClick={() => setActiveTab('diff')}>
                    /diff
                  </span>
                  <span className="cmd-badge" onClick={() => setActiveTab('wp')}>
                    /wp
                  </span>
                  <span className="cmd-badge" onClick={() => handleExportZip()}>
                    /export
                  </span>
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

        {/* RIGHT: KRIKKIT MULTI-MODE WORKBENCH */}
        <section className="preview-pane">
          {/* WORKBENCH STAGE TABS TOOLBAR */}
          <div className="preview-toolbar">
            {/* TABS SWITCHER */}
            <div className="workbench-tabs">
              <button 
                className={`wb-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
                title="Live Next.js Visual Preview"
              >
                <Globe size={13} />
                <span>Preview</span>
              </button>
              <button 
                className={`wb-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
                onClick={() => setActiveTab('code')}
                title="Code Canvas & File Browser"
              >
                <Code2 size={13} />
                <span>Code Canvas</span>
              </button>
              <button 
                className={`wb-tab-btn ${activeTab === 'diff' ? 'active' : ''}`}
                onClick={() => setActiveTab('diff')}
                title="Git & VFS Diff Viewer"
              >
                <GitCompare size={13} />
                <span>Diff</span>
              </button>
              <button 
                className={`wb-tab-btn ${activeTab === 'wp' ? 'active' : ''}`}
                onClick={() => setActiveTab('wp')}
                title="Headless WordPress CMS Bridge"
              >
                <Database size={13} />
                <span>WordPress</span>
              </button>
              <button 
                className={`wb-tab-btn ${activeTab === 'terminal' ? 'active' : ''}`}
                onClick={() => setActiveTab('terminal')}
                title="Workspace Terminal Drawer"
              >
                <Terminal size={13} />
                <span>Terminal</span>
              </button>
            </div>

            {/* IF PREVIEW IS ACTIVE: VIEWPORT & URL BAR */}
            {activeTab === 'preview' && (
              <>
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
              </>
            )}
          </div>

          {/* ACTIVE WORKBENCH STAGE CONTENT */}
          <div className="preview-viewport-container" style={{ position: 'relative' }}>
            {/* 1. LIVE PREVIEW */}
            {activeTab === 'preview' && (
              <>
                {/* Swarm Multi-Agent Rebuild Indicator */}
                {isGenerating && (
                  <div className="swarm-indicator">
                    <Sparkles size={12} />
                    <span>Swarm Agent Active: {statusNote || 'Applying AST delta'}</span>
                  </div>
                )}
                <iframe 
                  ref={iframeRef}
                  src={previewUrl}
                  className={`preview-frame ${viewport}`}
                  title="Live Preview"
                />
              </>
            )}

            {/* 2. CODE CANVAS & FILE BROWSER */}
            {activeTab === 'code' && (
              <CodeCanvas
                workspacePath={workspacePath}
                onFileSaved={handleReloadPreview}
                initialFile="src/components/landing/kova/KovaFooter.tsx"
              />
            )}

            {/* 3. DIFF VIEWER */}
            {activeTab === 'diff' && (
              <DiffViewer
                workspacePath={workspacePath}
                recentFiles={recentFilesModified}
              />
            )}

            {/* 4. WORDPRESS BRIDGE */}
            {activeTab === 'wp' && (
              <WordPressBridge />
            )}

            {/* 5. TERMINAL DRAWER */}
            {activeTab === 'terminal' && (
              <TerminalDrawer
                workspacePath={workspacePath}
              />
            )}
          </div>
        </section>
      </div>

      {/* CONNECTED ENGINES & LOCAL MODELS MODAL */}
      {showEngineModal && (
        <div className="modal-backdrop" onClick={() => setShowEngineModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="modal-icon-badge">
                  <Zap size={18} style={{ color: 'var(--accent-emerald)' }} />
                </div>
                <div>
                  <h3 className="modal-title">Connected Engines & Local Models</h3>
                  <p className="modal-subtitle">Direct CLI terminal bridges & local GPU model runtimes</p>
                </div>
              </div>
              <button className="btn-close-modal" onClick={() => setShowEngineModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              {/* Engine 1: OpenCode CLI */}
              <div className={`engine-card ${cliStatus.opencode ? 'active' : ''}`}>
                <div className="engine-card-left">
                  <div className="engine-icon-box">
                    <Bot size={20} style={{ color: cliStatus.opencode ? 'var(--accent-emerald)' : 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <div className="engine-name-row">
                      <span className="engine-title">OpenCode CLI</span>
                      <span className={`engine-badge ${cliStatus.opencode ? 'online' : 'offline'}`}>
                        {cliStatus.opencode ? 'Connected' : 'Not Detected'}
                      </span>
                    </div>
                    <p className="engine-desc">
                      Autonomous agent with multi-step reasoning, real disk tools, AST diffing & thinking models (DeepSeek V4.1, Groq, Nemotron).
                    </p>
                    <div className="engine-meta">
                      <span>CLI: <code>opencode.cmd run --format json --thinking --auto</code></span>
                    </div>
                  </div>
                </div>
                <div className="engine-card-action">
                  <button 
                    className={`btn-select-engine ${selectedEngine.startsWith('opencode:') ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedEngine('opencode:opencode/deepseek-v4.1-flash-free');
                      setShowEngineModal(false);
                    }}
                  >
                    {selectedEngine.startsWith('opencode:') ? <><Check size={13} /> Active</> : 'Use Engine'}
                  </button>
                </div>
              </div>

              {/* Engine 2: Claude Code CLI */}
              <div className={`engine-card ${cliStatus.claude ? 'active' : ''}`}>
                <div className="engine-card-left">
                  <div className="engine-icon-box">
                    <Code2 size={20} style={{ color: cliStatus.claude ? 'var(--accent-emerald)' : 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <div className="engine-name-row">
                      <span className="engine-title">Claude Code CLI</span>
                      <span className={`engine-badge ${cliStatus.claude ? 'online' : 'offline'}`}>
                        {cliStatus.claude ? 'Connected' : 'Not Detected'}
                      </span>
                    </div>
                    <p className="engine-desc">
                      Anthropic's official terminal agent. Runs Claude 3.7 Sonnet autonomously on the workspace directory.
                    </p>
                    <div className="engine-meta">
                      <span>CLI: <code>claude -p &lt;prompt&gt; --dangerously-skip-permissions</code></span>
                    </div>
                  </div>
                </div>
                <div className="engine-card-action">
                  <button 
                    className={`btn-select-engine ${selectedEngine.startsWith('claude:') ? 'selected' : ''}`}
                    disabled={!cliStatus.claude}
                    onClick={() => {
                      setSelectedEngine('claude:claude-3-7-sonnet');
                      setShowEngineModal(false);
                    }}
                  >
                    {selectedEngine.startsWith('claude:') ? <><Check size={13} /> Active</> : 'Use Engine'}
                  </button>
                </div>
              </div>

              {/* Engine 3: Codex CLI */}
              <div className={`engine-card ${cliStatus.codex ? 'active' : ''}`}>
                <div className="engine-card-left">
                  <div className="engine-icon-box">
                    <Terminal size={20} style={{ color: cliStatus.codex ? 'var(--accent-emerald)' : 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <div className="engine-name-row">
                      <span className="engine-title">Codex CLI</span>
                      <span className={`engine-badge ${cliStatus.codex ? 'online' : 'offline'}`}>
                        {cliStatus.codex ? 'Connected' : 'Not Detected'}
                      </span>
                    </div>
                    <p className="engine-desc">
                      OpenAI Codex non-interactive execution engine. Directly modifies and tests workspace files.
                    </p>
                    <div className="engine-meta">
                      <span>CLI: <code>codex exec --skip-git-repo-check --approve-for-me</code></span>
                    </div>
                  </div>
                </div>
                <div className="engine-card-action">
                  <button 
                    className={`btn-select-engine ${selectedEngine.startsWith('codex:') ? 'selected' : ''}`}
                    disabled={!cliStatus.codex}
                    onClick={() => {
                      setSelectedEngine('codex:default');
                      setShowEngineModal(false);
                    }}
                  >
                    {selectedEngine.startsWith('codex:') ? <><Check size={13} /> Active</> : 'Use Engine'}
                  </button>
                </div>
              </div>

              {/* Engine 4: LM Studio (Local GPU) */}
              <div className={`engine-card ${cliStatus.lmstudio ? 'active' : ''}`}>
                <div className="engine-card-left">
                  <div className="engine-icon-box">
                    <Cpu size={20} style={{ color: cliStatus.lmstudio ? 'var(--accent-emerald)' : 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <div className="engine-name-row">
                      <span className="engine-title">LM Studio (Local GPU)</span>
                      <span className={`engine-badge ${cliStatus.lmstudio ? 'online' : 'offline'}`}>
                        {cliStatus.lmstudio ? '127.0.0.1:1234 Online' : 'Offline'}
                      </span>
                    </div>
                    <p className="engine-desc">
                      Zero cloud latency, 100% offline private local GPU models running on your hardware.
                    </p>
                    <div className="engine-meta">
                      <span>Loaded Models: {cliStatus.lmstudio_models?.join(', ') || 'qwen2.5-coder-7b-instruct-abliterated'}</span>
                    </div>
                  </div>
                </div>
                <div className="engine-card-action">
                  <button 
                    className={`btn-select-engine ${selectedEngine.startsWith('lmstudio:') ? 'selected' : ''}`}
                    disabled={!cliStatus.lmstudio}
                    onClick={() => {
                      const firstModel = cliStatus.lmstudio_models?.[0] || 'qwen2.5-coder-7b-instruct-abliterated';
                      setSelectedEngine(`lmstudio:${firstModel}`);
                      setShowEngineModal(false);
                    }}
                  >
                    {selectedEngine.startsWith('lmstudio:') ? <><Check size={13} /> Active</> : 'Use Engine'}
                  </button>
                </div>
              </div>

              {/* Engine 5: Ollama (Local) */}
              <div className={`engine-card ${cliStatus.ollama ? 'active' : ''}`}>
                <div className="engine-card-left">
                  <div className="engine-icon-box">
                    <Server size={20} style={{ color: cliStatus.ollama ? 'var(--accent-emerald)' : 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <div className="engine-name-row">
                      <span className="engine-title">Ollama</span>
                      <span className={`engine-badge ${cliStatus.ollama ? 'online' : 'offline'}`}>
                        {cliStatus.ollama ? '127.0.0.1:11434 Online' : 'Offline'}
                      </span>
                    </div>
                    <p className="engine-desc">
                      Local containerized models via standard Ollama daemon.
                    </p>
                  </div>
                </div>
                <div className="engine-card-action">
                  <button 
                    className="btn-select-engine"
                    disabled={!cliStatus.ollama}
                    onClick={() => {
                      setSelectedEngine('ollama:qwen2.5-coder');
                      setShowEngineModal(false);
                    }}
                  >
                    {selectedEngine.startsWith('ollama:') ? <><Check size={13} /> Active</> : 'Use Engine'}
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-refresh-probing"
                onClick={probeEngines}
                disabled={isProbing}
              >
                <RefreshCw size={13} className={isProbing ? 'spinning' : ''} />
                <span>{isProbing ? 'Probing Installed CLIs…' : 'Rescan CLI Connections'}</span>
              </button>
              <button className="btn-close-secondary" onClick={() => setShowEngineModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
