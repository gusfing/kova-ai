import React, { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Terminal, Play, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export function TerminalDrawer({ workspacePath }) {
  const [cmdInput, setCmdInput] = useState('');
  const [outputLogs, setOutputLogs] = useState([
    "Kova Desktop Terminal — Ready.",
    `Active workspace: ${workspacePath}`
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputLogs]);

  const runCommand = async (cmdToRun) => {
    const cmd = cmdToRun || cmdInput;
    if (!cmd.trim() || isRunning) return;

    setIsRunning(true);
    setOutputLogs(prev => [...prev, `> ${cmd}`]);
    setCmdInput('');

    try {
      const res = await invoke('execute_command', {
        cmd: cmd,
        cwd: workspacePath
      });
      setOutputLogs(prev => [...prev, res || '[Process finished with code 0]']);
    } catch (err) {
      setOutputLogs(prev => [...prev, `Error: ${err}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runCommand();
    }
  };

  return (
    <div className="terminal-drawer-container">
      <div className="terminal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={14} style={{ color: 'var(--accent-emerald)' }} />
          <span style={{ fontSize: '12px', fontWeight: 700 }}>WORKSPACE TERMINAL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button className="canvas-icon-btn" onClick={() => setOutputLogs([])} title="Clear Terminal">
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="terminal-body">
        {outputLogs.map((log, idx) => (
          <div key={idx} className="terminal-line">
            {log}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      <div className="terminal-input-bar">
        <span className="terminal-prompt-symbol">&gt;</span>
        <input
          type="text"
          className="terminal-input"
          placeholder="Run commands (e.g. npm run build, git status, pnpm list)..."
          value={cmdInput}
          onChange={(e) => setCmdInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
        />
        <button 
          className="editor-btn primary"
          onClick={() => runCommand()}
          disabled={isRunning || !cmdInput.trim()}
        >
          <Play size={12} />
          <span>{isRunning ? 'Running…' : 'Run'}</span>
        </button>
      </div>

      {/* Quick Command Pills */}
      <div className="terminal-quick-pills">
        <span className="term-pill" onClick={() => runCommand('npm run build')}>npm run build</span>
        <span className="term-pill" onClick={() => runCommand('git status')}>git status</span>
        <span className="term-pill" onClick={() => runCommand('node -v; pnpm -v')}>versions</span>
        <span className="term-pill" onClick={() => runCommand('Get-ChildItem src/components/landing/kova')}>list kova components</span>
      </div>
    </div>
  );
}

export default TerminalDrawer;

