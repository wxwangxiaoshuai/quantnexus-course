import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { CurriculumPage } from "./pages/CurriculumPage";
import { ModulePage } from "./pages/ModulePage";
import { LessonPage } from "./pages/LessonPage";
import { ProjectPage } from "./pages/ProjectPage";
import { RoadmapPage } from "./pages/RoadmapPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { GlossaryPage } from "./pages/GlossaryPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LearnIndexRedirect, LearnLessonRedirect } from "./pages/LearnRedirect";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "curriculum", element: <CurriculumPage /> },
      { path: "curriculum/:moduleId", element: <ModulePage /> },
      { path: "curriculum/:moduleId/:lessonId", element: <LessonPage /> },
      { path: "curriculum/:moduleId/project/:projectId", element: <ProjectPage /> },
      { path: "roadmap", element: <RoadmapPage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "glossary", element: <GlossaryPage /> },
      { path: "learn/glossary", element: <Navigate to="/glossary" replace /> },
      { path: "learn/:moduleId/:lessonId", element: <LearnLessonRedirect /> },
      { path: "learn/*", element: <LearnIndexRedirect /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
