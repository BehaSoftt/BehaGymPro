/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                mono: ['"JetBrains Mono"', 'monospace'],
                sans: ['"JetBrains Mono"', 'monospace'],
            },
            colors: {
                primary: '#6366f1', // Indigo
                secondary: '#0f172a', // Slate 900
                accent: '#f43f5e', // Rose 500
            },
            borderRadius: {
                'DEFAULT': '0',
                'sm': '0',
                'md': '0',
                'lg': '0',
                'xl': '0',
                '2xl': '0',
                '3xl': '0',
                'full': '0',
            }
        },
    },
    plugins: [],
}
