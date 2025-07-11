// tailwind.config.mjs
export default {
  // Make sure this matches *wherever* you put your JSX/TSX or CSS files:
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',            // App Router pages & layouts
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',        // if your App code lives under src/app
    './components/**/*.{js,ts,jsx,tsx}',         // shared UI components
    './src/components/**/*.{js,ts,jsx,tsx}',     // if you keep them under src/components
    './styles/**/*.{css,scss}',                  // your globals.css, etc.
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [
    // require('tw-animate-css'),                // add if you use it
  ],
}
