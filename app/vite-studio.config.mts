import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"
import checker from "vite-plugin-checker"
import svgr from "vite-plugin-svgr"

// The editor a music studio opens in its own window: one page, relative
// paths so it can sit in any folder, no cloud keys and no analytics.
export default defineConfig({
  base: "./",
  plugins: [
    checker({
      typescript: true,
    }),
    react(),
    svgr({
      include: "**/*.svg",
      svgrOptions: {
        plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
        exportType: "default",
      },
    }),
  ],
  build: {
    outDir: "dist-studio",
    rollupOptions: {
      input: {
        studio: path.resolve(__dirname, "studio.html"),
      },
    },
  },
  publicDir: false,
  resolve: {
    alias: {
      react: path.resolve("../node_modules/react"),
    },
  },
  define: {
    "process.env": {},
  },
})
