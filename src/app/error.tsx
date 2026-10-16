'use client';

// 파트 0 소유. 오류 상세(서버 경로 등)는 보여 주지 않는다(dorms-check info.stack-trace).
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card empty">
      <b>문제가 생겨서 화면을 열지 못했어요.</b>
      <span className="hint">잠시 뒤 다시 시도해 주세요. 계속되면 담당 선생님께 알려 주세요.</span>
      <button className="btn primary" onClick={() => reset()}>
        다시 시도
      </button>
    </div>
  );
}
