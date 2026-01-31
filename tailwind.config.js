/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'deep-void': 'rgb(var(--bg-primary) / <alpha-value>)',
                'neon-cyan': 'rgb(var(--color-primary) / <alpha-value>)',
                'electric-purple': 'rgb(var(--color-secondary) / <alpha-value>)',
                'glass-black': 'rgb(var(--glass-bg) / <alpha-value>)',
                'glass-white': 'rgb(var(--glass-border) / <alpha-value>)',
                'text-main': 'rgb(var(--text-main) / <alpha-value>)',
                'text-muted': 'rgb(var(--text-muted) / <alpha-value>)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
