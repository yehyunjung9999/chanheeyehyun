import { EmptyState, PageHeader } from './ui';

// 파트 0 소유. 아직 만들지 않은 화면 자리.
export function ComingSoon({ group, title, part, code }: { group: string; title: string; part: 'A' | 'B'; code: string }) {
  return (
    <>
      <PageHeader group={group} title={title} />
      <EmptyState title="준비 중인 화면이에요">
        <span className="hint">
          파트 {part}({code})에서 만들어요. 화면 모양은 docs/mockup/index.html을 기준으로 해요.
        </span>
      </EmptyState>
    </>
  );
}
