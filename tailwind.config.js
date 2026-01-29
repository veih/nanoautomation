/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Garanta que estes caminhos cobrem todos os seus arquivos .js, .ts, .jsx, .tsx onde você usa classes Tailwind
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Se você também tem uma pasta 'app'
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Se você tem uma pasta 'src'
  ],
  theme: {
    extend: {
      // ... suas extensões de tema (cores, fontes, etc.)
    },
  },
  plugins: [],
};