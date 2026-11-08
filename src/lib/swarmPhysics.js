/**
 * Swarm Rebuild Physics Engine
 * Inspired by DhvanilPatel/swarm-cursors & Joel Califa's Swarm.
 * Simulates multi-cursor collaborative agents building web components in real-time.
 */

export const SWARM_AGENTS = [
  {
    id: 'master-architect',
    name: 'Architect',
    role: 'Structuring Layout',
    color: '#a855f7', // Purple-500
    cursorSvgColor: '#c084fc',
  },
  {
    id: 'ui-designer',
    name: 'UI Designer',
    role: 'Crafting Hero Section',
    color: '#06b6d4', // Cyan-500
    cursorSvgColor: '#22d3ee',
  },
  {
    id: 'tailwind-styler',
    name: 'Tailwind Styler',
    role: 'Polishing Emerald Tokens',
    color: '#10b981', // Emerald-500
    cursorSvgColor: '#34d399',
  },
  {
    id: 'wordpress-agent',
    name: 'WP Specialist',
    role: 'Hydrating Headless REST',
    color: '#f59e0b', // Amber-500
    cursorSvgColor: '#fbbf24',
  }
];

export class SwarmSimulation {
  constructor(width, height) {
    this.width = width || 900;
    this.height = height || 650;
    this.boids = [];
    this.active = false;
    this.initBoids();
  }

  initBoids() {
    const margin = 80;
    const availableW = Math.max(200, this.width - margin * 2);
    const availableH = Math.max(200, this.height - margin * 2);

    this.boids = SWARM_AGENTS.map((agent, index) => {
      const startX = margin + Math.random() * availableW;
      const startY = margin + Math.random() * availableH;
      const targetX = margin + Math.random() * availableW;
      const targetY = margin + Math.random() * availableH;

      return {
        ...agent,
        x: startX,
        y: startY,
        targetX,
        targetY,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        box: {
          x: Math.max(20, targetX - 40),
          y: Math.max(20, targetY - 30),
          w: 160 + Math.random() * 80,
          h: 60 + Math.random() * 40
        },
        isDrawingBox: true,
        boxProgress: 0.2,
        caretBlink: 0,
        actionLabel: agent.role
      };
    });
  }

  resize(width, height) {
    if (width > 50 && height > 50) {
      this.width = width;
      this.height = height;
    }
  }

  start() {
    this.active = true;
    if (this.boids.length === 0) {
      this.initBoids();
    }
    // Give each boid an active mission immediately
    this.boids.forEach((b, idx) => {
      b.targetX = Math.random() * (this.width - 180) + 90;
      b.targetY = Math.random() * (this.height - 180) + 90;
      b.isDrawingBox = true;
      b.boxProgress = 0;
      b.box = {
        x: Math.max(20, b.targetX - 30),
        y: Math.max(20, b.targetY - 20),
        w: 140 + Math.random() * 100,
        h: 55 + Math.random() * 50
      };
    });
  }

  stop() {
    this.active = false;
  }

  triggerBuildStep(filename) {
    const cleanName = filename ? filename.split(/[\/\\]/).pop().replace(/\.[^/.]+$/, '') : 'Component';
    this.active = true;
    const actions = [
      `Refactoring <${cleanName}>`,
      `Updating tokens on ${cleanName}`,
      `Binding props to ${cleanName}`,
      `Verifying layout of ${cleanName}`
    ];

    this.boids.forEach((boid, idx) => {
      const margin = 80;
      const segW = Math.max(100, (this.width - margin * 2) / 2);
      const segH = Math.max(100, (this.height - margin * 2) / 2);
      const col = idx % 2;
      const row = Math.floor(idx / 2);

      boid.targetX = margin + col * segW + Math.random() * (segW - 100);
      boid.targetY = margin + row * segH + Math.random() * (segH - 60);
      boid.actionLabel = actions[idx % actions.length];
      boid.isDrawingBox = true;
      boid.boxProgress = 0;
      boid.box = {
        x: Math.max(20, boid.targetX - 20),
        y: Math.max(20, boid.targetY - 20),
        w: 150 + Math.random() * 100,
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

      if (dist < 22) {
        // Pick new target within bounds
        boid.targetX = Math.random() * (this.width - 200) + 100;
        boid.targetY = Math.random() * (this.height - 200) + 100;

        // 50% chance to draw a new wireframe box & switch action
        if (Math.random() > 0.4) {
          boid.isDrawingBox = true;
          boid.boxProgress = 0;
          boid.box = {
            x: Math.max(20, boid.targetX - 25),
            y: Math.max(20, boid.targetY - 20),
            w: 120 + Math.random() * 140,
            h: 50 + Math.random() * 70
          };

          const dynamicActions = [
            'Redesigning <Hero>',
            'Adjusting padding-y',
            'Applying backdrop-blur-md',
            'Tuning emerald gradient',
            'Testing mobile breakpoint',
            'Injecting Lucide icons',
            'Optimizing AST nodes',
            'Hydrating WordPress API'
          ];
          boid.actionLabel = dynamicActions[Math.floor(Math.random() * dynamicActions.length)];
        }
      } else {
        boid.vx = (boid.vx + (dx / dist) * 0.45) * 0.92;
        boid.vy = (boid.vy + (dy / dist) * 0.45) * 0.92;
      }

      boid.x += boid.vx;
      boid.y += boid.vy;

      // Keep within bounds
      boid.x = Math.max(20, Math.min(this.width - 60, boid.x));
      boid.y = Math.max(20, Math.min(this.height - 60, boid.y));

      // Advance box drawing
      if (boid.isDrawingBox && boid.box) {
        boid.boxProgress = Math.min(1, boid.boxProgress + 0.035);
        if (boid.boxProgress >= 1) {
          boid.isDrawingBox = false;
        }
      }

      boid.caretBlink = (boid.caretBlink + 1) % 60;
    });
  }
}
