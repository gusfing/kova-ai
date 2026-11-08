/**
 * Swarm Rebuild Physics Engine
 * Inspired by DhvanilPatel/swarm-cursors & Joel Califa's Swarm.
 * Simulates real collaborative AI agents targeting semantic UI components,
 * drawing selection boxes, editing code/tokens, and synchronizing AST changes.
 */

export const SWARM_AGENTS = [
  {
    id: 'master-architect',
    name: 'Architect',
    role: 'System Structure',
    color: '#a855f7', // Purple-500
    cursorSvgColor: '#c084fc',
    specialty: 'Layout & Hierarchy'
  },
  {
    id: 'ui-designer',
    name: 'UI Designer',
    role: 'Visual Design',
    color: '#06b6d4', // Cyan-500
    cursorSvgColor: '#22d3ee',
    specialty: 'Typography & Spacing'
  },
  {
    id: 'tailwind-styler',
    name: 'Tailwind Styler',
    role: 'Design Tokens',
    color: '#10b981', // Emerald-500
    cursorSvgColor: '#34d399',
    specialty: 'Micro-borders & Glows'
  },
  {
    id: 'wordpress-agent',
    name: 'WP Specialist',
    role: 'Headless CMS',
    color: '#f59e0b', // Amber-500
    cursorSvgColor: '#fbbf24',
    specialty: 'REST API & Hydration'
  }
];

export const SEMANTIC_PAGE_ELEMENTS = [
  {
    id: 'nav',
    label: 'Floating Navbar',
    tag: '<header.nav>',
    getBounds: (w, h) => ({
      x: w * 0.06,
      y: 18,
      w: w * 0.88,
      h: 46
    }),
    tasks: [
      'Refining glassmorphism blur (backdrop-blur-md)',
      'Adjusting nav link tracking & opacity',
      'Adding emerald status beacon dot',
      'Hardening sticky z-50 elevation'
    ]
  },
  {
    id: 'hero-headline',
    label: 'Hero Main Headline',
    tag: '<h1>',
    getBounds: (w, h) => ({
      x: w * 0.06,
      y: 95,
      w: Math.min(420, w * 0.44),
      h: 90
    }),
    tasks: [
      'Tuning text-6xl font-extrabold leading-tight',
      'Applying emerald gradient text accent',
      'Eliminating generic text-gray-500',
      'Refining optical line balance'
    ]
  },
  {
    id: 'hero-badge',
    label: 'Kova 2.0 Version Pill',
    tag: '<div.badge>',
    getBounds: (w, h) => ({
      x: w * 0.06,
      y: 72,
      w: 190,
      h: 24
    }),
    tasks: [
      'Applying bg-emerald-500/10 border-emerald-500/20',
      'Updating weekly sites build counter (1,204)',
      'Setting font-mono text-xs uppercase'
    ]
  },
  {
    id: 'hero-prompt-box',
    label: 'Interactive Prompt Input',
    tag: '<section.composer>',
    getBounds: (w, h) => ({
      x: w * 0.06,
      y: 205,
      w: Math.min(440, w * 0.46),
      h: 120
    }),
    tasks: [
      'Styling obsidian inner container (#09090b)',
      'Adding preset pills (SaaS, Minimalist, Store)',
      'Applying hover lift to "Build my site" button',
      'Injecting focus:ring-emerald-500/40 glow'
    ]
  },
  {
    id: 'vitals-card',
    label: 'Core Web Vitals Bento',
    tag: '<div.card>',
    getBounds: (w, h) => ({
      x: Math.max(w * 0.54, w - 420),
      y: 95,
      w: Math.min(390, w * 0.42),
      h: 105
    }),
    tasks: [
      'Plotting real-time 0.8s LCP metric wave',
      'Applying border-white/10 micro-border',
      'Adding inner emerald glow token'
    ]
  },
  {
    id: 'pipeline-bento',
    label: 'Autonomous Build Pipeline',
    tag: '<div.pipeline>',
    getBounds: (w, h) => ({
      x: Math.max(w * 0.54, w - 420),
      y: 220,
      w: Math.min(390, w * 0.42),
      h: 175
    }),
    tasks: [
      'Validating 5/5 AST compilation pipeline',
      'Binding headless WordPress REST sync',
      'Injecting Lucide CheckCircle2 icons',
      'Adding animated deploy checkmark'
    ]
  },
  {
    id: 'telemetry-bar',
    label: 'Global Telemetry Stats',
    tag: '<footer.metrics>',
    getBounds: (w, h) => ({
      x: w * 0.06,
      y: 350,
      w: Math.min(440, w * 0.46),
      h: 60
    }),
    tasks: [
      'Displaying 18ms Edge TTFB stat',
      'Adding 310 Anycast PoPs latency badge',
      'Verifying 99.99% uptime telemetry'
    ]
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
    this.boids = SWARM_AGENTS.map((agent, index) => {
      // Assign distinct initial target elements to avoid overlapping
      const targetElem = SEMANTIC_PAGE_ELEMENTS[index % SEMANTIC_PAGE_ELEMENTS.length];
      const bounds = targetElem.getBounds(this.width, this.height);

      return {
        ...agent,
        targetElem,
        x: bounds.x + Math.random() * bounds.w,
        y: bounds.y + Math.random() * bounds.h,
        targetX: bounds.x,
        targetY: bounds.y,
        vx: 0,
        vy: 0,
        state: 'targeting', // 'targeting' | 'selecting' | 'editing' | 'completed'
        stateTimer: 0,
        editProgress: 0,
        box: { ...bounds },
        currentTask: targetElem.tasks[0],
        actionLabel: `${targetElem.tag} ${targetElem.tasks[0]}`,
        clickRipple: 0,
        caretBlink: 0
      };
    });
  }

  resize(width, height) {
    if (width > 50 && height > 50) {
      this.width = width;
      this.height = height;
      // Re-anchor targets to new responsive dimensions
      this.boids.forEach(boid => {
        if (boid.targetElem) {
          const bounds = boid.targetElem.getBounds(this.width, this.height);
          boid.box = { ...bounds };
        }
      });
    }
  }

  start() {
    this.active = true;
    this.boids.forEach((boid, idx) => {
      this.assignNewTarget(boid, idx);
    });
  }

  stop() {
    this.active = false;
  }

  assignNewTarget(boid, forceIdx = null) {
    // Pick an element not currently being edited by another agent
    const usedIds = this.boids.filter(b => b.id !== boid.id && b.targetElem).map(b => b.targetElem.id);
    const available = SEMANTIC_PAGE_ELEMENTS.filter(e => !usedIds.includes(e.id));
    const pool = available.length > 0 ? available : SEMANTIC_PAGE_ELEMENTS;

    const elem = (forceIdx !== null && SEMANTIC_PAGE_ELEMENTS[forceIdx % SEMANTIC_PAGE_ELEMENTS.length]) 
      ? SEMANTIC_PAGE_ELEMENTS[forceIdx % SEMANTIC_PAGE_ELEMENTS.length]
      : pool[Math.floor(Math.random() * pool.length)];

    boid.targetElem = elem;
    const bounds = elem.getBounds(this.width, this.height);
    boid.box = { ...bounds };

    // Target the top-left handle of the element to begin selection
    boid.targetX = bounds.x;
    boid.targetY = bounds.y;
    boid.state = 'targeting';
    boid.stateTimer = 0;
    boid.editProgress = 0;

    const task = elem.tasks[Math.floor(Math.random() * elem.tasks.length)];
    boid.currentTask = task;
    boid.actionLabel = `${elem.tag} ${task}`;
  }

  triggerBuildStep(filename) {
    const cleanName = filename ? filename.split(/[\/\\]/).pop().replace(/\.[^/.]+$/, '') : 'Component';
    this.active = true;
    this.boids.forEach((boid, idx) => {
      this.assignNewTarget(boid, idx);
      boid.currentTask = `Refactoring <${cleanName}> AST`;
      boid.actionLabel = `<${cleanName}> Applying Impeccable Design tokens`;
      boid.clickRipple = 1.0;
    });
  }

  update() {
    if (!this.active) return;

    this.boids.forEach(boid => {
      boid.stateTimer++;

      // 1. STATE: TARGETING (Flying smoothly to component)
      if (boid.state === 'targeting') {
        const dx = boid.targetX - boid.x;
        const dy = boid.targetY - boid.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 12) {
          // Arrived at element top-left; transition to drag-selecting bounding box
          boid.state = 'selecting';
          boid.stateTimer = 0;
          boid.targetX = boid.box.x + boid.box.w;
          boid.targetY = boid.box.y + boid.box.h;
          boid.clickRipple = 1.0;
        } else {
          boid.vx = (boid.vx + (dx / dist) * 0.7) * 0.88;
          boid.vy = (boid.vy + (dy / dist) * 0.7) * 0.88;
          boid.x += boid.vx;
          boid.y += boid.vy;
        }
      }

      // 2. STATE: SELECTING (Drawing dashed bounding box across element)
      else if (boid.state === 'selecting') {
        const dx = boid.targetX - boid.x;
        const dy = boid.targetY - boid.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 14 || boid.stateTimer > 70) {
          // Box fully selected; transition to editing
          boid.state = 'editing';
          boid.stateTimer = 0;
          boid.editProgress = 0;
          boid.clickRipple = 1.0;
        } else {
          boid.vx = (boid.vx + (dx / dist) * 0.6) * 0.88;
          boid.vy = (boid.vy + (dy / dist) * 0.6) * 0.88;
          boid.x += boid.vx;
          boid.y += boid.vy;
        }
      }

      // 3. STATE: EDITING (Actively modifying element, typing tokens, progress bar advancing)
      else if (boid.state === 'editing') {
        boid.editProgress = Math.min(100, Math.floor((boid.stateTimer / 120) * 100));

        // Subtle micro-movement while typing
        boid.x = boid.box.x + boid.box.w * 0.35 + Math.sin(boid.stateTimer * 0.08) * 8;
        boid.y = boid.box.y + boid.box.h * 0.45 + Math.cos(boid.stateTimer * 0.08) * 6;

        if (boid.stateTimer > 130) {
          // Editing completed
          boid.state = 'completed';
          boid.stateTimer = 0;
          boid.clickRipple = 1.0;
        }
      }

      // 4. STATE: COMPLETED (Flashes success checkmark, then flies to next element)
      else if (boid.state === 'completed') {
        if (boid.stateTimer > 40) {
          this.assignNewTarget(boid);
        }
      }

      // Ripple decay
      if (boid.clickRipple > 0) {
        boid.clickRipple = Math.max(0, boid.clickRipple - 0.04);
      }

      // Caret blink
      boid.caretBlink = (boid.caretBlink + 1) % 50;
    });
  }
}
