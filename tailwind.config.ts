import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Store dark theme
        bg:             'var(--bg)',
        surface:        'var(--surface)',
        header:         'var(--header)',
        'header-muted': 'var(--header-muted)',
        gold:           'var(--gold)',
        'gold-mid':     'var(--gold-mid)',
        'gold-light':   'var(--gold-light)',
        border:         'var(--border)',
        primary:        'var(--text-primary)',
        muted:          'var(--text-muted)',
        faint:          'var(--text-faint)',
        error:          'var(--error)',
        success:        'var(--success)',
        // Store light theme
        warm:           'var(--bg-warm)',
        'warm-surface': 'var(--surface-warm)',
        ink:            'var(--ink)',
        'ink-muted':    'var(--ink-muted)',
        'ink-faint':    'var(--ink-faint)',
        'border-warm':  'var(--border-warm)',
        // Admin UI v2 design tokens (scoped to .admin-root)
        background:     'var(--background)',
        foreground:     'var(--foreground)',
        card:           'var(--card)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm:      'var(--radius-sm)',
        lg:      'var(--radius-lg)',
        xl:      'var(--radius-xl)',
      },
      fontFamily: {
        jakarta: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        // Admin UI v2 fonts
        body:    ['var(--font-figtree)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-onest)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
