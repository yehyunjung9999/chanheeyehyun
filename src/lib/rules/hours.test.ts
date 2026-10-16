// 시수 규칙 테스트: PRD 12.2(H1~H13)와 목업 예시 대상자 6명
import { describe, expect, it } from 'vitest';
import { computeProgress, requiredHours } from './hours';
import type {
  AttendanceStatus, CompletionResult, GuidanceTarget, Session, SessionAttendance,
  SessionKind, SessionMethod, Settings, Student, Subject, TargetKind,
} from '@/lib/types';

const settings: Settings = {
  term_id: 't1', hours_per_credit_general: 3, hours_per_credit_vocational: 2, sessions_per_credit: 16,
  pass_ratio_num: 2, pass_ratio_den: 3, face_to_face_min_hours: 1,
  prevention_cap_ratio: 0.5, emotional_cap_ratio: 0.5, emotional_shared_across_subjects: true,
  require_reach_judgment: true, risk_danger_below: 40, risk_caution_below: 50, absence_warning_ratio: 0.25,
  ai_monthly_limit_krw: 10000, ai_price_input_per_mtok_krw: null, ai_price_output_per_mtok_krw: null,
};
const subj = (id: string, name: string, credits: number, category: Subject['category'], override: number | null): Subject => ({
  id, term_id: 't1', name, grade: 1, department: null, credits, category, grading_scale: 'five',
  applies_achievement_rule: true, required_hours_override: override, teacher_id: null,
});
const SUBJ = {
  kor: subj('kor', '공통국어2', 5, 'common', 15),
  math: subj('math', '공통수학2', 5, 'common', 15),
  eng: subj('eng', '공통영어2', 5, 'common', 15),
  pet: subj('pet', '반려동물관리', 9, 'vocational', null),
};
const student = (no: string, extra: Partial<Student> = {}): Student => ({
  id: no, school_year: 2026, student_no: no, grade: 1, class_no: 1, number: 1, department: null,
  special_handling: 'none', alt_program_done: false, ...extra,
});
const target = (no: string, subject: Subject | null, kind: TargetKind = 'remedial'): GuidanceTarget => ({
  id: `g-${no}`, term_id: 't1', student_id: no, subject_id: subject?.id ?? null, kind, status: 'confirmed',
  reason: '', projected_score: null, excluded_reason: null, consent_received: true,
  checked_by: null, checked_at: null, confirmed_by: null, confirmed_at: null,
});
const reach = (r: 'reached' | 'not_reached' | null): CompletionResult => ({
  id: 'c', target_id: 'g', reach_judgment: r, reach_method: null, retest_score: null,
  result: 'pending', committee_date: null, decided_by: null, decided_at: null, neis_done: false,
});

type Log = { id?: string; subject: string | null; kind: SessionKind; method: SessionMethod; hours: number; att: Record<string, AttendanceStatus> };
let seq = 0;
function build(logs: Log[]) {
  const sessions: Session[] = [];
  const attendance: SessionAttendance[] = [];
  const emotionalCommon: { session: Session; att: SessionAttendance }[] = [];
  for (const l of logs) {
    const session: Session = {
      id: l.id ?? `s${++seq}`, term_id: 't1', subject_id: l.subject, kind: l.kind, method: l.method,
      held_on: '2026-07-01', period_label: '', hours: l.hours, content: '', teacher_id: null,
    };
    for (const [no, status] of Object.entries(l.att)) {
      const att: SessionAttendance = { session_id: session.id, student_id: no, status, credited_hours: status === 'absent' ? 0 : l.hours };
      if (l.kind === 'emotional_common') emotionalCommon.push({ session, att });
      else attendance.push(att);
    }
    if (l.kind !== 'emotional_common') sessions.push(session);
  }
  return { sessions, attendance, emotionalCommon };
}

const ME = '10305';
const one = (subject: string | null, kind: SessionKind, method: SessionMethod, hours: number, status: AttendanceStatus = 'present'): Log =>
  ({ subject, kind, method, hours, att: { [ME]: status } });

function run(opts: {
  logs: Log[]; subject?: Subject; kind?: TargetKind; reached?: 'reached' | 'not_reached' | null;
  s?: Partial<Settings>; st?: Partial<Student>;
}) {
  const subject = opts.subject ?? SUBJ.kor;
  const r = computeProgress({
    target: target(ME, subject, opts.kind), subject, student: student(ME, opts.st),
    ...build(opts.logs), settings: { ...settings, ...opts.s },
    completion: opts.reached === undefined ? null : reach(opts.reached),
  });
  if (!r) throw new Error('결과가 null');
  return r;
}
const texts = (r: { warnings: { text: string }[] }) => r.warnings.map((w) => w.text);

describe('시수 규칙 (PRD 12.2)', () => {
  it('H1: 공통국어2 필요 15, 기준 10', () => {
    expect(requiredHours(SUBJ.kor, settings)).toBe(15);
    const r = run({ logs: [] });
    expect([r.required, r.needToPass]).toEqual([15, 10]);
  });

  it('H2: 대면 2 + 과제 3 + 예방 9 + 정서 6, 도달 → 인정 18.5, 이수 가능', () => {
    const r = run({
      reached: 'reached',
      logs: [
        one('kor', 'remedial', 'face_to_face', 2), one('kor', 'remedial', 'assignment', 3),
        one('kor', 'prevention', 'face_to_face', 9), one(null, 'emotional_common', 'emotional', 6),
      ],
    });
    expect([r.preventionCredited, r.emotionalCredited, r.credited]).toEqual([7.5, 6, 18.5]);
    expect(r.completable).toBe(true);
    expect(r.warnings).toContainEqual({ text: '예방지도는 한도 7.5시수까지만 인정됩니다.', soft: true });
  });

  it('H3: 예방 7.5 + 정서 6, 보충 없음 → 대면 0이라 불가', () => {
    const r = run({ reached: 'reached', logs: [one('kor', 'prevention', 'face_to_face', 7.5), one(null, 'emotional_common', 'emotional', 6)] });
    expect(r.credited).toBe(13.5);
    expect(r.ratioOk).toBe(true);
    expect(r.completable).toBe(false);
    expect(texts(r)).toContain('대면지도 시수가 없습니다(1시수 이상 필요).');
  });

  it('H4: 대면 1 + 과제 8, 도달 → 9 < 10, 남은 1', () => {
    const r = run({ reached: 'reached', logs: [one('kor', 'remedial', 'face_to_face', 1), one('kor', 'remedial', 'assignment', 8)] });
    expect([r.credited, r.remainingToPass]).toEqual([9, 1]);
    expect(r.completable).toBe(false);
    expect(texts(r)).toContain('이수 기준까지 1시수 남았습니다.');
  });

  const h5 = () => [one('kor', 'remedial', 'face_to_face', 1), one('kor', 'remedial', 'assignment', 9)];
  it('H5: 대면 1 + 과제 9, 미도달 → 불가', () => {
    const r = run({ reached: 'not_reached', logs: h5() });
    expect(r.reachOk).toBe(false);
    expect(r.completable).toBe(false);
    expect(texts(r)).toContain('도달 판정이 미도달입니다.');
  });

  it('H6: H5 + 도달 판정 필수 끔 → 이수 가능', () => {
    expect(run({ reached: 'not_reached', logs: h5(), s: { require_reach_judgment: false } }).completable).toBe(true);
  });

  it('도달 판정 미입력이면 입력 요청 경고', () => {
    expect(texts(run({ logs: h5() }))).toContain('도달 판정을 입력해 주세요.');
  });

  it('H7: 반려동물관리 9학점 전문 → 필요 18, 기준 12', () => {
    const r = run({ subject: SUBJ.pet, logs: [] });
    expect([r.required, r.needToPass]).toEqual([18, 12]);
  });

  it('H8: substitutable + 대체 이수 → 이수 가능', () => {
    const r = run({ logs: [], st: { special_handling: 'substitutable', alt_program_done: true } });
    expect(r.substituted).toBe(true);
    expect(r.completable).toBe(true);
    expect(r.warnings).toEqual([]);
  });

  it('H9: 정서 6이 두 과목에 모두 인정', () => {
    const logs = [one(null, 'emotional_common', 'emotional', 6)];
    expect(run({ logs }).emotionalCredited).toBe(6);
    expect(run({ logs, subject: SUBJ.math }).emotionalCredited).toBe(6);
  });

  it('H10: 정서 중복 인정 끔 → 학교 공통 정서 인정 안 함', () => {
    const r = run({ logs: [one(null, 'emotional_common', 'emotional', 6)], s: { emotional_shared_across_subjects: false } });
    expect(r.emotionalCredited).toBe(0);
  });

  it('H11: 결석한 일지 → 0시수', () => {
    const r = run({ logs: [one('kor', 'remedial', 'face_to_face', 2, 'absent')] });
    expect([r.direct, r.faceToFace]).toEqual([0, 0]);
  });

  it('H12: 0.5시수 일지 3회 출석 → 직접 1.5', () => {
    const log = () => one('kor', 'remedial', 'assignment', 0.5);
    expect(run({ logs: [log(), log(), log()] }).direct).toBe(1.5);
  });

  it('H13: 추가 학습 대면 2 + 과제 4 + 정서 6 → 이수 가능', () => {
    const r = run({
      kind: 'attendance',
      logs: [one('kor', 'attendance', 'face_to_face', 2), one('kor', 'attendance', 'assignment', 4), one(null, 'emotional_common', 'emotional', 6)],
    });
    expect(r.credited).toBe(12);
    expect(r.reachNeeded).toBe(false);
    expect(r.completable).toBe(true);
  });

  it('과목 없는 대상(창체)은 null', () => {
    expect(computeProgress({
      target: target(ME, null, 'creative_attendance'), subject: null, student: student(ME),
      sessions: [], attendance: [], emotionalCommon: [], settings, completion: null,
    })).toBeNull();
  });
});

describe('목업 예시 대상자 6명 (seed.sql과 같은 일지)', () => {
  const data = build([
    { id: 's1', subject: 'kor', kind: 'prevention', method: 'face_to_face', hours: 3, att: { '10103': 'present', '10115': 'present', '10107': 'present' } },
    { id: 's2', subject: 'kor', kind: 'prevention', method: 'assignment', hours: 3, att: { '10103': 'present', '10115': 'absent' } },
    { id: 's3', subject: 'kor', kind: 'prevention', method: 'online_content', hours: 3, att: { '10103': 'present', '10115': 'present' } },
    { id: 's4', subject: 'kor', kind: 'remedial', method: 'face_to_face', hours: 2, att: { '10103': 'present', '10115': 'present' } },
    { id: 's5', subject: 'kor', kind: 'remedial', method: 'assignment', hours: 3, att: { '10103': 'present', '10115': 'absent' } },
    { id: 's6', subject: 'math', kind: 'remedial', method: 'online_content', hours: 4, att: { '10207': 'present' } },
    { id: 's7', subject: 'math', kind: 'prevention', method: 'after_school', hours: 4, att: { '10207': 'present' } },
    { id: 's8', subject: 'math', kind: 'attendance', method: 'face_to_face', hours: 2, att: { '10204': 'present' } },
    { id: 's9', subject: 'math', kind: 'attendance', method: 'assignment', hours: 4, att: { '10204': 'present' } },
    { id: 's10', subject: 'pet', kind: 'remedial', method: 'face_to_face', hours: 2, att: { '10312': 'present' } },
    { id: 's11', subject: 'pet', kind: 'remedial', method: 'in_class', hours: 6, att: { '10312': 'present' } },
    { id: 'e1', subject: null, kind: 'emotional_common', method: 'emotional', hours: 6, att: { '10103': 'present', '10207': 'present', '10204': 'present', '10312': 'present', '10115': 'absent' } },
  ]);
  const calc = (no: string, subject: Subject, kind: TargetKind, r: 'reached' | null, st?: Partial<Student>) =>
    computeProgress({ target: target(no, subject, kind), subject, student: student(no, st), ...data, settings, completion: r ? reach(r) : null })!;

  it('10103 국어: 직접 5 + 예방 7.5(9 중) + 정서 6 = 18.5 → 이수 가능', () => {
    const r = calc('10103', SUBJ.kor, 'remedial', 'reached');
    expect([r.direct, r.prevention, r.preventionCredited, r.emotionalCredited, r.credited]).toEqual([5, 9, 7.5, 6, 18.5]);
    expect(r.completable).toBe(true);
  });
  it('10115 국어: 직접 2 + 예방 6 = 8, 2시수 남음', () => {
    const r = calc('10115', SUBJ.kor, 'remedial', null);
    expect([r.credited, r.remainingToPass]).toEqual([8, 2]);
  });
  it('10207 수학: 14시수지만 대면 없음 → 불가', () => {
    const r = calc('10207', SUBJ.math, 'remedial', null);
    expect(r.credited).toBe(14);
    expect(r.faceToFaceOk).toBe(false);
  });
  it('10312 반려동물: 14 ≥ 12, 도달 판정만 남음', () => {
    const r = calc('10312', SUBJ.pet, 'remedial', null);
    expect(r.credited).toBe(14);
    expect(texts(r)).toEqual(['도달 판정을 입력해 주세요.']);
  });
  it('10220 영어: 대체 이수 가능', () => {
    expect(calc('10220', SUBJ.eng, 'remedial', null, { special_handling: 'substitutable', alt_program_done: true }).substituted).toBe(true);
  });
  it('10204 수학 추가 학습: 12 → 이수 가능', () => {
    const r = calc('10204', SUBJ.math, 'attendance', null);
    expect(r.credited).toBe(12);
    expect(r.completable).toBe(true);
  });
});
