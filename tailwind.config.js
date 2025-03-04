/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        black: "#000000",

        white: "#ffffff",
        solidWhite: "#F4F5FC",

        darkGray: "#757575",
        lightGray: "#D9D9D9",
        darkerGray: "#4C4C4C",
        lunarGray: "#868686",

        red: "#FF0000",

        arcLight: "#CDDEFF",
        blueLight: "#4A78CE",
        blueSerenity: "#4E76CD",
      },
    },
  },
  plugins: [],
};
