import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14213d",
        brass: "#d4a373",
        cream: "#f8f5f0",
        ember: "#c16630",
        forest: "#275d4d"
      },
      fontFamily: {
        display: ["Georgia", "Times New Roman", "serif"],
        body: ["Trebuchet MS", "Verdana", "sans-serif"]
      },
      boxShadow: {
        card: "0 20px 60px rgba(20, 33, 61, 0.14)"
      },
      backgroundImage: {
        "ballot-glow":
          "radial-gradient(circle at top, rgba(212, 163, 115, 0.26), transparent 38%), linear-gradient(135deg, #f8f5f0 0%, #f3eee5 44%, #fffaf0 100%)"
      }
    }
  },
  plugins: []
};

export default config;
