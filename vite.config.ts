import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import VitePluginLinter from "vite-plugin-linter";

const { linterPlugin, TypeScriptLinter } = VitePluginLinter;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    linterPlugin({
      include: ["./src/**/*.ts", "./src/**/*.tsx"],
      linters: [new TypeScriptLinter()],
    }),
  ],
});
