import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // Only inline everything into a single file during production build.
    // In dev mode this plugin interferes with Vite's module serving and
    // causes "text/html" MIME-type errors for .tsx/.ts module imports.
    ...(command === "build" ? [viteSingleFile()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    strictPort: false,
    hmr: {
      protocol: "ws",
    },
    // Proxy API requests to the Flask backend — eliminates CORS entirely
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
}));
