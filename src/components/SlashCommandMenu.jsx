import React, { useEffect, useRef } from 'react';
import { Terminal, Sparkles, ChevronRight, Hash } from 'lucide-react';

export function SlashCommandMenu({ commands, selectedIndex, onSelect, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    // Scroll selected item into view
    const activeEl = menuRef.current?.querySelector('.slash-item.active');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!commands || commands.length === 0) return null;

  return (
    <div className="slash-command-popup" ref={menuRef}>
      <div className="slash-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Terminal size={12} style={{ color: 'var(--accent-emerald)' }} />
          <span>Slash Commands ({commands.length})</span>
        </div>
        <span className="slash-hint">Use ↑ ↓ and Enter to select • Esc to dismiss</span>
      </div>

      <div className="slash-list">
        {commands.map((cmd, idx) => (
          <div
            key={cmd.name}
            className={`slash-item ${idx === selectedIndex ? 'active' : ''}`}
            onClick={() => onSelect(cmd)}
            onMouseEnter={() => {}}
          >
            <div className="slash-item-left">
              <span className="slash-cmd-name">{cmd.name}</span>
              <span className="slash-cmd-category">{cmd.category}</span>
            </div>
            <div className="slash-item-desc">{cmd.description}</div>
            <ChevronRight size={12} className="slash-item-arrow" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SlashCommandMenu;
