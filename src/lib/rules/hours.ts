// 시수 규칙 (주인: 파트 B, PRD 제2부 4.5·4.6·8.2). 파트 0이 시그니처와 빈 구현만 만들어 둔다.
// 파트 B가 computeProgress를 완성한다. 그 전까지는 null을 돌려주고, 화면은 "B 연결 대기"를 보여 준다.
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
  void args; // TODO(파트 B): PRD 4.5 규칙대로 구현(시수는 2배 정수로 계산). 12.2 테스트 통과.
  return null;
}
