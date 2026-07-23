import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-4xl font-bold text-ink-50">404</h1>
      <p className="mt-3 text-ink-400">页面不存在</p>
      <Link to="/" className="btn-primary mt-8 inline-flex">
        返回首页
      </Link>
    </div>
  );
}
