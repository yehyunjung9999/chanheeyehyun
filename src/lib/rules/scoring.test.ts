import { describe, expect, it } from 'vitest';
import { computeScore, riskLevel, round2, toRawScore } from './scoring';
import type { AssessmentItem, Score, Settings } from '@/lib/types';

const settings: Settings = {
  term_id: 't', hours_per_credit_general: 3, hours_per_credit_vocational: 2, sessions_per_credit: 16,
  pass_ratio_num: 2, pass_ratio_den: 3, face_to_face_min_hours: 1, prevention_cap_ratio: 0.5, emotional_cap_ratio: 0.5,
  emotional_shared_across_subjects: true, require_reach_judgment: true, risk_danger_below: 40, risk_caution_below: 50,
  absence_warning_ratio: 0.25, ai_monthly_limit_krw: 10000, ai_price_input_per_mtok_krw: null, ai_price_output_per_mtok_krw: null,
};

const item = (id: string, max: number, weight: number): AssessmentItem => ({
  id, subject_id: 's', name: id, kind: 'exam', max_score: max, weight_percent: weight, counts_toward_final: true, sort_order: 0,
});
const score = (itemId: string, value: number): Score => ({ id: itemId, student_id: 'st', assessment_item_id: itemId, score: value, absence_type: null });

describe('점수 규칙 (PRD 12.1)', () => {
  it('S1: 30·40·45점 → 환산 39.00, 원점수 39', () => {
    const items = [item('a', 100, 30), item('b', 100, 30), item('c', 100, 40)];
    const r = computeScore(items, [score('a', 30), score('b', 40), score('c', 45)]);
    expect(r.total).toBe(39);
    expect(r.rawScore).toBe(39);
  });
  it('S2: 39.6 → 40', () => expect(toRawScore(39.6)).toBe(40));
  it('S3: 39.49 → 39', () => expect(toRawScore(39.49)).toBe(39));
  it('S4: 39.5 → 40', () => expect(toRawScore(39.5)).toBe(40));
  it('S5: 200점 만점에 100점, 반영 40% → 환산 20', () => {
    const r = computeScore([item('c', 200, 40)], [score('c', 100)]);
    expect(r.total).toBe(20);
  });
  it('S6: 1회 지필만(30%) 35점 → 예상 원점수 35, 위험', () => {
    const items = [item('a', 100, 30), item('b', 100, 30), item('c', 100, 40)];
    const r = computeScore(items, [score('a', 35)]);
    expect(r.coveredWeight).toBe(30);
    expect(r.projectedRaw).toBe(35);
    expect(r.rawScore).toBeNull();
    expect(riskLevel({ projectedRaw: r.projectedRaw, absences: 0, credits: 5, appliesAchievement: true, settings }).level).toBe('danger');
  });
  it('S7: 예상 45, 결과 0 → 주의', () => {
    expect(riskLevel({ projectedRaw: 45, absences: 0, credits: 5, appliesAchievement: true, settings }).level).toBe('caution');
  });
  it('S8: 예상 70, 5학점(80회), 결과 21 → 위험', () => {
    const r = riskLevel({ projectedRaw: 70, absences: 21, credits: 5, appliesAchievement: true, settings });
    expect(r.level).toBe('danger');
    expect(r.reasons.join()).toContain('결과 21회 > 20회');
  });
  it('S9: 성취율 미적용 과목, 예상 10, 결과 0 → 정상', () => {
    expect(riskLevel({ projectedRaw: 10, absences: 0, credits: 5, appliesAchievement: false, settings }).level).toBe('normal');
  });
  it('round2: 소수 셋째 자리 반올림', () => {
    expect(round2(39.495)).toBe(39.5);
    expect(round2(36.4)).toBe(36.4);
  });
});
