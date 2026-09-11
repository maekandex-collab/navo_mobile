/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        colors: {
          blue: {
            DEFAULT: "#003366",
            100: "#60A3E7",
            200: "#5294D7",
            300: "#266BB0",
            400: "#104E8C"
          },
          orange: {
            DEFAULT: "#FF6600",
            100: "#FFC198",
            200: "#FFA970",
            300: "#FF9249",
            400: "#FF8330"
          },
          gray: {
            DEFAULT: "#2F2F2F",
            100: "#DDDDDD",
            200: "#C3C3C3",
            300: "#787878",
            400: "#555555"
          },
          cyan: {
            DEFAULT: "#00ced1",
            light: "#afeeee"
          },
          dark: {
            DEFAULT: "#000",
            light: "#2a2a2a"
          },
          inputBg: "#F3F3F3",
          skyBlue: "#F0F6FF",
          blueLight: "#E1EEFF",
          orangeLight: "#FFE8D9",
          amazonYellow: "#FFC22C",
          amazonGold: "#FFAC1C"
        },
        fontFamily: {
          athin: ["Aeonik-Thin", "sans-serif"],
          alight: ["Aeonik-Light", "sans-serif"],
          aregular: ["Aeonik-Regular", "sans-serif"],
          amedium: ["Aeonik-Medium", "sans-serif"],
          abold: ["Aeonik-Bold", "sans-serif"],
          ablack: ["Aeonik-Black", "sans-serif"],
          rblack: ["Raleway-Black", "sans-serif"],
          rextralight: ["Raleway-ExtraLight", "sans-serif"],
        },
        animation: {
          'spin-fast': 'spin 0.5s linear infinite',
        }
      },
    },
    plugins: [],
  }