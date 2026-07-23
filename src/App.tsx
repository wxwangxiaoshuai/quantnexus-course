import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { LandingPage } from "./pages/landing/LandingPage";
import { LearnPage } from "./pages/learn/LearnPage";

// 公开静态站点：/ 为课程介绍首页，/learn 为学习端。
// basename 跟随 Vite base，保证 GitHub Pages 子路径下路由可用。
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/learn/*" element={<LearnPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
