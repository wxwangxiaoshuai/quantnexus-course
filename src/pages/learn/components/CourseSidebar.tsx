import { BookOutlined, CheckCircleFilled } from "@ant-design/icons";
import { Button, Drawer, Menu, Progress, Tag, Tooltip, Typography } from "antd";
import type { MenuProps } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { COURSE_MODULES } from "../data/courseContent";
import { useLearnProgress } from "../hooks/useLearnProgress";

const { Text } = Typography;

// CourseSidebar sits outside the nested <Routes> in LearnPage, so useParams()
// can't see :moduleId/:lessonId. Parse them from the pathname instead.
function useCurrentLessonParams() {
  const { pathname } = useLocation();
  const match = pathname.match(/^\/learn\/([^/]+)\/([^/]+)/);
  return { moduleId: match?.[1], lessonId: match?.[2] };
}

interface CourseSidebarPanelProps {
  onNavigate?: () => void;
}

function CourseSidebarPanel({ onNavigate }: CourseSidebarPanelProps) {
  const { moduleId, lessonId } = useCurrentLessonParams();
  const navigate = useNavigate();
  const { isComplete, progress } = useLearnProgress();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    if (moduleId) {
      setOpenKeys((prev) => (prev.includes(moduleId) ? prev : [...prev, moduleId]));
    }
  }, [moduleId]);

  const coreModules = COURSE_MODULES.filter((m) => !m.elective && m.id !== "m12" && m.id !== "m13" && m.id !== "m14");
  const totalLessons = coreModules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedCount = progress.completedLessons.filter((id) =>
    coreModules.some((m) => m.lessons.some((l) => l.id === id)),
  ).length;
  const pct = Math.round((completedCount / totalLessons) * 100);

  const items: MenuProps["items"] = COURSE_MODULES.map((mod) => ({
    key: mod.id,
    label: (
      <span style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
        <Tooltip title={`${mod.icon} ${mod.title}`} placement="right" mouseEnterDelay={0.4}>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {mod.icon} {mod.title}
          </span>
        </Tooltip>
        {mod.elective && (
          <Tag
            color="purple"
            style={{ marginInlineEnd: 0, fontSize: 10, lineHeight: "16px", padding: "0 4px", flexShrink: 0 }}
          >
            选修
          </Tag>
        )}
        {mod.id === "m12" || mod.id === "m13" || mod.id === "m14" ? (
          <Tag
            color="orange"
            style={{ marginInlineEnd: 0, fontSize: 10, lineHeight: "16px", padding: "0 4px", flexShrink: 0 }}
          >
            实战
          </Tag>
        ) : null}
      </span>
    ),
    children: mod.lessons.map((lesson) => {
      const done = isComplete(lesson.id);
      return {
        key: `${mod.id}/${lesson.id}`,
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            {done ? (
              <CheckCircleFilled style={{ color: "#16a34a", fontSize: 12, flexShrink: 0 }} />
            ) : (
              <span style={{ width: 12, flexShrink: 0, display: "inline-block" }} />
            )}
            <Tooltip title={lesson.title} placement="right" mouseEnterDelay={0.4}>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 13,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {lesson.title}
              </span>
            </Tooltip>
            <Text type="secondary" style={{ fontSize: 11, flexShrink: 0, whiteSpace: "nowrap" }}>
              {lesson.duration}
            </Text>
          </span>
        ),
      };
    }),
  }));

  const selectedKey = moduleId && lessonId ? `${moduleId}/${lessonId}` : undefined;

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <>
      <div style={{ padding: "16px 16px 8px" }}>
        <div style={{ cursor: "pointer", marginBottom: 12 }} onClick={() => handleNavigate("/")}>
          <Text strong style={{ color: "#1f2937", fontSize: 15 }}>
            📚 量化交易课程
          </Text>
          <div>
            <Text style={{ fontSize: 11, color: "#9ca3af" }}>返回课程介绍</Text>
          </div>
        </div>
        <Progress
          percent={pct}
          size="small"
          strokeColor="#1677ff"
          trailColor="#e5e7eb"
          format={() => (
            <Text style={{ fontSize: 11, color: "#6b7280" }}>
              {completedCount}/{totalLessons}
            </Text>
          )}
        />
        <Button
          type="text"
          icon={<BookOutlined />}
          block
          style={{ color: "#374151", textAlign: "left", marginTop: 8 }}
          onClick={() => handleNavigate("/learn/glossary")}
        >
          术语速查表
        </Button>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        <Menu
          mode="inline"
          selectedKeys={selectedKey ? [selectedKey] : []}
          openKeys={openKeys}
          onOpenChange={(keys) => setOpenKeys(keys as string[])}
          items={items}
          style={{ background: "transparent", border: "none" }}
          onClick={({ key }) => handleNavigate(`/learn/${key}`)}
        />
      </div>
    </>
  );
}

interface CourseSidebarProps {
  variant?: "fixed" | "drawer";
  drawerOpen?: boolean;
  onDrawerClose?: () => void;
}

export function CourseSidebar({ variant = "fixed", drawerOpen = false, onDrawerClose }: CourseSidebarProps) {
  const panel = <CourseSidebarPanel onNavigate={onDrawerClose} />;

  if (variant === "drawer") {
    return (
      <Drawer
        placement="left"
        open={drawerOpen}
        onClose={onDrawerClose}
        width={280}
        styles={{ body: { padding: 0 } }}
        closable={false}
      >
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>{panel}</div>
      </Drawer>
    );
  }

  return <div className="course-sidebar">{panel}</div>;
}
