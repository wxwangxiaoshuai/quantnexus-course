import { ConfigProvider, Layout, theme } from "antd";
import { useLayoutEffect, useRef } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { CourseSidebar } from "./components/CourseSidebar";
import { GlossaryPage } from "./components/GlossaryPage";
import { HomePanel } from "./components/HomePanel";
import { LessonView } from "./components/LessonView";

export function LearnPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // Reset scroll when switching lessons; otherwise a long previous lesson leaves
  // scrollTop high and the next lesson appears pinned to the bottom.
  useLayoutEffect(() => {
    contentRef.current?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1677ff",
          colorBgLayout: "#f6f8fb",
          colorBgContainer: "#ffffff",
          colorText: "#1f2937",
          colorTextSecondary: "#6b7280",
          colorBorder: "#e5e7eb",
          borderRadius: 6,
        },
      }}
    >
      <Layout hasSider style={{ height: "100vh", background: "#f6f8fb" }}>
        <CourseSidebar />
        <Layout.Content
          ref={contentRef}
          style={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflow: "auto",
            background: "#f6f8fb",
            padding: 0,
          }}
        >
          <Routes>
            <Route index element={<HomePanel />} />
            <Route path="glossary" element={<GlossaryPage />} />
            <Route path=":moduleId/:lessonId" element={<LessonView />} />
          </Routes>
        </Layout.Content>
      </Layout>
    </ConfigProvider>
  );
}
