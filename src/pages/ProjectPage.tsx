import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { curriculum } from "../data/curriculum";
import { DifficultyBadge, Tag } from "../components/Badges";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

export function ProjectPage() {
  const { moduleId, projectId } = useParams<{ moduleId: string; projectId: string }>();
  const module = curriculum.modules.find((m) => m.id === Number(moduleId));
  const project = module?.project;

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!moduleId || !projectId) return;
    const moduleNum = String(moduleId).padStart(2, "0");
    import(`../content/module-${moduleNum}/project-${projectId.toLowerCase()}.md?raw`)
      .then((m) => {
        setContent((m as { default: string }).default || "");
        setLoading(false);
      })
      .catch(() => {
        setContent("");
        setLoading(false);
      });
  }, [moduleId, projectId]);

  if (!module || !project || project.id !== projectId) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-ink-400">未找到该项目。</p>
        <Link to="/projects" className="btn-ghost mt-6">
          返回项目列表
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-ink-500">
        <Link to="/projects" className="hover:text-ink-200">
          实战项目
        </Link>
        <span>/</span>
        <Link to={`/curriculum/${module.id}`} className="hover:text-ink-200">
          {module.title}
        </Link>
        <span>/</span>
        <span className="text-ink-300">{project.title}</span>
      </nav>

      <div className="card relative overflow-hidden border-amber-500/30 p-6 sm:p-8">
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs text-amber-400">{project.id}</span>
            <DifficultyBadge level={project.difficulty} />
            <span className="text-xs text-ink-500">模块 {module.id}</span>
          </div>
          <h1 className="mt-3 text-2xl font-extrabold text-ink-50 sm:text-3xl">{project.title}</h1>
          <p className="mt-2 text-ink-400">{project.summary}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink-100">交付物</h2>
        <ul className="space-y-2">
          {project.deliverables.map((d) => (
            <li key={d} className="flex gap-2 text-sm text-ink-300">
              <span className="text-amber-400">✓</span>
              {d}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="card p-8 text-center text-ink-500">加载项目说明...</div>
        ) : (
          <MarkdownRenderer content={content} />
        )}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to={`/curriculum/${module.id}`} className="btn-ghost">
          ← 返回模块
        </Link>
        <Link to={`/curriculum/${module.id}/${module.lessons[0].id}`} className="btn-primary">
          从本模块第一课开始
        </Link>
      </div>
    </div>
  );
}
