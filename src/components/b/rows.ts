import type { ProgressRow } from '@/lib/b/data';
import type { Progress } from '@/lib/rules/hours';
import { KIND_LABEL, type CompletionResultValue, type ReachJudgment, type TargetKind } from '@/lib/types';

// 서버 → 화면으로 넘기는 한 줄(학번만, 이름 없음)
export type RowView = {
  targetId: string;
  studentNo: string;
  subjectName: string;
  kind: TargetKind;
  kindLabel: string;
  progress: Progress | null;
  reach: ReachJudgment | null;
  result: CompletionResultValue;
  committeeDate: string | null;
  consent: boolean;
  reason: string;
};

export function toView(r: ProgressRow): RowView {
  return {
    targetId: r.target.id,
    studentNo: r.studentNo,
    subjectName: r.subject?.name ?? '창의적 체험활동',
    kind: r.target.kind,
    kindLabel: KIND_LABEL[r.target.kind],
    progress: r.progress,
    reach: r.completion?.reach_judgment ?? null,
    result: r.completion?.result ?? 'pending',
    committeeDate: r.completion?.committee_date ?? null,
    consent: r.target.consent_received,
    reason: r.target.reason,
  };
}

/** 생기부 처리 문구(PRD 4.7) */
export function recordText(v: RowView) {
  if (v.result === 'passed') return v.kind === 'remedial' ? '성취도 E · 비고 적지 않음' : '원래 성취도 · 비고 적지 않음';
  if (v.result === 'failed') return '비고: 미이수';
  return '—';
}

export const fmt = (n: number) => String(Math.round(n * 10) / 10);
