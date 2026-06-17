import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
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
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm:      'var(--radius-sm)',
        lg:      'var(--radius-lg)',
      },
      fontFamily: {
        jakarta: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
