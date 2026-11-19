/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0E2136',
        ink2: '#1B3A57',
        slate: '#5D7185',
        line: '#E2DDD3',
        paper: '#F7F5F0',
        card: '#FFFFFF',
        gold: '#A98753',
        goldSoft: '#DDC9A6',
        up: '#B4462F',
        down: '#2E6B54',
      },
      fontFamily: {
        serif: ['"Source Han Serif SC"', '"Noto Serif SC"', 'Songti SC', 'SimSun', 'serif'],
        sans: ['"Inter"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(14,33,54,0.04), 0 8px 24px -16px rgba(14,33,54,0.22)',
      },
    },
  },
  plugins: [],
}
