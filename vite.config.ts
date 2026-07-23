import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 课程是纯前端静态站点，无后端 API，无需 proxy。
// base 必须与 GitHub Pages 项目路径一致：https://<user>.github.io/quantnexus-course/
export default defineConfig({
  base: "/quantnexus-course/",
  plugins: [react()],
  server: {
    port: 5180, // 与主项目 5173 错开，便于同时开发
  },
});
