/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        // Fíjate que quité el "/src" de estas rutas:
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                mate: {
                    primary: '#8B4513',
                    secondary: '#D2691E',
                    accent: '#F4A460',
                    bg: '#FAF3E0',
                    text: '#2D1B0E',
                }
            },
            backgroundImage: {
                'cuero': "url('/fondo-cuero.png')",
            }
        },
    },
    plugins: [],
};