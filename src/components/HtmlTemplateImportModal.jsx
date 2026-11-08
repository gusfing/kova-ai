import React, { useState } from 'react';
import { 
  FileCode, Upload, Sparkles, Check, X, ArrowRight, Code2, 
  Layers, Copy, Globe, Eye
} from 'lucide-react';

const STARTER_TEMPLATES = [
  {
    id: 'saas-modern',
    name: 'Modern AI SaaS Landing',
    desc: 'Hero with dynamic gradient headline, feature grid, and live metrics badge',
    html: `<header class="navbar"><div class="brand">Kova Platform</div><button class="cta-btn">Get Started</button></header>
<main class="hero">
  <span class="badge">Next Generation Cloud</span>
  <h1>Build and deploy autonomous apps with zero server latency</h1>
  <p>Experience real-time AI workflows backed by edge infrastructure.</p>
  <div class="actions"><button class="btn-primary">Start Free Trial</button><button class="btn-secondary">View Documentation</button></div>
</main>`
  },
  {
    id: 'artisan-store',
    name: 'Minimal Luxury Storefront',
    desc: 'Editorial typography, product card framing, and refined aesthetic',
    html: `<section class="editorial-header"><h1>Curated Reserve • Batch No. 04</h1><p>Limited ceremonial grade harvests sourced directly from Uji, Kyoto.</p></section>
<div class="product-grid">
  <div class="card"><span class="tag">Rare Single Cultivar</span><h3>Okumidori Ceremonial</h3><p>$48 / 30g tin</p></div>
  <div class="card"><span class="tag">Stone Milled</span><h3>Saemidori Reserve</h3><p>$56 / 30g tin</p></div>
</div>`
  },
  {
    id: 'agency-portfolio',
    name: 'Architecture & Design Studio',
    desc: 'Monochrome grid, high-contrast typography, and project showcases',
    html: `<section class="studio-hero"><h2>We engineer digital presence for visionary founders and architecture practices.</h2></section>
<div class="works"><div class="work-item"><h4>Atlas Cloud Headquarters</h4><span>Oslo, Norway • 2026</span></div></div>`
  }
];

export function HtmlTemplateImportModal({ onImportHtml, onClose }) {
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'templates'
  const [pastedHtml, setPastedHtml] = useState('');
  const [targetComponent, setTargetComponent] = useState('src/components/landing/ImportedSection.tsx');
  const [selectedTemplate, setSelectedTemplate] = useState(STARTER_TEMPLATES[0]);

  const handleConvert = (htmlToUse, compPath) => {
    const code = htmlToUse || pastedHtml;
    if (!code.trim()) return;

    const conversionPrompt = `📥 [HTML TEMPLATE IMPORT PASS]
Please convert and refactor the following raw HTML template into production-grade Next.js 15 React components:
Target File: ${compPath || targetComponent}

Requirements:
1. Convert all standard HTML tags into modular React/Next.js TypeScript components with Tailwind CSS.
2. Enforce Kova Impeccable Design: deep obsidian canvas (#09090b), micro-borders (border-white/10), emerald/amber accents, and Lucide React icons.
3. Replace any generic styling with responsive Tailwind utility classes (sm:, md:, lg:).
4. Update src/app/page.tsx to render this imported component.

Raw HTML Template Code:
\`\`\`html
${code.trim()}
\`\`\``;

    if (onImportHtml) {
      onImportHtml(conversionPrompt);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card html-import-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-icon-badge">
              <FileCode size={18} style={{ color: 'var(--accent-emerald)' }} />
            </div>
            <div>
              <h3 className="modal-title">Import HTML Template</h3>
              <p className="modal-subtitle">Convert raw HTML & CSS templates into modular Next.js React components</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="settings-nav-tabs">
          <button 
            className={`settings-nav-btn ${activeTab === 'paste' ? 'active' : ''}`}
            onClick={() => setActiveTab('paste')}
          >
            <Code2 size={13} />
            <span>Paste Raw HTML</span>
          </button>
          <button 
            className={`settings-nav-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <Layers size={13} />
            <span>Starter HTML Templates</span>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {activeTab === 'paste' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="key-input-label" style={{ marginBottom: '4px', display: 'block' }}>
                  Target Component Path in Next.js:
                </label>
                <input
                  type="text"
                  className="key-input"
                  value={targetComponent}
                  onChange={e => setTargetComponent(e.target.value)}
                  placeholder="src/components/landing/ImportedSection.tsx"
                />
              </div>

              <div>
                <label className="key-input-label" style={{ marginBottom: '4px', display: 'block' }}>
                  Paste HTML & CSS Markup:
                </label>
                <textarea
                  className="html-import-textarea"
                  rows={9}
                  placeholder={`<section class="hero">\n  <h1>My Custom Landing Page</h1>\n  <p>Pasted from Webflow, ThemeForest, or custom HTML...</p>\n</section>`}
                  value={pastedHtml}
                  onChange={e => setPastedHtml(e.target.value)}
                />
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                ⚡ <strong>Autonomous AST Conversion</strong>: Kova AI will rewrite classes into Tailwind CSS, extract icons into Lucide React, and inject the component directly into your live Next.js preview.
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Select a curated HTML template to import and adapt into your project:
              </div>
              {STARTER_TEMPLATES.map(tmpl => (
                <div 
                  key={tmpl.id}
                  className={`template-pick-card ${selectedTemplate.id === tmpl.id ? 'active' : ''}`}
                  onClick={() => setSelectedTemplate(tmpl)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#f4f4f5' }}>{tmpl.name}</span>
                    <button 
                      className="editor-btn primary"
                      style={{ padding: '3px 8px', fontSize: '10px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConvert(tmpl.html, 'src/components/landing/TemplateSection.tsx');
                      }}
                    >
                      <span>Import</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>{tmpl.desc}</p>
                  <pre className="template-preview-code">
                    <code>{tmpl.html}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-close-secondary" onClick={onClose}>
            Cancel
          </button>
          {activeTab === 'paste' && (
            <button 
              className="editor-btn primary"
              disabled={!pastedHtml.trim()}
              onClick={() => handleConvert(pastedHtml, targetComponent)}
            >
              <Sparkles size={12} />
              <span>Convert & Import into Next.js</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default HtmlTemplateImportModal;
