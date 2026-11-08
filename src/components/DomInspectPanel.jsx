import React, { useState } from 'react';
import { 
  Crosshair, Layers, Code, Sparkles, Send, CheckCircle2, 
  ChevronRight, ArrowRight, Palette, Tag, SlidersHorizontal
} from 'lucide-react';

const PREVIEW_ELEMENTS = [
  {
    id: 'hero-headline',
    component: 'src/components/landing/kova/KovaHero.tsx',
    label: 'Hero Main Headline',
    tag: 'h1',
    classes: 'text-5xl font-extrabold tracking-tight sm:text-7xl text-white',
    text: 'Describe a site. Ship a real one.'
  },
  {
    id: 'hero-badge',
    component: 'src/components/landing/kova/KovaHero.tsx',
    label: 'Hero Version Badge',
    tag: 'div',
    classes: 'inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400',
    text: '• KOVA 2.0 / 1,204 sites built this week'
  },
  {
    id: 'navbar',
    component: 'src/components/landing/kova/KovaNav.tsx',
    label: 'Floating Navbar Header',
    tag: 'header',
    classes: 'fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md',
    text: 'KOVA.AI • Platform • Features • Pricing • Launch Studio'
  },
  {
    id: 'bento-grid',
    component: 'src/components/landing/kova/KovaFeatures.tsx',
    label: 'Features Bento Cards',
    tag: 'section',
    classes: 'grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto',
    text: 'Autonomous AST delta • Edge Network • WordPress Core'
  },
  {
    id: 'pricing-card',
    component: 'src/components/landing/kova/KovaPricing.tsx',
    label: 'Pricing Tier Card',
    tag: 'div',
    classes: 'rounded-2xl border border-white/10 bg-zinc-900/60 p-8 backdrop-blur-md shadow-2xl',
    text: 'Pro Tier — $29/mo with unlimited autonomous builds'
  },
  {
    id: 'footer',
    component: 'src/components/landing/kova/KovaFooter.tsx',
    label: 'Footer & Attribution',
    tag: 'footer',
    classes: 'border-t border-white/10 bg-zinc-950 pt-16 pb-10',
    text: '© 2026 Kova Labs. All rights reserved. • Made by Kova AI'
  }
];

export function DomInspectPanel({ onInspectPrompt }) {
  const [selectedElement, setSelectedElement] = useState(PREVIEW_ELEMENTS[0]);
  const [prompt, setPrompt] = useState('');

  const handleSendPrompt = () => {
    if (!prompt.trim() || !onInspectPrompt) return;
    const fullMessage = `Target Element: ${selectedElement.label} (${selectedElement.component})
Current Tag: <${selectedElement.tag}>
Current Classes: "${selectedElement.classes}"
Current Content: "${selectedElement.text}"

Instruction: ${prompt.trim()}`;

    onInspectPrompt(fullMessage);
    setPrompt('');
  };

  return (
    <div className="dom-inspect-container">
      {/* Header */}
      <div className="dom-inspect-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Crosshair size={14} style={{ color: 'var(--accent-emerald)' }} />
          <span style={{ fontSize: '12px', fontWeight: 700 }}>DOM ELEMENT INSPECTOR</span>
        </div>
        <span className="badge-written">Interactive</span>
      </div>

      <div className="dom-inspect-body">
        {/* Elements list */}
        <div className="dom-elements-list">
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, padding: '4px 8px' }}>
            SELECT VISUAL ELEMENT ON HOMEPAGE
          </div>
          {PREVIEW_ELEMENTS.map(el => (
            <div
              key={el.id}
              className={`dom-el-row ${selectedElement.id === el.id ? 'active' : ''}`}
              onClick={() => setSelectedElement(el)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="dom-tag-badge">&lt;{el.tag}&gt;</span>
                <span className="dom-el-label">{el.label}</span>
              </div>
              <ChevronRight size={12} className="dom-arrow" />
            </div>
          ))}
        </div>

        {/* Selected element details & prompt */}
        <div className="dom-inspect-details">
          <div className="dom-detail-card">
            <div className="dom-detail-title">
              <span>{selectedElement.label}</span>
              <span className="badge-count" style={{ fontSize: '9px' }}>{selectedElement.component.split('/').pop()}</span>
            </div>

            <div className="dom-class-box">
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tailwind Classes:</span>
              <code className="dom-code">{selectedElement.classes}</code>
            </div>

            <div className="dom-class-box" style={{ marginTop: '8px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Current Text:</span>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>"{selectedElement.text}"</p>
            </div>
          </div>

          {/* Quick AI redesign prompt for this element */}
          <div className="dom-prompt-box">
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Ask AI to Redesign / Transform This Element:
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <input
                type="text"
                className="modal-text-input"
                placeholder={`e.g. Make this ${selectedElement.label} 20% larger with emerald glow...`}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendPrompt();
                  }
                }}
              />
              <button 
                className="editor-btn primary"
                disabled={!prompt.trim()}
                onClick={handleSendPrompt}
              >
                <Sparkles size={12} />
                <span>Apply</span>
              </button>
            </div>

            {/* Quick preset chips for this element */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              <span className="term-pill" onClick={() => setPrompt('Make text larger and add emerald gradient highlight')}>
                Gradient Headline
              </span>
              <span className="term-pill" onClick={() => setPrompt('Add glassmorphism backdrop with border-white/10 and subtle glow shadow')}>
                Glassmorphism
              </span>
              <span className="term-pill" onClick={() => setPrompt('Add smooth hover lift transition-all duration-300 hover:-translate-y-1')}>
                Hover Lift
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DomInspectPanel;

