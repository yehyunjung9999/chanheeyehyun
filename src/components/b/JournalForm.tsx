'use client';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { StudentName } from '@/components/StudentName';
import { useToast } from '@/components/ToastProvider';
import { addPhrase, deleteSession, saveSession } from '@/lib/b/actions';
import { KIND_LABEL, METHOD_LABEL, type AttendanceStatus, type SessionKind, type SessionMethod } from '@/lib/types';

export type Pool = { id: string; no: string }[];
export type JournalProps = {
  subjects: { id: string; name: string }[];
  /** 과목 id(과목 없는 종류는 'none') → 종류 → 출석 후보 */
  pools: Record<string, Partial<Record<SessionKind, Pool>>>;
  phrases: string[];
  last: Record<string, { kind: SessionKind; method: SessionMethod; content: string }>;
  today: string;
  edit?: {
    id: string; subject_id: string | null; kind: SessionKind; method: SessionMethod; held_on: string;
    period_label: string; hours: number; content: string; attendance: { id: string; no: string; status: AttendanceStatus }[];
  };
};

const KINDS: SessionKind[] = ['prevention', 'remedial', 'attendance', 'creative_attendance', 'emotional_common'];
const METHODS = Object.keys(METHOD_LABEL) as SessionMethod[];
const PERIODS = ['점심', '7교시', '8교시', '방과후', '방학'];
const ST_LABEL: Record<AttendanceStatus, string> = { present: '출석', late: '지각', absent: '결석' };
const NEXT: Record<AttendanceStatus, AttendanceStatus> = { present: 'late', late: 'absent', absent: 'present' };
const noSubject = (k: SessionKind) => k === 'emotional_common' || k === 'creative_attendance';

export function JournalForm(p: JournalProps) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const e = p.edit;
  const [subjectId, setSubjectId] = useState(e?.subject_id ?? p.subjects[0]?.id ?? '');
  const [kind, setKind] = useState<SessionKind>(e?.kind ?? 'remedial');
  const [method, setMethod] = useState<SessionMethod>(e?.method ?? 'face_to_face');
  const [date, setDate] = useState(e?.held_on ?? p.today);
  const [period, setPeriod] = useState(e?.period_label ?? '7교시');
  const [hours, setHours] = useState(e?.hours ?? 1);
  const [content, setContent] = useState(e?.content ?? '');
  const [att, setAtt] = useState<Record<string, AttendanceStatus>>(
    Object.fromEntries((e?.attendance ?? []).map((a) => [a.id, a.status])),
  );

  const students = useMemo(() => {
    const pool = p.pools[noSubject(kind) ? 'none' : subjectId]?.[kind] ?? [];
    // 고치는 중이면 원래 출석 학생도 빠지지 않게 합친다
    const extra = (e && e.kind === kind && (e.subject_id ?? 'none') === (noSubject(kind) ? 'none' : subjectId) ? e.attendance : [])
      .filter((a) => !pool.some((x) => x.id === a.id));
    return [...pool, ...extra.map(({ id, no }) => ({ id, no }))];
  }, [p.pools, kind, subjectId, e]);

  const statusOf = (id: string) => att[id] ?? 'present';
  const changeTargetSet = (fn: () => void) => {
    fn();
    setAtt({});
  };

  const loadLast = () => {
    const l = p.last[noSubject(kind) ? 'none' : subjectId];
    if (!l) return toast('불러올 지난 차시가 없어요.');
    setContent(l.content);
    setMethod(l.method);
    if (l.kind !== 'emotional_common' && l.kind !== kind) changeTargetSet(() => setKind(l.kind));
    toast('지난 차시 내용을 불러왔어요. 날짜는 그대로예요.');
  };

  const save = () =>
    start(async () => {
      const r = await saveSession({
        id: e?.id,
        subject_id: noSubject(kind) ? null : subjectId || null,
        kind,
        method: kind === 'emotional_common' ? 'emotional' : method,
        held_on: date,
        period_label: period,
        hours,
        content,
        attendance: students.map((s) => ({ student_id: s.id, status: statusOf(s.id) })),
      });
      toast(r.message ?? '', r.ok ? 'info' : 'error');
      if (!r.ok) return;
      if (e) router.push('/journal');
      else {
        setContent('');
        setAtt({});
        router.refresh();
      }
    });

  const remove = () => {
    if (!e || !window.confirm('이 일지를 지울까요? 시수가 다시 계산돼요.')) return;
    start(async () => {
      const r = await deleteSession(e.id);
      toast(r.message ?? '', r.ok ? 'info' : 'error');
      if (r.ok) router.push('/journal');
    });
  };

  const savePhrase = () =>
    start(async () => {
      const r = await addPhrase(content);
      toast(r.message ?? '', r.ok ? 'info' : 'error');
      if (r.ok) router.refresh();
    });

  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });

  return (
    <div className="b-phone">
      <div className="ph-head">
        <b>{e ? '일지 고치기' : '운영 일지'}</b>
        <span className="hint">{dateLabel}</span>
      </div>

      <div className="field">
        <label htmlFor="j-subj">과목</label>
        {noSubject(kind) ? (
          <select id="j-subj" disabled><option>과목 없음(학교 공통)</option></select>
        ) : p.subjects.length ? (
          <select id="j-subj" value={subjectId} onChange={(ev) => changeTargetSet(() => setSubjectId(ev.target.value))}>
            {p.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        ) : (
          <span className="hint">담당 과목이 없어요. 담당자에게 과목 지정을 요청해 주세요.</span>
        )}
      </div>

      <div className="field">
        <span className="lab">종류</span>
        <div className="chips">
          {KINDS.map((k) => (
            <button key={k} type="button" className={`chip${kind === k ? ' on' : ''}`} aria-pressed={kind === k} onClick={() => changeTargetSet(() => setKind(k))}>
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      {kind !== 'emotional_common' ? (
        <div className="field">
          <span className="lab">방법</span>
          <div className="chips">
            {METHODS.map((m) => (
              <button key={m} type="button" className={`chip${method === m ? ' on' : ''}`} aria-pressed={method === m} onClick={() => setMethod(m)}>
                {METHOD_LABEL[m]}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="j-date">날짜</label>
        <input id="j-date" type="date" value={date} onChange={(ev) => setDate(ev.target.value)} />
      </div>

      <div className="field">
        <span className="lab">교시</span>
        <div className="chips">
          {PERIODS.map((x) => (
            <button key={x} type="button" className={`chip${period === x ? ' on' : ''}`} aria-pressed={period === x} onClick={() => setPeriod(x)}>
              {x}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="lab">시수</span>
        <div className="b-stepper">
          <button type="button" aria-label="시수 줄이기" onClick={() => setHours((h) => Math.max(0.5, h - 0.5))}>−</button>
          <span className="num" aria-live="polite">{hours}</span>
          <button type="button" aria-label="시수 늘리기" onClick={() => setHours((h) => Math.min(8, h + 0.5))}>＋</button>
          <span className="hint">0.5 단위</span>
        </div>
      </div>

      <div className="field">
        <span className="lab">출석 · 기본은 전원 출석, 누르면 바뀌어요</span>
        <div className="b-att">
          {students.length ? (
            students.map((s) => (
              <button key={s.id} type="button" onClick={() => setAtt((a) => ({ ...a, [s.id]: NEXT[statusOf(s.id)] }))}>
                <StudentName studentNo={s.no} />
                <span className={`b-st ${statusOf(s.id)}`}>{ST_LABEL[statusOf(s.id)]}</span>
              </button>
            ))
          ) : (
            <span className="hint">
              {kind === 'prevention' ? '이 과목의 위험·주의 학생이 없어요.' : '이 과목·종류의 확정 대상자가 없어요.'}
            </span>
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor="j-content">지도 내용</label>
        <div className="row">
          <button type="button" className="btn small" onClick={loadLast}>지난 차시 불러오기</button>
          {content.trim() && content.trim().length <= 60 ? (
            <button type="button" className="btn small" onClick={savePhrase} disabled={pending}>자주 쓰는 문장으로 저장</button>
          ) : null}
        </div>
        <div className="chips">
          {p.phrases.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => setContent((c) => (c ? `${c}, ${s}` : s))}>
              + {s}
            </button>
          ))}
        </div>
        <textarea id="j-content" value={content} onChange={(ev) => setContent(ev.target.value)} placeholder="오늘 지도한 내용" maxLength={2000} />
      </div>

      <button type="button" className="btn primary b-save" onClick={save} disabled={pending || !students.length}>
        {pending ? '저장하는 중…' : e ? '고친 내용 저장' : '일지 저장'}
      </button>
      {e ? (
        <button type="button" className="btn danger" onClick={remove} disabled={pending}>이 일지 지우기</button>
      ) : null}
    </div>
  );
}
