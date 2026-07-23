import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/quantnexus-course/",
  plugins: [react()],
  server: {
    port: 5180,
  },
});
