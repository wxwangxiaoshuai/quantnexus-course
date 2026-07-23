import { MenuOutlined } from "@ant-design/icons";
import { ConfigProvider, Grid, Layout, theme, Typography } from "antd";
import { useLayoutEffect, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { CourseSidebar } from "./components/CourseSidebar";
import { GlossaryPage } from "./components/GlossaryPage";
import { HomePanel } from "./components/HomePanel";
import { LessonView } from "./components/LessonView";
import "./LearnPage.css";

const { Text } = Typography;

export function LearnPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Reset scroll when switching lessons; otherwise a long previous lesson leaves
  // scrollTop high and the next lesson appears pinned to the bottom.
  useLayoutEffect(() => {
    contentRef.current?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [pathname]);

  useLayoutEffect(() => {
    setDrawerOpen(false);
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
      <Layout
        hasSider={!isMobile}
        style={{ height: "100vh", background: "#f6f8fb", flexDirection: isMobile ? "column" : "row" }}
      >
        {!isMobile && <CourseSidebar />}
        {isMobile && (
          <>
            <header className="learn-mobile-header">
              <button
                type="button"
                aria-label="打开课程目录"
                onClick={() => setDrawerOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#1f2937",
                  fontSize: 18,
                  borderRadius: 6,
                }}
              >
                <MenuOutlined />
              </button>
              <Text strong style={{ color: "#1f2937", fontSize: 15 }}>
                📚 量化交易课程
              </Text>
            </header>
            <CourseSidebar variant="drawer" drawerOpen={drawerOpen} onDrawerClose={() => setDrawerOpen(false)} />
          </>
        )}
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
