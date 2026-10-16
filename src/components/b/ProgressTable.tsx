'use client';
import { useState } from 'react';
import { StudentName } from '@/components/StudentName';
import { HoursBar } from '@/components/ui';
import { StatusBadge, WarnList } from './StatusBadge';
import { fmt, type RowView } from './rows';

export function ProgressTable({ rows, prevCapPct, emoCapPct, scopeNote }: { rows: RowView[]; prevCapPct: number; emoCapPct: number; scopeNote: string }) {
  const [warnOnly, setWarnOnly] = useState(false);
  const list = warnOnly ? rows.filter((r) => !r.progress?.completable) : rows;
  return (
    <div className="card">
      <div className="row">
        <div className="b-legend">
          <span><i className="d" />보충 직접</span>
          <span><i className="p" />예방(한도 {prevCapPct}%)</span>
          <span><i className="e" />정서 지원(한도 {emoCapPct}%, 여러 과목 중복)</span>
          <span><i className="need" />이수 기준 2/3</span>
        </div>
        <span className="spacer" />
        <button type="button" className={`toggle${warnOnly ? ' on' : ''}`} aria-pressed={warnOnly} onClick={() => setWarnOnly((v) => !v)}>
          경고 있는 학생만
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>학생</th><th>과목·종류</th><th>시수</th><th>인정 / 기준</th><th>대면</th><th>상태</th></tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const p = r.progress;
              return (
                <tr key={r.targetId}>
                  <td><StudentName studentNo={r.studentNo} /></td>
                  <td>{r.subjectName}<div className="hint">{r.kindLabel}</div></td>
                  <td>
                    {p ? (
                      <>
                        <HoursBar required={p.required} needToPass={p.needToPass} direct={p.direct} preventionCredited={p.preventionCredited} emotionalCredited={p.emotionalCredited} />
                        <div className="hint">
                          보충 {fmt(p.direct)} · 예방 {fmt(p.preventionCredited)}
                          {p.prevention > p.preventionCredited ? `(${fmt(p.prevention)} 중)` : ''} · 정서 {fmt(p.emotionalCredited)}
                        </div>
                      </>
                    ) : <span className="hint">과목이 없어 계산하지 않아요</span>}
                  </td>
                  <td className="num">
                    {p ? <>{fmt(p.credited)} / {fmt(p.needToPass)}<div className="hint">필요 {fmt(p.required)}</div></> : '—'}
                  </td>
                  <td>
                    {!p ? '—' : p.substituted ? <span className="hint">대체</span> : p.faceToFaceOk ? <span className="badge ok">{fmt(p.faceToFace)}시수</span> : <span className="badge danger">없음</span>}
                  </td>
                  <td className="wrap"><StatusBadge p={p} /><WarnList p={p} /></td>
                </tr>
              );
            })}
            {!list.length ? (
              <tr><td colSpan={6} className="hint">{warnOnly ? '경고 있는 학생이 없어요.' : '확정된 대상자가 없어요. 대상자 선정에서 확정되면 여기에 나타나요.'}</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="hint">{scopeNote}을 보여요. 기준 숫자는 학기·기준값 설정에서 바꾸면 바로 반영돼요.</p>
    </div>
  );
}
