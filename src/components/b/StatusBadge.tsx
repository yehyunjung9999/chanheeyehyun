import type { Progress } from '@/lib/rules/hours';

export function StatusBadge({ p }: { p: Progress | null }) {
  if (!p) return <span className="badge neutral">계산 불가</span>;
  if (p.substituted) return <span className="badge info">대체 이수 가능</span>;
  if (p.completable) return <span className="badge ok">이수 가능</span>;
  return <span className="badge danger">아직 불가</span>;
}

export function WarnList({ p }: { p: Progress | null }) {
  if (!p?.warnings.length) return null;
  return (
    <ul className="warnlist">
      {p.warnings.map((w) => (
        <li key={w.text} className={w.soft ? 'soft' : undefined}>{w.text}</li>
      ))}
    </ul>
  );
}
