/**
 * Krikkit Lab Constants & Seeds
 */
export const LAB_BTN_PRIMARY =
    'bg-emerald-500 text-white font-medium transition hover:bg-emerald-600 disabled:opacity-40 cursor-pointer shadow-sm'

export const LAB_BTN_FILL =
    'bg-zinc-800 text-white transition hover:bg-zinc-700 disabled:opacity-40 cursor-pointer'

export const LAB_BTN_OUTLINE =
    'border border-white/10 bg-transparent text-zinc-300 transition hover:bg-zinc-800/80 hover:text-white disabled:opacity-40 cursor-pointer'

export const SEEDS = [
    {
        title: 'Quiz App',
        icon: 'quiz',
        prompt: 'Create an interactive quiz application with multiple choice questions. Include a progress bar, timer, score tracking, instant feedback for answers, and a results page showing correct/incorrect answers.',
    },
    {
        title: 'SaaS Landing',
        icon: 'rocket',
        prompt: 'Build a modern SaaS landing page for an AI developer platform. Include a bold hero with CTA, logo cloud, feature bento grid, pricing section, and interactive waitlist form.',
    },
    {
        title: 'Portfolio & Agency',
        icon: 'briefcase',
        prompt: 'Create a clean portfolio site for a creative director or digital agency. Include case study grid with cover cards, about section, skill badges, and contact modal.',
    },
    {
        title: 'Waitlist Page',
        icon: 'sparkles',
        prompt: 'Build a high-converting waitlist landing page for an AI product. Include an email capture form with validation, social proof stats, benefits bento, and FAQ.',
    },
    {
        title: 'Dashboard',
        icon: 'chart',
        prompt: 'Create an analytics dashboard with KPI stat cards, revenue trend chart, recent orders table, and dark mode interface.',
    },
    {
        title: 'E-commerce Shop',
        icon: 'bag',
        prompt: 'Create a modern headless e-commerce storefront with product grid, category filter tabs, interactive shopping bag drawer, and quick checkout flow.',
    },
    {
        title: 'Docs Site',
        icon: 'book',
        prompt: 'Create a developer documentation portal with sticky sidebar navigation, search bar, code blocks with syntax highlighting, and API reference sections.',
    },
    {
        title: 'Pricing Page',
        icon: 'tag',
        prompt: 'Design a clean SaaS pricing page with 3 tiered plans, monthly/annual billing toggle, feature comparison checklist, and highlighted pro plan.',
    }
]

export function pickRandomSeeds(count = 4) {
    const shuffled = [...SEEDS].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}
