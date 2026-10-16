import 'server-only';
import type { ServerSupabase } from '@/lib/supabase/server';
import { fetchAll } from '@/lib/supabase/fetchAll';
import { getCurrentTerm } from '@/lib/settings';
import { computeProgress, type Progress } from '@/lib/rules/hours';
import { computeScore, riskLevel } from '@/lib/rules/scoring';
import type {
  AssessmentItem, CompletionResult, GuidanceTarget, Score, Session, SessionAttendance,
  Settings, Student, Subject, SubjectAttendance, Teacher, Term,
} from '@/lib/types';

// 파트 B 화면이 함께 쓰는 데이터 읽기. 학생은 학번만 다룬다(이름은 화면의 StudentName이 채움).

export type ProgressRow = {
  target: GuidanceTarget;
  studentNo: string;
  subject: Subject | null;
  progress: Progress | null;
  completion: CompletionResult | null;
};

export type BData = {
  term: Term;
  settings: Settings;
  subjects: Subject[];
  /** 교과 교사가 볼 과목. 담당 과목이 지정되지 않았으면 전체 과목 */
  mySubjectIds: string[];
  myScopeNote: string;
  students: Map<string, Student>;
  sessions: Session[];
  attendance: SessionAttendance[];
  rows: ProgressRow[];
};

export async function loadB(supabase: ServerSupabase, teacher: Teacher): Promise<BData | null> {
  const { term, settings } = await getCurrentTerm(supabase);
  if (!term || !settings) return null;

  const [{ data: subjects }, { data: targets }, sessions] = await Promise.all([
    supabase.from('subjects').select('*').eq('term_id', term.id).order('grade').order('name'),
    supabase.from('guidance_targets').select('*').eq('term_id', term.id).eq('status', 'confirmed'),
    fetchAll<Session>((from, to) => supabase.from('sessions').select('*').eq('term_id', term.id).order('held_on').order('id').range(from, to)),
  ]);
  const subjectList = (subjects ?? []) as Subject[];
  const targetList = (targets ?? []) as GuidanceTarget[];

  const sessionIds = new Set(sessions.map((s) => s.id));
  const attendance = (
    await fetchAll<SessionAttendance>((from, to) => supabase.from('session_attendance').select('*').order('session_id').order('student_id').range(from, to))
  ).filter((a) => sessionIds.has(a.session_id));

  const studentIds = [...new Set([...targetList.map((t) => t.student_id), ...attendance.map((a) => a.student_id)])];
  const students = new Map<string, Student>();
  for (let i = 0; i < studentIds.length; i += 200) {
    const { data } = await supabase.from('students').select('*').in('id', studentIds.slice(i, i + 200));
    for (const s of (data ?? []) as Student[]) students.set(s.id, s);
  }

  const targetIds = targetList.map((t) => t.id);
  const completions = new Map<string, CompletionResult>();
  for (let i = 0; i < targetIds.length; i += 200) {
    const { data } = await supabase.from('completion_results').select('*').in('target_id', targetIds.slice(i, i + 200));
    for (const c of (data ?? []) as CompletionResult[]) completions.set(c.target_id, c);
  }

  const owned = subjectList.filter((s) => s.teacher_id === teacher.id).map((s) => s.id);
  const isAdmin = teacher.role === 'admin';
  const mySubjectIds = isAdmin || owned.length === 0 ? subjectList.map((s) => s.id) : owned;
  const myScopeNote = isAdmin
    ? '전체 과목'
    : owned.length
      ? '내 과목만'
      : '담당 과목이 아직 지정되지 않아 전체 과목';

  const subjectById = new Map(subjectList.map((s) => [s.id, s]));
  const sessionById = new Map(sessions.map((s) => [s.id, s]));
  const emotionalCommon = attendance
    .filter((a) => sessionById.get(a.session_id)?.kind === 'emotional_common')
    .map((att) => ({ session: sessionById.get(att.session_id)!, att }));

  const rows: ProgressRow[] = targetList
    .map((target) => {
      const student = students.get(target.student_id);
      const subject = target.subject_id ? subjectById.get(target.subject_id) ?? null : null;
      const completion = completions.get(target.id) ?? null;
      const progress = student
        ? computeProgress({ target, subject, student, sessions, attendance, emotionalCommon, settings, completion })
        : null;
      return { target, studentNo: student?.student_no ?? '?', subject, progress, completion };
    })
    .sort((a, b) => (a.subject?.name ?? '').localeCompare(b.subject?.name ?? '') || a.studentNo.localeCompare(b.studentNo));

  return { term, settings, subjects: subjectList, mySubjectIds, myScopeNote, students, sessions, attendance, rows };
}

/** 예방지도 출석 후보: 그 과목의 위험·주의 학생과 예방지도 대상(희망자 포함) */
export async function preventionPool(supabase: ServerSupabase, subject: Subject, settings: Settings, termId: string) {
  const ids = new Set<string>();
  const { data: preTargets } = await supabase
    .from('guidance_targets').select('student_id, status').eq('term_id', termId).eq('subject_id', subject.id).eq('kind', 'prevention');
  for (const t of preTargets ?? []) if (t.status !== 'excluded') ids.add(t.student_id as string);

  const [{ data: items }, { data: enrolls }, { data: absences }] = await Promise.all([
    supabase.from('assessment_items').select('*').eq('subject_id', subject.id),
    supabase.from('enrollments').select('student_id').eq('subject_id', subject.id),
    supabase.from('subject_attendance').select('*').eq('subject_id', subject.id),
  ]);
  const itemList = (items ?? []) as AssessmentItem[];
  const itemIds = itemList.map((i) => i.id);
  const scores = itemIds.length
    ? await fetchAll<Score>((from, to) => supabase.from('scores').select('*').in('assessment_item_id', itemIds).order('id').range(from, to))
    : [];
  const absenceBy = new Map(((absences ?? []) as SubjectAttendance[]).map((a) => [a.student_id, Number(a.absences)]));
  for (const e of enrolls ?? []) {
    const sid = e.student_id as string;
    const { projectedRaw } = computeScore(itemList, scores.filter((s) => s.student_id === sid));
    const { level } = riskLevel({
      projectedRaw, absences: absenceBy.get(sid) ?? 0, credits: subject.credits,
      appliesAchievement: subject.applies_achievement_rule, settings,
    });
    if (level !== 'normal') ids.add(sid);
  }
  return [...ids];
}

export function revalidateB(revalidate: (path: string) => void) {
  for (const p of ['/journal', '/progress', '/completion', '/reports', '/dashboard']) revalidate(p);
}
