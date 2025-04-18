import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "src/content/content-script.js",
          dest: "", // copy to root of dist
        },
        {
          src: "background.js",
          dest: "", // copy to root of dist
        },
        {
          src: "public/manifest.json",
          dest: "", // copy to root of dist
        },
      ],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
});
