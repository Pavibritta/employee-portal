import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/hrms",
  server: {
    host: true, // allows LAN access
    port: 5173,
    strictPort: true,
    hmr: {
      // host: "166.62.10.186",
      host: "192.168.1.36:8000", // ✅ use the IP that your browser is using
      protocol: "ws",

      port: 5173,
    },
  },
});
