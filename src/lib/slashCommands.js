/**
 * Kova AI Slash Commands Registry
 * Complete Claude Code & Krikkit commands (/plan, /diff, /code, /wp, /review, /polish, etc.)
 */

export const SLASH_COMMANDS = [
  {
    name: '/plan',
    description: 'Create an architectural implementation plan with <todos> checklist without writing files',
    example: '/plan Add an analytics dashboard with charts and billing toggle',
    category: 'Agent',
    prefixPrompt: 'Create a detailed step-by-step architectural plan with a <todos> checklist for the following feature without writing files: '
  },
  {
    name: '/diff',
    description: 'Switch to Diff Viewer to review recent file modifications',
    example: '/diff',
    category: 'Workbench',
    action: 'open-diff'
  },
  {
    name: '/code',
    description: 'Open the Code Canvas and File Explorer to view or edit files directly',
    example: '/code',
    category: 'Workbench',
    action: 'open-code'
  },
  {
    name: '/preview',
    description: 'Switch back to the interactive live visual preview',
    example: '/preview',
    category: 'Workbench',
    action: 'open-preview'
  },
  {
    name: '/terminal',
    description: 'Toggle the Terminal Drawer to run commands and inspect logs',
    example: '/terminal',
    category: 'Workbench',
    action: 'open-terminal'
  },
  {
    name: '/wp',
    description: 'Open WordPress Headless Bridge to inspect REST/GraphQL endpoints and sync data',
    example: '/wp Sync latest blog posts from WordPress REST API',
    category: 'WordPress',
    action: 'open-wp',
    prefixPrompt: 'Configure headless WordPress REST API integration: '
  },
  {
    name: '/export',
    description: 'Bundle and export the entire Next.js project as a clean ZIP to your Downloads folder',
    example: '/export',
    category: 'Project',
    action: 'export-zip'
  },
  {
    name: '/modularize',
    description: 'Refactor monolithic code into clean modular components in src/components/',
    example: '/modularize Extract Navbar, Hero, and Features into separate components',
    category: 'Refactor',
    prefixPrompt: 'Refactor and modularize the codebase. Split sections into individual files in src/components/ (Navbar, Hero, Features, Pricing, Footer) and keep src/app/page.tsx clean and concise. Details: '
  },
  {
    name: '/review',
    description: 'Audit accessibility (WCAG 2.2 AA), responsiveness, and code quality',
    example: '/review',
    category: 'Quality',
    prefixPrompt: 'Perform a comprehensive code review focusing on: WCAG 2.2 Level AA accessibility, 60-30-10 color balance, mobile breakpoints, and micro-interactions.'
  },
  {
    name: '/polish',
    description: 'Final design pass: spacing, optical alignment, micro-borders, and emerald accents',
    example: '/polish',
    category: 'Design',
    prefixPrompt: 'Execute an Impeccable design polish pass: inspect all margins, padding, optical alignments, contrast ratios, and hover transitions across the page. Eliminate all generic AI design tropes.'
  },
  {
    name: '/critique',
    description: 'Get an actionable UX & design critique with a quality score (1-10)',
    example: '/critique',
    category: 'Design',
    prefixPrompt: 'Perform a comprehensive design & UX critique of the current interface. Score the typography, color hierarchy, user flow, and mobile responsiveness out of 10 and list specific improvements.'
  },
  {
    name: '/bolder',
    description: 'Amplify visuals: punchier typography, stronger contrast, and high-impact layouts',
    example: '/bolder Make hero headline and CTA section bolder',
    category: 'Design',
    prefixPrompt: 'Apply bolder, high-impact design styling: amplify typography scale, increase contrast, make buttons punchier, and add striking visual accents: '
  },
  {
    name: '/quieter',
    description: 'Tone down loud elements for a minimalist, calm, editorial aesthetic',
    example: '/quieter',
    category: 'Design',
    prefixPrompt: 'Refine and quiet the visual presentation: tone down harsh gradients, soften borders, introduce generous whitespace, and create a calm, sophisticated aesthetic.'
  },
  {
    name: '/typeset',
    description: 'Refine typographic hierarchy, letter spacing, font pairings, and line heights',
    example: '/typeset Use modern serif headings with clean body copy',
    category: 'Design',
    prefixPrompt: 'Typeset and refine the typography: apply intentional font pairings, fix heading scale (h1-h4), set proper leading/tracking, and optimize line lengths: '
  },
  {
    name: '/audit',
    description: 'Run automated accessibility (WCAG 2.2 AA) and performance checks',
    example: '/audit',
    category: 'Quality',
    prefixPrompt: 'Audit this project for WCAG 2.2 AA compliance: verify color contrast ratios, aria-labels on icon buttons, keyboard focus rings, semantic landmark tags, and image alt text.'
  },
  {
    name: '/clear',
    description: 'Clear chat conversation history',
    example: '/clear',
    category: 'System',
    action: 'clear-chat'
  },
  {
    name: '/hero',
    description: 'Generate or polish an Impeccable obsidian Hero component',
    example: '/hero Create an AI SaaS Hero with live interactive widget and glow badges',
    category: 'Component',
    prefixPrompt: 'Build an Impeccable Hero component with obsidian dark theme and emerald accent in src/components/Hero.tsx or src/components/landing/kova/KovaHero.tsx: '
  },
  {
    name: '/bento',
    description: 'Generate or customize an interactive 4-card Bento grid for features',
    example: '/bento Add cards for Real-time sync, Security, Multi-model, and Global Edge',
    category: 'Component',
    prefixPrompt: 'Create an interactive 4-card Bento grid for features in src/components/FeatureBento.tsx or src/components/landing/kova/KovaFeatures.tsx: '
  },
  {
    name: '/navbar',
    description: 'Create a floating glassmorphism Navbar with live status pill and CTAs',
    example: '/navbar',
    category: 'Component',
    prefixPrompt: 'Add a floating glassmorphism Navbar with live status pill and CTAs in src/components/landing/kova/KovaNav.tsx: '
  },
  {
    name: '/footer',
    description: 'Create a modern Footer with newsletter signup and social links',
    example: '/footer Add "Made by Kova AI" and legal links',
    category: 'Component',
    prefixPrompt: 'Create a modern Footer with newsletter signup and social links in src/components/landing/kova/KovaFooter.tsx: '
  }
];

export function matchSlashCommands(input) {
  if (!input || !input.startsWith('/')) {
    return [];
  }
  const query = input.slice(1).toLowerCase().trim();
  if (!query) {
    return SLASH_COMMANDS;
  }
  return SLASH_COMMANDS.filter(cmd => 
    cmd.name.slice(1).toLowerCase().startsWith(query) ||
    cmd.description.toLowerCase().includes(query) ||
    cmd.category.toLowerCase().includes(query)
  );
}
