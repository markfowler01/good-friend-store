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
        background: "var(--background)",
        foreground: "var(--foreground)",
        bca: {
          teal: "#0bb4aa",
          "teal-hover": "#076c65",
          dark: "#101010",
          light: "#f9fafd",
          footer: "#272528",
          "footer-border": "#464348",
          blue: "#4176FB",
          brown: "#d19731",
          red: "#e1051e",
          accent: "#CD4419",
          "accent-hover": "#b33a15",
          "accent-tint": "#fdeee8",
        },
      },
      fontFamily: {
        body: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-onest)", "sans-serif"],
        nav: ["var(--font-montserrat)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
