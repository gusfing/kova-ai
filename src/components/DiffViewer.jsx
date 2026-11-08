import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { GitCompare, RefreshCw, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';

export function DiffViewer({ workspacePath, recentFiles = [] }) {
  const [gitDiff, setGitDiff] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchDiff = async () => {
    setIsLoading(true);
    try {
      const output = await invoke('execute_command', {
        cmd: 'git diff HEAD',
        cwd: workspacePath
      });
      setGitDiff(output || 'No uncommitted changes detected. Working tree is clean.');
    } catch (e) {
      // Fallback if git is not initialized in workspace
      setGitDiff(`Recent file changes applied in session:\n${recentFiles.map(f => `  • ${f}`).join('\n') || 'No files modified yet.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiff();
  }, [workspacePath, recentFiles]);

  const renderDiffLines = (raw) => {
    const lines = raw.split(/\r?\n/);
    return lines.map((line, idx) => {
      let className = 'diff-line normal';
      if (line.startsWith('+') && !line.startsWith('+++')) {
        className = 'diff-line add';
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        className = 'diff-line remove';
      } else if (line.startsWith('@@')) {
        className = 'diff-line header';
      } else if (line.startsWith('diff --git')) {
        className = 'diff-line file-header';
      }

      return (
        <div key={idx} className={className}>
          <span className="line-num">{idx + 1}</span>
          <span className="line-content">{line}</span>
        </div>
      );
    });
  };

  return (
    <div className="diff-viewer-container">
      <div className="diff-viewer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitCompare size={14} style={{ color: 'var(--accent-emerald)' }} />
          <span style={{ fontSize: '12px', fontWeight: 700 }}>WORKSPACE GIT & VFS DIFF</span>
        </div>
        <button className="canvas-icon-btn" onClick={fetchDiff} disabled={isLoading} title="Refresh Diff">
          <RefreshCw size={12} className={isLoading ? 'spinning' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="diff-viewer-body">
        {renderDiffLines(gitDiff)}
      </div>
    </div>
  );
}

export default DiffViewer;

