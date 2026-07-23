import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { LearnPage } from "./pages/learn/LearnPage";

// 课程是公开静态站点，无鉴权。所有路由直接指向 LearnPage。
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/learn/*" element={<LearnPage />} />
        <Route path="*" element={<Navigate to="/learn" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
