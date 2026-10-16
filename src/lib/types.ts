// 공유 타입과 화면용 이름표 (파트 0 소유, PRD 제2부 7장·8.1). 두 파트는 이 타입만 쓴다.

export type Role = 'admin' | 'teacher';
export type SubjectCategory = 'common' | 'elective' | 'vocational' | 'liberal' | 'creative';
export type GradingScale = 'five' | 'three';
export type AssessmentKind = 'diagnostic' | 'performance' | 'exam';
export type AbsenceType = '인정결' | '질병결' | '미인정결' | '기타결';
export type SpecialHandling = 'none' | 'exempt' | 'exempt_no_extra' | 'substitutable';
export type RiskLevel = 'danger' | 'caution' | 'normal';
export type CauseTag = 'basic_skills' | 'motivation' | 'attendance_life' | 'emotional' | 'language' | 'practical_skill';
export type TargetKind = 'prevention' | 'remedial' | 'attendance' | 'creative_attendance';
export type TargetStatus = 'candidate' | 'checked' | 'excluded' | 'confirmed';
export type SessionKind = TargetKind | 'emotional_common';
export type SessionMethod =
  | 'face_to_face' | 'after_school' | 'online_content' | 'assignment'
  | 'mentoring' | 'in_class' | 'emotional' | 'external_program';
export type AttendanceStatus = 'present' | 'late' | 'absent';
export type ReachJudgment = 'reached' | 'not_reached';
export type CompletionResultValue = 'pending' | 'passed' | 'failed';

export interface Teacher {
  id: string;
  email: string | null;
  display_name: string | null;
  role: Role;
  approved: boolean;
  created_at: string;
}

export interface Term {
  id: string;
  school_year: number;
  semester: number;
  starts_on: string | null;
  ends_on: string | null;
  prevention_start: string | null;
  prevention_end: string | null;
  remedial_start: string | null;
  remedial_end: string | null;
  school_council_approved: boolean;
  is_current: boolean;
}

export interface Settings {
  term_id: string;
  hours_per_credit_general: number;
  hours_per_credit_vocational: number;
  sessions_per_credit: number;
  pass_ratio_num: number;
  pass_ratio_den: number;
  face_to_face_min_hours: number;
  prevention_cap_ratio: number;
  emotional_cap_ratio: number;
  emotional_shared_across_subjects: boolean;
  require_reach_judgment: boolean;
  risk_danger_below: number;
  risk_caution_below: number;
  absence_warning_ratio: number;
  ai_monthly_limit_krw: number;
  ai_price_input_per_mtok_krw: number | null;
  ai_price_output_per_mtok_krw: number | null;
}

export interface Subject {
  id: string;
  term_id: string;
  name: string;
  grade: number;
  department: string | null;
  credits: number;
  category: SubjectCategory;
  grading_scale: GradingScale;
  applies_achievement_rule: boolean;
  required_hours_override: number | null;
  teacher_id: string | null;
}

export interface AchievementStandard {
  id: string;
  subject_id: string;
  code: string;
  description: string;
  sort_order: number;
}

export interface AssessmentItem {
  id: string;
  subject_id: string;
  name: string;
  kind: AssessmentKind;
  max_score: number;
  weight_percent: number;
  counts_toward_final: boolean;
  sort_order: number;
}

export interface Student {
  id: string;
  school_year: number;
  student_no: string;
  grade: number;
  class_no: number;
  number: number;
  department: string | null;
  special_handling: SpecialHandling;
  alt_program_done: boolean;
}

export interface Enrollment {
  student_id: string;
  subject_id: string;
}

export interface Score {
  id: string;
  student_id: string;
  assessment_item_id: string;
  score: number | null;
  absence_type: AbsenceType | null;
}

export interface SubjectAttendance {
  student_id: string;
  subject_id: string;
  absences: number;
  as_of: string | null;
}

export interface Diagnosis {
  student_id: string;
  subject_id: string;
  weak_standard_codes: string[];
  causes: CauseTag[];
  memo: string;
}

export interface GuidanceTarget {
  id: string;
  term_id: string;
  student_id: string;
  subject_id: string | null;
  kind: TargetKind;
  status: TargetStatus;
  reason: string;
  projected_score: number | null;
  excluded_reason: string | null;
  consent_received: boolean;
  checked_by: string | null;
  checked_at: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
}

export interface Session {
  id: string;
  term_id: string;
  subject_id: string | null;
  kind: SessionKind;
  method: SessionMethod;
  held_on: string;
  period_label: string;
  hours: number;
  content: string;
  teacher_id: string | null;
}

export interface SessionAttendance {
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  credited_hours: number;
}

export interface PhraseSnippet {
  id: string;
  teacher_id: string;
  text: string;
  sort_order: number;
}

export interface CompletionResult {
  id: string;
  target_id: string;
  reach_judgment: ReachJudgment | null;
  reach_method: string | null;
  retest_score: number | null;
  result: CompletionResultValue;
  committee_date: string | null;
  decided_by: string | null;
  decided_at: string | null;
  neis_done: boolean;
}

export interface Worksheet {
  id: string;
  subject_id: string | null;
  title: string;
  standard_codes: string[];
  level: 'basic' | 'standard';
  causes: CauseTag[];
  content_md: string;
  source: 'ai' | 'manual';
  created_by: string | null;
  is_shared: boolean;
  created_at: string;
}

export interface AiUsage {
  id: string;
  teacher_id: string | null;
  input_tokens: number;
  output_tokens: number;
  est_cost_krw: number;
  created_at: string;
}

// ── 화면에 보이는 이름 ──
export const CATEGORY_LABEL: Record<SubjectCategory, string> = {
  common: '공통', elective: '선택', vocational: '전문교과', liberal: '교양', creative: '창체',
};
export const ASSESSMENT_KIND_LABEL: Record<AssessmentKind, string> = {
  diagnostic: '진단', performance: '수행', exam: '지필',
};
export const HANDLING_LABEL: Record<SpecialHandling, string> = {
  none: '일반',
  exempt: '제외(성취율 미적용)',
  exempt_no_extra: '제외(추가 학습 없음)',
  substitutable: '대체 가능',
};
export const RISK_LABEL: Record<RiskLevel, string> = { danger: '위험', caution: '주의', normal: '정상' };
export const CAUSE_LABEL: Record<CauseTag, string> = {
  basic_skills: '기초학력', motivation: '동기·태도', attendance_life: '출결·생활',
  emotional: '정서·심리', language: '언어', practical_skill: '실습 기능',
};
export const KIND_LABEL: Record<SessionKind, string> = {
  prevention: '예방지도', remedial: '보충지도', attendance: '추가 학습',
  creative_attendance: '창체 추가 학습', emotional_common: '학교 공통 정서 지원',
};
export const TARGET_STATUS_LABEL: Record<TargetStatus, string> = {
  candidate: '후보', checked: '교과 확인', excluded: '제외', confirmed: '확정 · 지도 중',
};
export const METHOD_LABEL: Record<SessionMethod, string> = {
  face_to_face: '대면', after_school: '방과후', online_content: 'EBSi 등 온라인', assignment: '보충과제',
  mentoring: '학습멘토링', in_class: '수업시간 별도 지도', emotional: '정서 지원', external_program: '타 프로그램',
};
export const ABSENCE_TYPES: AbsenceType[] = ['인정결', '질병결', '미인정결', '기타결'];
