/** @type {import('tailwindcss').Config} */
import tailwindAnimate from "tailwindcss-animate";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        main: "#FD9745",
        mainAccent: "#fc7303", // not needed for shadcn components
        overlay: "rgba(0,0,0,0.8)",

        // light mode
        bg: "#fff4e0",
        text: "#000",
        border: "#000",

        // dark mode
        darkBg: "#272933",
        darkText: "#eeefe9",
        darkBorder: "#000",
        secondaryBlack: "#212121", // opposite of plain white, not used pitch black because borders and box-shadows are that color
      },
      borderRadius: {
        base: "5px",
      },
      boxShadow: {
        light: "4px 4px 0px 0px #000",
        dark: "4px 4px 0px 0px #000",
      },
      translate: {
        boxShadowX: "4px",
        boxShadowY: "4px",
        reverseBoxShadowX: "-4px",
        reverseBoxShadowY: "-4px",
      },
      fontWeight: {
        base: "500",
        heading: "700",
      },
      screens: {
        w450: { raw: "(max-width: 450px)" },
      },
      animation: {
        marquee: "marquee 5s linear infinite",
        marquee2: "marquee2 5s linear infinite",
      },
      screens: {
        smallHeight: { raw: "(max-height: 550px)" },
        w800: { max: "800px" },
        w700: { max: "700px" },
        w600: { max: "600px" },
        w500: { max: "500px" },
        w450: { max: "450px" },
        w400: { max: "400px" },
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        marquee2: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [tailwindAnimate],
};