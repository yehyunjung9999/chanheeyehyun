'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { StudentName } from '@/components/StudentName';
import { useToast } from '@/components/ToastProvider';
import { confirmCompletable, setReach, undoCompletion } from '@/lib/b/actions';
import { StatusBadge } from './StatusBadge';
import { fmt, recordText, type RowView } from './rows';

export function CompletionTable({ rows, isAdmin, defaultDate }: { rows: RowView[]; isAdmin: boolean; defaultDate: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [date, setDate] = useState(defaultDate);
  const okCount = rows.filter((r) => r.progress?.completable && r.result !== 'passed').length;

  const run = (fn: () => Promise<{ ok: boolean; message?: string }>) =>
    start(async () => {
      const r = await fn();
      toast(r.message ?? '', r.ok ? 'info' : 'error');
      if (r.ok) router.refresh();
    });

  return (
    <div className="card">
      <div className="row">
        <label className="row hint" htmlFor="c-date" style={{ gap: 6 }}>
          학관위 심의일
          <input id="c-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={!isAdmin} />
        </label>
        <span className="spacer" />
        <button type="button" className="btn primary" disabled={!isAdmin || !okCount || pending} onClick={() => run(() => confirmCompletable(date))}>
          이수 가능 {okCount}명 확정
        </button>
      </div>
      {isAdmin ? null : <p className="hint">확정은 담당자만 할 수 있어요. 교과 교사는 도달 판정을 입력해요.</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>학생</th><th>과목·종류</th><th>인정 / 기준</th><th>대면</th><th>도달 판정</th><th>상태</th><th>생기부 처리</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const p = r.progress;
              const locked = r.result !== 'pending';
              return (
                <tr key={r.targetId}>
                  <td><StudentName studentNo={r.studentNo} /></td>
                  <td>{r.subjectName}<div className="hint">{r.kindLabel}</div></td>
                  <td className="num">{p ? `${fmt(p.credited)} / ${fmt(p.needToPass)}` : '—'}</td>
                  <td>{p && (p.faceToFaceOk || p.substituted) ? '✓' : '✗'}</td>
                  <td>
                    {r.kind !== 'remedial' ? (
                      <span className="hint">해당 없음(추가 학습)</span>
                    ) : p?.substituted ? (
                      <span className="hint">대체 이수</span>
                    ) : (
                      <select
                        aria-label="도달 판정"
                        value={r.reach ?? ''}
                        disabled={pending || locked}
                        onChange={(e) => run(() => setReach(r.targetId, (e.target.value || null) as 'reached' | null))}
                      >
                        <option value="">미입력</option>
                        <option value="reached">도달</option>
                        <option value="not_reached">미도달</option>
                      </select>
                    )}
                  </td>
                  <td>
                    {r.result === 'passed' ? (
                      <span className="row" style={{ gap: 6 }}>
                        <span className="badge ok">이수 확정</span>
                        {isAdmin ? (
                          <button type="button" className="btn small" disabled={pending} onClick={() => run(() => undoCompletion(r.targetId))}>취소</button>
                        ) : null}
                      </span>
                    ) : r.result === 'failed' ? (
                      <span className="badge danger">미이수</span>
                    ) : (
                      <StatusBadge p={p} />
                    )}
                  </td>
                  <td className="hint">{recordText(r)}</td>
                </tr>
              );
            })}
            {!rows.length ? <tr><td colSpan={7} className="hint">확정된 대상자가 없어요.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <p className="hint">
        확정 후 나이스 「최소 성취수준 보장지도(추가학습) 이수관리」에서 이수 처리·학점 반영·마감을 해야 생기부에 성적이 보여요.
        입력용 명단은 출력물에서 뽑을 수 있어요. 이수 기준을 채우지 못한 학생은 확정되지 않아요.
      </p>
    </div>
  );
}
