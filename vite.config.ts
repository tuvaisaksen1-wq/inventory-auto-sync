import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 5173,
    // Denne linjen fikser "Blocked request" feilen for godt
    allowedHosts: [".trycloudflare.com"], 
  },
  plugins: [reactRouter(), tsconfigPaths()],
});