import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

/**
 * SENDER — configuración de build.
 *
 * `base` es configurable por entorno para que el MISMO árbol funcione en la raíz
 * de un dominio y bajo un subdirectorio (GitHub Pages `/sender-immersive/`) sin
 * tocar una línea de código.
 */
export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE_PATH ?? "/",

  plugins: [react()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    // El preview del workspace llega por un host proxeado: hay que permitirlo.
    allowedHosts: true,
    // Fallback de SPA: cualquier ruta sirve index.html.
    historyApiFallback: true,
  },

  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
    allowedHosts: true,
  },

  build: {
    target: "es2020",
    cssTarget: "chrome100",
    assetsInlineLimit: 2048,
    sourcemap: command === "build" ? false : true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // Three.js no cambia entre despliegues: se separa para cachearlo aparte.
        manualChunks(id) {
          if (id.includes("node_modules/three") || id.includes("@react-three")) {
            return "webgl";
          }
          if (id.includes("node_modules/gsap")) return "motion";
          if (id.includes("node_modules/react")) return "react";
        },
      },
    },
  },

  esbuild: {
    legalComments: "none",
  },
}));
