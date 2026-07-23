import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { LearnPage } from "./pages/learn/LearnPage";

// 课程是公开静态站点，无鉴权。所有路由直接指向 LearnPage。
// basename 跟随 Vite base，保证 GitHub Pages 子路径下路由可用。
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/learn/*" element={<LearnPage />} />
        <Route path="*" element={<Navigate to="/learn" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
