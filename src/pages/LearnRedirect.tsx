import { Navigate, useLocation, useParams } from "react-router-dom";
import { LEGACY_LESSON_ID_MAP, curriculum } from "../data/curriculum";

/** 旧 /learn/:moduleId/:lessonId → 新 curriculum 路径 */
export function LearnLessonRedirect() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const modNum = Number(String(moduleId ?? "").replace(/^m/, ""));
  const newLessonId = lessonId ? LEGACY_LESSON_ID_MAP[lessonId] : undefined;
  if (modNum && newLessonId) {
    return <Navigate to={`/curriculum/${modNum}/${newLessonId}`} replace />;
  }
  if (modNum && curriculum.modules.some((m) => m.id === modNum)) {
    return <Navigate to={`/curriculum/${modNum}`} replace />;
  }
  return <Navigate to="/curriculum" replace />;
}

export function LearnIndexRedirect() {
  const { pathname } = useLocation();
  if (pathname.includes("glossary")) return <Navigate to="/glossary" replace />;
  return <Navigate to="/curriculum" replace />;
}
