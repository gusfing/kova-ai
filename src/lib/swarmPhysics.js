/**
 * Swarm Multiplayer Cursors Engine
 * Clean, lightweight Figma-style multiplayer cursor physics.
 * Simulates 3 AI agents moving naturally across the UI.
 */

export const SWARM_AGENTS = [
  {
    id: 'architect',
    name: 'Architect',
    color: '#8b5cf6', // Violet
  },
  {
    id: 'designer',
    name: 'Designer',
    color: '#06b6d4', // Cyan
  },
  {
    id: 'engineer',
    name: 'Engineer',
    color: '#10b981', // Emerald
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
    this.boids = SWARM_AGENTS.map((agent, index) => {
      const x = 100 + Math.random() * (this.width - 200);
      const y = 80 + Math.random() * (this.height - 180);
      return {
        ...agent,
        x,
        y,
        targetX: x,
        targetY: y,
        hoverBox: null,
        isSelecting: false,
        pauseTicks: Math.floor(Math.random() * 60),
        pulseTimer: 0
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
    this.boids.forEach(b => this.pickNewTarget(b));
  }

  stop() {
    this.active = false;
  }

  pickNewTarget(boid) {
    // Generate realistic targets inside the preview viewport
    const regions = [
      // Navbar area
      { x: this.width * 0.15, y: 24, w: Math.min(320, this.width * 0.6), h: 42 },
      // Hero Headline
      { x: this.width * 0.08, y: 110, w: Math.min(420, this.width * 0.5), h: 80 },
      // Prompt CTA box
      { x: this.width * 0.08, y: 240, w: Math.min(420, this.width * 0.48), h: 100 },
      // Right Bento Cards
      { x: Math.max(this.width * 0.52, this.width - 380), y: 110, w: 320, h: 120 },
      { x: Math.max(this.width * 0.52, this.width - 380), y: 260, w: 320, h: 160 },
      // Bottom stats
      { x: this.width * 0.08, y: 380, w: Math.min(380, this.width * 0.45), h: 50 }
    ];

    const reg = regions[Math.floor(Math.random() * regions.length)];
    boid.targetX = reg.x + Math.random() * reg.w;
    boid.targetY = reg.y + Math.random() * reg.h;
    boid.hoverBox = Math.random() > 0.3 ? reg : null;
    boid.isSelecting = Boolean(boid.hoverBox);
    boid.pauseTicks = 80 + Math.floor(Math.random() * 120); // 1.5 - 3s pause
  }

  triggerBuildStep(filename) {
    this.active = true;
    this.boids.forEach(boid => this.pickNewTarget(boid));
  }

  update() {
    if (!this.active) return;

    this.boids.forEach(boid => {
      // Natural spring/lerp easing
      const dx = boid.targetX - boid.x;
      const dy = boid.targetY - boid.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 3) {
        boid.x += dx * 0.06;
        boid.y += dy * 0.06;
      } else {
        // At target, count down pause ticks
        if (boid.pauseTicks > 0) {
          boid.pauseTicks--;
        } else {
          this.pickNewTarget(boid);
        }
      }

      boid.pulseTimer = (boid.pulseTimer + 1) % 60;
    });
  }
}
