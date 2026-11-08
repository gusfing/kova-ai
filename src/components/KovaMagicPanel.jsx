import React, { useState } from 'react';
import { 
  Sparkles, Wand2, Palette, Sliders, ShieldCheck, Check, 
  ArrowRight, Flame, Layers, Sun, Moon, Eye, Zap, Gem, Compass
} from 'lucide-react';

export const ARCHETYPES = [
  {
    id: 'obsidian',
    name: 'Obsidian High-Tech',
    desc: 'Signature Kova standard: pitch-black canvas, crisp micro-borders, emerald glows',
    accent: '#10b981',
    bg: '#09090b',
    badge: 'Kova Default',
    promptSnippet: 'Apply the Obsidian High-Tech archetype: deep #09090b background, border-white/10 micro-borders, emerald (#10b981) glowing accents, Lucide icons, and smooth hover lifts.'
  },
  {
    id: 'luxury',
    name: 'Luxury Editorial',
    desc: 'Bespoke high-end craft: Fraunces serif headings, warm champagne gold, generous whitespace',
    accent: '#d4af37',
    bg: '#0a0a0c',
    badge: 'Editorial',
    promptSnippet: 'Apply the Luxury Editorial archetype: bespoke serif heading typography, muted champagne gold accents (#d4af37), airy padding, elegant borders, and refined card framing.'
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Vector',
    desc: 'High-voltage electric: cyan & emerald contrast, code badges, terminal metrics',
    accent: '#06b6d4',
    bg: '#05070f',
    badge: 'Electric',
    promptSnippet: 'Apply the Cyberpunk Vector archetype: ultra-high contrast dark canvas, neon cyan (#06b6d4) and emerald accents, glowing stat boxes, and futuristic pill badges.'
  },
  {
    id: 'minimal',
    name: 'Nordic Architecture',
    desc: 'Restrained, calm, and uncluttered: graphite surfaces, subtle line borders, quiet typography',
    accent: '#a1a1aa',
    bg: '#0c0c0e',
    badge: 'Minimal',
    promptSnippet: 'Apply the Nordic Architecture archetype: quiet, understated typography, graphite surfaces, clean hairline dividers, and distraction-free layout.'
  }
];

export function KovaMagicPanel({ onApplyAesthetic, isApplying = false }) {
  const [selectedArchetype, setSelectedArchetype] = useState('obsidian');
  const [selectedAccent, setSelectedAccent] = useState('#10b981');
  const [selectedRadius, setSelectedRadius] = useState('12px');
  const [glassIntensity, setGlassIntensity] = useState('medium');

  const handleMagicPolish = () => {
    const arch = ARCHETYPES.find(a => a.id === selectedArchetype) || ARCHETYPES[0];
    const fullPolishPrompt = `🪄 [KOVA MAGIC POLISH PASS]
Transform and elevate all site components with Impeccable Design:
1. Archetype: ${arch.name} (${arch.promptSnippet})
2. Primary Accent Color: ${selectedAccent}
3. Border Radius Standard: ${selectedRadius} (rounded-xl / rounded-2xl)
4. Glassmorphism Elevation: ${glassIntensity === 'high' ? 'bg-zinc-900/80 backdrop-blur-xl border border-white/15' : 'bg-zinc-900/60 backdrop-blur-md border border-white/10'}
5. Micro-Interactions: Add smooth hover lifts ('transition-all duration-300 hover:-translate-y-1 hover:shadow-xl')
6. Icons: Ensure all buttons and feature cards have crisp Lucide React icons with emerald/accent tinting.
Eliminate all generic, unstyled flat boxes and output complete production-ready code.`;

    if (onApplyAesthetic) {
      onApplyAesthetic(fullPolishPrompt);
    }
  };

  return (
    <div className="kova-magic-drawer">
      {/* Drawer Header */}
      <div className="magic-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="magic-icon-glow">
            <Wand2 size={15} style={{ color: '#10b981' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="magic-title">Kova Magic Polish</span>
              <span className="brand-version" style={{ color: 'var(--accent-emerald)', borderColor: 'rgba(16,185,129,0.3)' }}>
                Aesthetic Engine
              </span>
            </div>
            <p className="magic-subtitle">Turn raw CLI outputs into breathtaking, award-winning interfaces</p>
          </div>
        </div>

        <button 
          className="btn-magic-action"
          onClick={handleMagicPolish}
          disabled={isApplying}
          title="Run Impeccable Design Polish Pass"
        >
          <Sparkles size={13} className={isApplying ? 'spinning' : ''} />
          <span>{isApplying ? 'Elevating Design…' : 'Apply Magic Polish'}</span>
        </button>
      </div>

      {/* Archetypes Selector Grid */}
      <div className="magic-archetypes-row">
        {ARCHETYPES.map(arch => (
          <div
            key={arch.id}
            className={`archetype-chip ${selectedArchetype === arch.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedArchetype(arch.id);
              setSelectedAccent(arch.accent);
            }}
          >
            <div className="archetype-dot" style={{ backgroundColor: arch.accent }} />
            <div style={{ textAlign: 'left' }}>
              <div className="archetype-name">{arch.name}</div>
              <div className="archetype-badge-mini">{arch.badge}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Visual Controls */}
      <div className="magic-controls-row">
        {/* Accent Color Swatches */}
        <div className="control-group">
          <span className="control-label">Accent Glow</span>
          <div className="color-swatches">
            {['#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6'].map(color => (
              <button
                key={color}
                className={`color-swatch-btn ${selectedAccent === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedAccent(color)}
              />
            ))}
          </div>
        </div>

        {/* Border Radius */}
        <div className="control-group">
          <span className="control-label">Border Radius</span>
          <div className="pill-toggles">
            <button 
              className={`pill-toggle-btn ${selectedRadius === '6px' ? 'active' : ''}`}
              onClick={() => setSelectedRadius('6px')}
            >
              Sharp (6px)
            </button>
            <button 
              className={`pill-toggle-btn ${selectedRadius === '12px' ? 'active' : ''}`}
              onClick={() => setSelectedRadius('12px')}
            >
              Modern (12px)
            </button>
            <button 
              className={`pill-toggle-btn ${selectedRadius === '9999px' ? 'active' : ''}`}
              onClick={() => setSelectedRadius('9999px')}
            >
              Pill
            </button>
          </div>
        </div>

        {/* Glass Elevation */}
        <div className="control-group">
          <span className="control-label">Elevation</span>
          <div className="pill-toggles">
            <button 
              className={`pill-toggle-btn ${glassIntensity === 'subtle' ? 'active' : ''}`}
              onClick={() => setGlassIntensity('subtle')}
            >
              Subtle
            </button>
            <button 
              className={`pill-toggle-btn ${glassIntensity === 'medium' ? 'active' : ''}`}
              onClick={() => setGlassIntensity('medium')}
            >
              Glassmorphism
            </button>
            <button 
              className={`pill-toggle-btn ${glassIntensity === 'high' ? 'active' : ''}`}
              onClick={() => setGlassIntensity('high')}
            >
              Ultra-Gloss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KovaMagicPanel;

