// 점수·위험군 규칙 (주인: 파트 A, PRD 제2부 4.2·4.3). 숫자 기준은 settings에서 받는다.
import type { AssessmentItem, RiskLevel, Score, Settings } from '@/lib/types';

const fmt = (n: number) => String(Math.round(n * 10) / 10);

// 소수 셋째 자리에서 반올림해 둘째 자리까지(나이스 성적일람표 합계).
export function round2(x: number): number {
  return Math.round(x * 100 + 1e-7) / 100;
}

// 합계를 소수 첫째 자리에서 반올림한 정수(나이스 원점수). 대상 판정은 이 값으로 한다.
export function toRawScore(total: number): number {
  return Math.floor(round2(total) + 0.5 + 1e-9);
}

// 한 학생의 한 과목 점수 계산. scores는 그 학생 것만 넘긴다.
export function computeScore(items: AssessmentItem[], scores: Score[]) {
  const finalItems = items.filter((i) => i.counts_toward_final && i.weight_percent > 0);
  const totalWeight = finalItems.reduce((s, i) => s + Number(i.weight_percent), 0);
  let sum = 0;
  let coveredWeight = 0;
  for (const item of finalItems) {
    const score = scores.find((s) => s.assessment_item_id === item.id);
    if (!score || score.score == null) continue;
    sum += (Number(score.score) / Number(item.max_score)) * Number(item.weight_percent);
    coveredWeight += Number(item.weight_percent);
  }
  const total = round2(sum);
  const complete = finalItems.length > 0 && Math.abs(coveredWeight - totalWeight) < 1e-9;
  return {
    total,
    rawScore: complete ? toRawScore(total) : null,
    projectedRaw: coveredWeight > 0 ? toRawScore((sum / coveredWeight) * 100) : null,
    coveredWeight,
  };
}

export function sessionsOf(credits: number, settings: Settings) {
  return Number(credits) * Number(settings.sessions_per_credit);
}

export function riskLevel(args: {
  projectedRaw: number | null;
  absences: number;
  credits: number;
  appliesAchievement: boolean;
  settings: Settings;
}): { level: RiskLevel; reasons: string[] } {
  const { projectedRaw, absences, credits, appliesAchievement, settings } = args;
  const limit = sessionsOf(credits, settings) * Number(settings.absence_warning_ratio);
  const reasons: string[] = [];
  let level: RiskLevel = 'normal';
  if (appliesAchievement) {
    if (projectedRaw != null && projectedRaw < settings.risk_danger_below) {
      level = 'danger';
      reasons.push(`예상 원점수 ${projectedRaw}`);
    } else if (projectedRaw != null && projectedRaw < settings.risk_caution_below) {
      level = 'caution';
      reasons.push(`예상 원점수 ${projectedRaw}`);
    }
  } else {
    reasons.push('성취율 기준 미적용 과목');
  }
  if (absences > limit) {
    level = 'danger';
    reasons.push(`결과 ${fmt(absences)}회 > ${fmt(limit)}회`);
  }
  return { level, reasons };
}

// 출석률 2/3 미달(= 결과 횟수가 수업 횟수의 1/3 초과) 여부.
export function attendanceShort(absences: number, credits: number, settings: Settings) {
  const sessions = sessionsOf(credits, settings);
  return (sessions - absences) * 3 < sessions * 2;
}
