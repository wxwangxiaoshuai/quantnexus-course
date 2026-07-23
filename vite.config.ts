import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// 课程是纯前端静态站点，无后端 API，无需 proxy。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180, // 与主项目 5173 错开，便于同时开发
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
});
