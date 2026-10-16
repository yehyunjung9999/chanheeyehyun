// 시수 규칙 (주인: 파트 B, PRD 제2부 4.5·4.6·8.2). 시수는 0.5 단위라서 모두 2배 한 정수로 계산한다.
import type {
  CompletionResult, GuidanceTarget, Session, SessionAttendance, Settings, Student, Subject,
} from '@/lib/types';

export function requiredHours(subject: Subject, settings: Settings): number {
  if (subject.required_hours_override != null) return Number(subject.required_hours_override);
  const perCredit = subject.category === 'vocational' ? settings.hours_per_credit_vocational : settings.hours_per_credit_general;
  return Number(subject.credits) * Number(perCredit);
}

export type Progress = {
  required: number;
  needToPass: number;
  direct: number;
  faceToFace: number;
  prevention: number;
  preventionCredited: number;
  emotional: number;
  emotionalCredited: number;
  credited: number;
  remainingToPass: number;
  ratioOk: boolean;
  faceToFaceOk: boolean;
  reachOk: boolean;
  reachNeeded: boolean;
  substituted: boolean;
  completable: boolean;
  warnings: { text: string; soft?: boolean }[];
};

const half = (x: number) => Math.round(Number(x) * 2); // 시수 → 2배 정수
const fromHalf = (h: number) => h / 2;

export function computeProgress(args: {
  target: GuidanceTarget;
  subject: Subject | null;
  student: Student;
  sessions: Session[];
  attendance: SessionAttendance[];
  emotionalCommon: { session: Session; att: SessionAttendance }[];
  settings: Settings;
  completion: CompletionResult | null;
}): Progress | null {
  const { target, subject, student, sessions, attendance, emotionalCommon, settings, completion } = args;
  if (!subject) return null; // 과목 없는 대상(창체 추가 학습)은 기준 시수를 정할 수 없다

  const req2 = half(requiredHours(subject, settings));
  const num = Number(settings.pass_ratio_num);
  const den = Number(settings.pass_ratio_den);
  const need2 = Math.ceil((req2 * num) / den - 1e-9);
  // 한도는 0.5 단위로 내림(1e-9: 0.1 같은 비율의 부동소수 오차 보정)
  const prevCap2 = Math.floor(req2 * Number(settings.prevention_cap_ratio) + 1e-9);
  const emoCap2 = Math.floor(req2 * Number(settings.emotional_cap_ratio) + 1e-9);

  const attBySession = new Map<string, SessionAttendance>();
  for (const a of attendance) if (a.student_id === target.student_id) attBySession.set(a.session_id, a);

  let direct2 = 0, f2f2 = 0, prev2 = 0, emo2 = 0;
  for (const s of sessions) {
    if (s.subject_id !== subject.id || s.kind === 'emotional_common') continue;
    if (s.kind !== 'prevention' && s.kind !== target.kind) continue;
    const a = attBySession.get(s.id);
    if (!a) continue;
    const h2 = half(a.credited_hours);
    if (s.method === 'emotional') emo2 += h2; // 정서 지원은 종류와 상관없이 정서 한도로 인정
    else if (s.kind === 'prevention') prev2 += h2;
    else {
      direct2 += h2;
      if (s.method === 'face_to_face') f2f2 += h2;
    }
  }
  if (settings.emotional_shared_across_subjects) {
    for (const { session, att } of emotionalCommon) {
      if (session.kind === 'emotional_common' && att.student_id === target.student_id) emo2 += half(att.credited_hours);
    }
  }

  const prevCredited2 = Math.min(prev2, prevCap2);
  const emoCredited2 = Math.min(emo2, emoCap2);
  const credited2 = direct2 + prevCredited2 + emoCredited2;

  const reachNeeded = target.kind === 'remedial' && settings.require_reach_judgment;
  const reach = completion?.reach_judgment ?? null;
  const reachOk = !reachNeeded || reach === 'reached';
  const ratioOk = credited2 * den >= req2 * num;
  const faceToFaceOk = f2f2 >= half(settings.face_to_face_min_hours);
  const substituted = student.special_handling === 'substitutable' && student.alt_program_done;
  const completable = substituted || (ratioOk && faceToFaceOk && reachOk);

  const warnings: Progress['warnings'] = [];
  if (!substituted) {
    if (!faceToFaceOk) warnings.push({ text: `대면지도 시수가 없습니다(${Number(settings.face_to_face_min_hours)}시수 이상 필요).` });
    if (!ratioOk) warnings.push({ text: `이수 기준까지 ${fromHalf(need2 - credited2)}시수 남았습니다.` });
    if (prev2 > prevCap2) warnings.push({ text: `예방지도는 한도 ${fromHalf(prevCap2)}시수까지만 인정됩니다.`, soft: true });
    if (emo2 > emoCap2) warnings.push({ text: `정서 지원은 한도 ${fromHalf(emoCap2)}시수까지만 인정됩니다.`, soft: true });
    if (reachNeeded && reach === null) warnings.push({ text: '도달 판정을 입력해 주세요.' });
    if (reachNeeded && reach === 'not_reached') warnings.push({ text: '도달 판정이 미도달입니다.' });
  }

  return {
    required: fromHalf(req2),
    needToPass: fromHalf(need2),
    direct: fromHalf(direct2),
    faceToFace: fromHalf(f2f2),
    prevention: fromHalf(prev2),
    preventionCredited: fromHalf(prevCredited2),
    emotional: fromHalf(emo2),
    emotionalCredited: fromHalf(emoCredited2),
    credited: fromHalf(credited2),
    remainingToPass: fromHalf(Math.max(0, need2 - credited2)),
    ratioOk, faceToFaceOk, reachOk, reachNeeded, substituted, completable,
    warnings,
  };
}
