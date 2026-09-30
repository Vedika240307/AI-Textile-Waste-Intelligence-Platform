/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        moss: {
          50: "#f3f6f0",
          100: "#e3ebd9",
          200: "#c9d9b6",
          300: "#a9c188",
          400: "#88a862",
          500: "#6b8c47",
          600: "#516d36",
          700: "#3f542c",
          800: "#344526",
          900: "#2c3a21",
        },
        clay: {
          50: "#faf6f1",
          100: "#f0e6d8",
          200: "#e0cbaf",
          300: "#cca77e",
          400: "#b9855a",
          500: "#a06a42",
          600: "#835336",
          700: "#67402c",
          800: "#553527",
          900: "#492e23",
        },
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
