/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ghana: {
          red: "#CE1126",
          yellow: "#FCD116",
          green: {
            DEFAULT: "#075E54",
            light: "#128C7E",
            dark: "#054C44",
          },
          black: "#000000",
        },
        dark: {
          bg: {
            primary: "#121212",
            secondary: "#1E1E1E",
            tertiary: "#2D2D2D",
          },
          text: {
            primary: "#FFFFFF",
            secondary: "#E0E0E0",
            tertiary: "#BDBDBD",
          },
          border: "#3D3D3D",
        },
        highContrast: {
          light: {
            bg: "#FFFFFF",
            text: "#000000",
          },
          dark: {
            bg: "#000000",
            text: "#FFFFFF",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
