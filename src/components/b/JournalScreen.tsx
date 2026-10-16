import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EmptyState, PageHeader, fmtNum } from '@/components/ui';
import { requireTeacher } from '@/lib/auth/requireTeacher';
import { loadB, preventionPool } from '@/lib/b/data';
import { KIND_LABEL, METHOD_LABEL, type Session, type SessionKind } from '@/lib/types';
import { JournalForm, type JournalProps, type Pool } from './JournalForm';
import './b.css';

const DEFAULT_PHRASES = ['중심 내용 찾기 연습', '보충 활동지 풀이 후 개별 피드백', 'EBSi 강좌 수강 확인', '오답 다시 풀기'];

const todayKst = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

// 운영 일지(B1) 화면. /journal, /journal/new, /journal/[id]가 함께 쓴다.
export async function JournalScreen({ editId }: { editId?: string }) {
  const { supabase, teacher } = await requireTeacher();
  const b = await loadB(supabase, teacher);
  if (!b) {
    return (
      <>
        <PageHeader group="지도하고 이수시킨다" title="★ 운영 일지 쓰기" />
        <EmptyState title="현재 학기가 설정되지 않았어요">
          <span className="hint">담당자가 학기·기준값 설정에서 학기를 만들면 일지를 쓸 수 있어요.</span>
        </EmptyState>
      </>
    );
  }

  const editing = editId ? b.sessions.find((s) => s.id === editId) : undefined;
  if (editId && !editing) notFound();

  const isAdmin = teacher.role === 'admin';
  const mySubjects = b.subjects.filter((s) => b.mySubjectIds.includes(s.id));
  const nos = new Map([...b.students].map(([id, s]) => [id, s.student_no]));
  const noOf = (id: string) => nos.get(id) ?? '?';
  const toPool = (ids: string[]): Pool => [...new Set(ids)].map((id) => ({ id, no: noOf(id) })).sort((x, y) => x.no.localeCompare(y.no));

  // 출석 후보: 확정 대상자(과목·종류별), 예방지도는 위험·주의 학생과 예방 대상, 학교 공통 정서는 전체 확정 대상자
  const confirmed = b.rows.map((r) => r.target);
  const pools: JournalProps['pools'] = {};
  for (const s of mySubjects) {
    const prevIds = await preventionPool(supabase, s, b.settings, b.term.id);
    const missing = prevIds.filter((id) => !nos.has(id));
    if (missing.length) {
      const { data } = await supabase.from('students').select('id, student_no').in('id', missing);
      for (const st of data ?? []) nos.set(st.id as string, st.student_no as string);
    }
    pools[s.id] = {
      prevention: toPool(prevIds),
      remedial: toPool(confirmed.filter((t) => t.subject_id === s.id && t.kind === 'remedial').map((t) => t.student_id)),
      attendance: toPool(confirmed.filter((t) => t.subject_id === s.id && t.kind === 'attendance').map((t) => t.student_id)),
    };
  }
  pools.none = {
    creative_attendance: toPool(confirmed.filter((t) => t.kind === 'creative_attendance').map((t) => t.student_id)),
    emotional_common: toPool(confirmed.map((t) => t.student_id)),
  };

  const { data: phraseRows } = await supabase.from('phrase_snippets').select('text').eq('teacher_id', teacher.id).order('sort_order');
  const phrases = phraseRows?.length ? phraseRows.map((p) => p.text as string) : DEFAULT_PHRASES;

  const last: JournalProps['last'] = {};
  for (const s of [...b.sessions].sort((x, y) => x.held_on.localeCompare(y.held_on))) {
    last[s.subject_id ?? 'none'] = { kind: s.kind, method: s.method, content: s.content };
  }

  const attBySession = new Map<string, { status: string; student_id: string }[]>();
  for (const a of b.attendance) {
    const list = attBySession.get(a.session_id) ?? [];
    list.push(a);
    attBySession.set(a.session_id, list);
  }
  const canEdit = (s: Session) => s.teacher_id === teacher.id || isAdmin;
  const mine = b.sessions
    .filter((s) => s.teacher_id === teacher.id || (isAdmin && s.teacher_id === null))
    .sort((x, y) => y.held_on.localeCompare(x.held_on))
    .slice(0, 12);

  const editAtt = editing ? Object.fromEntries((attBySession.get(editing.id) ?? []).map((a) => [a.student_id, a.status])) : undefined;

  const form: JournalProps = {
    subjects: mySubjects.map((s) => ({ id: s.id, name: s.name })),
    pools,
    phrases,
    last,
    today: todayKst(),
    edit: editing
      ? {
          id: editing.id, subject_id: editing.subject_id, kind: editing.kind, method: editing.method, held_on: editing.held_on,
          period_label: editing.period_label, hours: Number(editing.hours), content: editing.content,
          attendance: Object.entries(editAtt ?? {}).map(([id, status]) => ({ id, no: noOf(id), status: status as 'present' })),
        }
      : undefined,
  };

  return (
    <>
      <PageHeader group="지도하고 이수시킨다" title={editing ? '운영 일지 고치기' : '★ 운영 일지 쓰기'} />
      <div className="b-journal-wrap">
        <JournalForm {...form} key={editing?.id ?? 'new'} />
        <div className="card">
          <h2>내 최근 일지</h2>
          {mine.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>날짜</th><th>과목</th><th>종류</th><th>방법</th><th>시수</th><th>출석</th><th /></tr>
                </thead>
                <tbody>
                  {mine.map((s) => {
                    const att = attBySession.get(s.id) ?? [];
                    return (
                      <tr key={s.id} className={s.id === editing?.id ? 'selected' : undefined}>
                        <td className="num">{s.held_on.slice(5)}</td>
                        <td>{b.subjects.find((x) => x.id === s.subject_id)?.name ?? '학교 공통'}</td>
                        <td>{KIND_LABEL[s.kind as SessionKind]}</td>
                        <td>{METHOD_LABEL[s.method]}</td>
                        <td className="num">{fmtNum(Number(s.hours))}</td>
                        <td className="num">{att.filter((a) => a.status !== 'absent').length}/{att.length}</td>
                        <td>{canEdit(s) ? <Link className="btn small" href={`/journal/${s.id}`}>고치기</Link> : null}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="hint">아직 쓴 일지가 없어요. 왼쪽에서 첫 일지를 써 보세요.</p>
          )}
          <p className="hint">저장하면 시수와 경고가 바로 다시 계산돼요.</p>
          <div className="row">
            <Link className="btn" href="/progress">진행 현황 보기</Link>
            {editing ? <Link className="btn" href="/journal">새 일지 쓰기</Link> : null}
          </div>
        </div>
      </div>
    </>
  );
}
