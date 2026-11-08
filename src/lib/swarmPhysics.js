/**
 * Swarm Rebuild Physics Engine
 * Inspired by DhvanilPatel/swarm-cursors & Joel Califa's Swarm.
 * Simulates multi-cursor collaborative agents building web components in real-time.
 */

export const SWARM_AGENTS = [
  {
    id: 'master-architect',
    name: 'Master Architect',
    role: 'Planning Wireframes',
    color: '#a855f7', // Purple-500
    cursorSvgColor: '#c084fc',
  },
  {
    id: 'ui-designer',
    name: 'UI Designer',
    role: 'Building Components',
    color: '#06b6d4', // Cyan-500
    cursorSvgColor: '#22d3ee',
  },
  {
    id: 'tailwind-styler',
    name: 'Tailwind Styler',
    role: 'Polishing Tokens',
    color: '#10b981', // Emerald-500
    cursorSvgColor: '#34d399',
  },
  {
    id: 'wordpress-agent',
    name: 'WordPress Specialist',
    role: 'Hydrating REST Data',
    color: '#f59e0b', // Amber-500
    cursorSvgColor: '#fbbf24',
  }
];

export class SwarmSimulation {
  constructor(width, height) {
    this.width = width || 800;
    this.height = height || 600;
    this.boids = [];
    this.active = false;
    this.initBoids();
  }

  initBoids() {
    this.boids = SWARM_AGENTS.map((agent, index) => ({
      ...agent,
      x: Math.random() * (this.width - 200) + 100,
      y: Math.random() * (this.height - 200) + 100,
      targetX: Math.random() * (this.width - 200) + 100,
      targetY: Math.random() * (this.height - 200) + 100,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      box: null,
      isDrawingBox: false,
      boxProgress: 0,
      caretBlink: 0,
      actionLabel: agent.role
    }));
  }

  resize(width, height) {
    if (width > 0 && height > 0) {
      this.width = width;
      this.height = height;
    }
  }

  start() {
    this.active = true;
  }

  stop() {
    this.active = false;
  }

  triggerBuildStep(filename) {
    const cleanName = filename ? filename.split(/[\/\\]/).pop() : 'Component';
    this.boids.forEach((boid, idx) => {
      const margin = 80;
      const segW = Math.max(100, (this.width - margin * 2) / 2);
      const segH = Math.max(100, (this.height - margin * 2) / 2);
      const col = idx % 2;
      const row = Math.floor(idx / 2);

      boid.targetX = margin + col * segW + Math.random() * (segW - 100);
      boid.targetY = margin + row * segH + Math.random() * (segH - 60);
      boid.actionLabel = `Building ${cleanName}`;
      boid.isDrawingBox = true;
      boid.boxProgress = 0;
      boid.box = {
        x: Math.max(20, boid.targetX - 20),
        y: Math.max(20, boid.targetY - 20),
        w: 140 + Math.random() * 90,
        h: 60 + Math.random() * 50
      };
    });
  }

  update() {
    if (!this.active) return;

    this.boids.forEach(boid => {
      // Seek target with smooth easing
      const dx = boid.targetX - boid.x;
      const dy = boid.targetY - boid.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 15) {
        // Pick new target within bounds
        boid.targetX = Math.random() * (this.width - 160) + 80;
        boid.targetY = Math.random() * (this.height - 160) + 80;
      } else {
        boid.vx = (boid.vx + (dx / dist) * 0.4) * 0.92;
        boid.vy = (boid.vy + (dy / dist) * 0.4) * 0.92;
      }

      boid.x += boid.vx;
      boid.y += boid.vy;

      // Keep within bounds
      boid.x = Math.max(20, Math.min(this.width - 50, boid.x));
      boid.y = Math.max(20, Math.min(this.height - 50, boid.y));

      // Advance box drawing
      if (boid.isDrawingBox && boid.box) {
        boid.boxProgress = Math.min(1, boid.boxProgress + 0.04);
        if (boid.boxProgress >= 1) {
          boid.isDrawingBox = false;
        }
      }

      boid.caretBlink = (boid.caretBlink + 1) % 60;
    });
  }
}
