'use client';
import { useRoster } from './RosterProvider';

// 파트 0 소유. 학생은 반드시 이 컴포넌트로 표시한다. 명렬표가 있으면 "학번 이름", 없으면 학번만.
export function StudentName({ studentNo }: { studentNo: string }) {
  const { roster } = useRoster();
  const name = roster[studentNo];
  return (
    <span>
      <span className="sno">{studentNo}</span>
      {name ? ` ${name}` : null}
    </span>
  );
}

// 인쇄물처럼 이름만 따로 필요할 때(없으면 빈 칸)
export function StudentNameOnly({ studentNo }: { studentNo: string }) {
  const { roster } = useRoster();
  return <>{roster[studentNo] ?? ''}</>;
}
