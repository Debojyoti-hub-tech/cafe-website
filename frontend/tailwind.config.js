/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cafe: {
          dark: "#1a0f0a",
          brown: "#6b3a2a",
          amber: "#c8882a",
          cream: "#f5ead8",
          light: "#fdf6ee",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
