import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="card empty">
      <b>페이지를 찾을 수 없어요.</b>
      <Link className="btn" href="/dashboard">
        전교 현황으로 가기
      </Link>
    </div>
  );
}
