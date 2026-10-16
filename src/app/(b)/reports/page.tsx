import { EmptyState, PageHeader } from '@/components/ui';
import { ReportsView, type Sheet } from '@/components/b/ReportsView';
import { toView } from '@/components/b/rows';
import { requireTeacher } from '@/lib/auth/requireTeacher';
import { loadB } from '@/lib/b/data';
import { termLabel } from '@/lib/settings';
import { KIND_LABEL, METHOD_LABEL, type SessionMethod } from '@/lib/types';
import '@/components/b/b.css';

export const metadata = { title: '출력물' };

export default async function Page() {
  const { supabase, teacher } = await requireTeacher();
  const b = await loadB(supabase, teacher);
  if (!b) {
    return (
      <>
        <PageHeader group="지도하고 이수시킨다" title="출력물" />
        <EmptyState title="현재 학기가 설정되지 않았어요" />
      </>
    );
  }
  const isAdmin = teacher.role === 'admin';
  const rows = b.rows.filter((r) => isAdmin || (r.subject && b.mySubjectIds.includes(r.subject.id)));

  // 출석부: 과목 × 종류(보충지도·추가 학습)마다 한 장
  const noOf = new Map([...b.students].map(([id, s]) => [id, s.student_no]));
  const sheets: Sheet[] = [];
  for (const r of rows) {
    if (!r.subject || !r.progress) continue;
    const key = `${r.subject.id}:${r.target.kind}`;
    let sheet = sheets.find((s) => s.key === key);
    if (!sheet) {
      const subjectId = r.subject.id;
      const kind = r.target.kind;
      sheet = {
        key, subjectName: r.subject.name, grade: r.subject.grade, kindLabel: KIND_LABEL[kind],
        required: r.progress.required, needToPass: r.progress.needToPass, students: [],
        sessions: b.sessions
          .filter((s) => s.subject_id === subjectId && s.kind === kind)
          .sort((x, y) => x.held_on.localeCompare(y.held_on))
          .map((s) => ({
            date: s.held_on,
            methodLabel: METHOD_LABEL[s.method],
            attended: b.attendance.filter((a) => a.session_id === s.id && a.status !== 'absent').map((a) => noOf.get(a.student_id) ?? '?'),
          })),
      };
      sheets.push(sheet);
    }
    sheet.students.push(r.studentNo);
  }

  const visibleSessions = b.sessions.filter((s) => isAdmin || s.subject_id === null || b.mySubjectIds.includes(s.subject_id));
  const hoursBy = new Map<SessionMethod, number>();
  for (const s of visibleSessions) hoursBy.set(s.method, (hoursBy.get(s.method) ?? 0) + Number(s.hours));
  const methodHours = [...hoursBy].map(([m, h]) => ({ label: METHOD_LABEL[m], hours: h }));

  return (
    <>
      <PageHeader group="지도하고 이수시킨다" title="출력물" />
      <ReportsView
        rows={rows.map(toView)}
        sheets={sheets}
        methodHours={methodHours}
        termTitle={termLabel(b.term)}
        prevCapPct={Math.round(Number(b.settings.prevention_cap_ratio) * 100)}
        emoCapPct={Math.round(Number(b.settings.emotional_cap_ratio) * 100)}
        f2fMin={Number(b.settings.face_to_face_min_hours)}
      />
    </>
  );
}
