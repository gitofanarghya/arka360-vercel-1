import { defineConfig } from "vite";
import { createVuePlugin } from "vite-plugin-vue2";
import path from "path";

export default defineConfig({
  plugins: [createVuePlugin()],
  server: {
    port: 8080,
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ],
    // '.vue' extension should not be resolved according to https://vitejs.dev/config/shared-options.html#resolve-extensions
    // extensions: ['.vue', '.js']
  },
  build: {
    chunkSizeWarningLimit: 600,
    cssCodeSplit: false,
  },
  define: {
    // 'process': process,
    // '__dirname': `${__dirname}`,
    "process.env": process.env,
    "process.argv": process.argv,
  },
});
