import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4B7BE5",
        secondary: "#F97316",
        background: "#F9FAFB",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui"],
      },
    },
  },
  plugins: [],
};
export default config;
