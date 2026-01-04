import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Her legger vi til dine spesifikke farger fra dokumentet
      colors: {
        brand: {
          dark: "#0f172a",    // Den mørke blåfargen i sidebaren din
          accent: "#3b82f6",  // Den lyseblå knappen
          surface: "#f8fafc", // Bakgrunnsfargen på dashboardet
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
