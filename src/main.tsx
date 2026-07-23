import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { ThemeProvider } from "./components/ThemeProvider";
import { routes } from "./router";
import "katex/dist/katex.min.css";
import "./index.css";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

const router = createBrowserRouter(routes, {
  basename: basename || undefined,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: "#2ec4a6",
            borderRadius: 6,
          },
        }}
      >
        <RouterProvider router={router} />
      </ConfigProvider>
    </ThemeProvider>
  </StrictMode>,
);
