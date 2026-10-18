import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container empty-state">
      <span className="eyebrow">404</span>
      <h1>페이지를 찾을 수 없습니다.</h1>
      <Link href="/" className="button primary">
        HOME으로 돌아가기
      </Link>
    </div>
  );
}
