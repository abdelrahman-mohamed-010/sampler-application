/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: "#05445E",
        primary: "#189AB4",
      },
    },
  },
  plugins: [],
};
