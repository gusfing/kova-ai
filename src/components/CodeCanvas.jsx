import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  FileCode, Folder, FolderOpen, Save, RefreshCw, Copy, Check, 
  ChevronRight, ChevronDown, FileText, Code2, Sparkles, ExternalLink
} from 'lucide-react';

export function CodeCanvas({ workspacePath, onFileSaved, initialFile = 'src/components/landing/kova/KovaFooter.tsx' }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(initialFile);
  const [fileContent, setFileContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({ 'src': true, 'src/components': true, 'src/components/landing': true, 'src/components/landing/kova': true, 'src/app': true });

  // Load directory file list
  const loadFiles = async () => {
    try {
      const list = await invoke('list_dir_files', { dirPath: workspacePath });
      setFiles(list);
      if (list.length > 0 && !selectedFile) {
        setSelectedFile(list[0]);
      }
    } catch (e) {
      console.error('Failed to list files:', e);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [workspacePath]);

  // Load selected file content
  useEffect(() => {
    if (!selectedFile) return;
    const fetchContent = async () => {
      try {
        const fullPath = `${workspacePath.replace(/\\/g, '/')}/${selectedFile.replace(/^\//, '')}`.replace(/\//g, '\\');
        const content = await invoke('read_file_content', { filePath: fullPath });
        setFileContent(content);
        setSavedSuccess(false);
      } catch (err) {
        console.error('Failed to read file:', selectedFile, err);
        setFileContent(`// Error reading file: ${err}`);
      }
    };
    fetchContent();
  }, [selectedFile, workspacePath]);

  // Save modified file
  const handleSave = async () => {
    if (!selectedFile || isSaving) return;
    setIsSaving(true);
    try {
      const fullPath = `${workspacePath.replace(/\\/g, '/')}/${selectedFile.replace(/^\//, '')}`.replace(/\//g, '\\');
      await invoke('write_file_content', {
        filePath: fullPath,
        content: fileContent
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      if (onFileSaved) onFileSaved(selectedFile);
    } catch (e) {
      console.error('Failed to save file:', e);
      alert(`Save failed: ${e}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut Ctrl+S
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Build tree from flat paths
  const fileTree = React.useMemo(() => {
    const tree = {};
    for (const f of files) {
      const parts = f.split('/');
      let curr = tree;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (i === parts.length - 1) {
          curr[p] = { __isFile: true, path: f };
        } else {
          curr[p] = curr[p] || { __isFile: false, children: {} };
          curr = curr[p].children;
        }
      }
    }
    return tree;
  }, [files]);

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  // Render tree node
  const renderTree = (node, path = '') => {
    const entries = Object.entries(node);
    entries.sort(([aName, aVal], [bName, bVal]) => {
      if (aVal.__isFile === bVal.__isFile) return aName.localeCompare(bName);
      return aVal.__isFile ? 1 : -1;
    });

    return entries.map(([name, item]) => {
      const itemPath = path ? `${path}/${name}` : name;
      if (item.__isFile) {
        const isSelected = selectedFile === item.path;
        return (
          <div
            key={itemPath}
            className={`file-tree-item file ${isSelected ? 'active' : ''}`}
            onClick={() => setSelectedFile(item.path)}
          >
            <FileCode size={13} style={{ color: isSelected ? 'var(--accent-emerald)' : 'var(--text-muted)' }} />
            <span className="file-name">{name}</span>
          </div>
        );
      } else {
        const isExpanded = !!expandedFolders[itemPath];
        return (
          <div key={itemPath} className="file-tree-folder-group">
            <div
              className="file-tree-item folder"
              onClick={() => toggleFolder(itemPath)}
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              {isExpanded ? (
                <FolderOpen size={13} style={{ color: 'var(--accent-amber)' }} />
              ) : (
                <Folder size={13} style={{ color: 'var(--text-muted)' }} />
              )}
              <span className="folder-name">{name}</span>
            </div>
            {isExpanded && item.children && (
              <div className="file-tree-children">
                {renderTree(item.children, itemPath)}
              </div>
            )}
          </div>
        );
      }
    });
  };

  return (
    <div className="code-canvas-container" onKeyDown={handleKeyDown}>
      {/* LEFT: FILES BROWSER */}
      <div className="canvas-sidebar">
        <div className="canvas-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Folder size={14} style={{ color: 'var(--accent-emerald)' }} />
            <span style={{ fontSize: '11px', fontWeight: 700 }}>WORKSPACE FILES</span>
          </div>
          <button className="canvas-icon-btn" onClick={loadFiles} title="Refresh File Tree">
            <RefreshCw size={11} />
          </button>
        </div>
        <div className="canvas-file-tree">
          {renderTree(fileTree)}
        </div>
      </div>

      {/* RIGHT: EDITOR */}
      <div className="canvas-editor-area">
        <div className="canvas-editor-header">
          <div className="editor-file-badge">
            <FileCode size={13} style={{ color: 'var(--accent-emerald)' }} />
            <span>{selectedFile || 'Select a file'}</span>
          </div>

          <div className="editor-actions">
            <button className="editor-btn" onClick={handleCopy} title="Copy Code">
              {isCopied ? <Check size={12} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={12} />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
            <button 
              className={`editor-btn primary ${savedSuccess ? 'saved' : ''}`}
              onClick={handleSave} 
              disabled={isSaving}
              title="Save to Disk (Ctrl+S)"
            >
              {savedSuccess ? (
                <>
                  <Check size={12} />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save size={12} />
                  <span>{isSaving ? 'Saving…' : 'Save (Ctrl+S)'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="canvas-textarea-wrapper">
          <textarea
            className="canvas-code-textarea"
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

export default CodeCanvas;

