import React, { useState } from 'react';
import { 
  Folder, Plus, GitBranch, ExternalLink, Check, Trash2, 
  Sparkles, Layers, Clock, Laptop, ArrowRight, X
} from 'lucide-react';

export const DEFAULT_PROJECTS = [
  {
    id: 'kova-main',
    name: 'Kova AI Flagship Landing',
    path: 'c:\\Users\\ks209\\Desktop\\wordpress ai\\frontend',
    framework: 'Next.js 15 (App Router)',
    archetype: 'Obsidian High-Tech',
    accentColor: '#10b981',
    lastModified: 'Just now',
    componentsCount: 14,
    active: true
  },
  {
    id: 'artisan-store',
    name: 'Kova Reserve • Ceremonial Matcha',
    path: 'c:\\Users\\ks209\\Desktop\\wordpress ai\\frontend\\store',
    framework: 'Next.js 15 + Headless WP',
    archetype: 'Luxury Editorial',
    accentColor: '#d4af37',
    lastModified: '2 days ago',
    componentsCount: 9,
    active: false
  },
  {
    id: 'saas-minimal',
    name: 'Atlas Vector Cloud Platform',
    path: 'c:\\Users\\ks209\\Desktop\\wordpress ai\\frontend\\designer',
    framework: 'Next.js 15 + Tailwind CSS',
    archetype: 'Minimalist SaaS',
    accentColor: '#06b6d4',
    lastModified: '3 days ago',
    componentsCount: 11,
    active: false
  }
];

export function ProjectsManagerModal({ currentPath, onSelectProject, onClose }) {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('obsidian-saas');
  const [showNewForm, setShowNewForm] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');

  const handleActivate = (proj) => {
    setProjects(prev => prev.map(p => ({ ...p, active: p.id === proj.id })));
    if (onSelectProject) {
      onSelectProject(proj.path);
    }
    onClose();
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const newProj = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      path: currentPath,
      framework: 'Next.js 15 (App Router)',
      archetype: selectedTemplate === 'luxury' ? 'Luxury Editorial' : 'Obsidian High-Tech',
      accentColor: selectedTemplate === 'luxury' ? '#d4af37' : '#10b981',
      lastModified: 'Just now',
      componentsCount: 6,
      active: true
    };
    setProjects([newProj, ...projects]);
    setNewProjectName('');
    setShowNewForm(false);
    handleActivate(newProj);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card projects-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-icon-badge">
              <Folder size={18} style={{ color: 'var(--accent-emerald)' }} />
            </div>
            <div>
              <h3 className="modal-title">Projects Management</h3>
              <p className="modal-subtitle">Switch active workspaces, scaffold new sites, or clone from Git</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: '65vh' }}>
          {/* Top Actions: New Project / Import */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
              LOCAL WORKSPACES ({projects.length})
            </span>
            <button 
              className="btn-select-engine selected"
              onClick={() => setShowNewForm(!showNewForm)}
              style={{ padding: '4px 10px', fontSize: '11px' }}
            >
              <Plus size={12} />
              <span>{showNewForm ? 'Cancel' : 'New Project'}</span>
            </button>
          </div>

          {/* New Project Form */}
          {showNewForm && (
            <div className="new-project-box">
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Scaffold New Project
              </h4>
              <input
                type="text"
                className="modal-text-input"
                placeholder="Project title (e.g. NeoFin Agency Website)..."
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
              />

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button 
                  className={`template-pill ${selectedTemplate === 'obsidian-saas' ? 'active' : ''}`}
                  onClick={() => setSelectedTemplate('obsidian-saas')}
                >
                  <Sparkles size={11} />
                  <span>Obsidian SaaS</span>
                </button>
                <button 
                  className={`template-pill ${selectedTemplate === 'luxury' ? 'active' : ''}`}
                  onClick={() => setSelectedTemplate('luxury')}
                >
                  <Layers size={11} />
                  <span>Luxury Editorial</span>
                </button>
              </div>

              <button 
                className="editor-btn primary"
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}
              >
                Create Workspace & Switch
              </button>
            </div>
          )}

          {/* Projects List */}
          <div className="projects-grid">
            {projects.map(proj => (
              <div 
                key={proj.id} 
                className={`project-card ${proj.active ? 'active' : ''}`}
                onClick={() => handleActivate(proj)}
              >
                <div className="project-card-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div 
                      className="project-accent-dot" 
                      style={{ backgroundColor: proj.accentColor, boxShadow: `0 0 10px ${proj.accentColor}` }} 
                    />
                    <span className="project-name">{proj.name}</span>
                  </div>
                  {proj.active && (
                    <span className="badge-written">
                      <Check size={10} /> Active
                    </span>
                  )}
                </div>

                <div className="project-path">
                  <code>{proj.path}</code>
                </div>

                <div className="project-meta-row">
                  <span className="proj-tag">{proj.framework}</span>
                  <span className="proj-tag">{proj.archetype}</span>
                  <span className="proj-time">
                    <Clock size={10} /> {proj.lastModified}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* GitHub Clone Box */}
          <div className="github-clone-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <GitBranch size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>Clone or Connect from Git Repository</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="modal-text-input"
                placeholder="https://github.com/username/repository.git"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
              />
              <button 
                className="editor-btn"
                disabled={!githubUrl.trim()}
                onClick={() => {
                  alert(`Cloning repository ${githubUrl} into workspace...`);
                  setGithubUrl('');
                }}
              >
                Clone
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Active Path: <code>{currentPath}</code>
          </span>
          <button className="btn-close-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectsManagerModal;
