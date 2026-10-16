'use client';
import { useState } from 'react';
import { PrintLayout } from '@/components/ui';
import { useRoster } from '@/components/RosterProvider';
import { downloadWorkbook } from '@/lib/excel';
import { fmt, recordText, type RowView } from './rows';

export type Sheet = {
  key: string;
  subjectName: string;
  grade: number | null;
  kindLabel: string;
  required: number;
  needToPass: number;
  students: string[];
  sessions: { date: string; methodLabel: string; attended: string[] }[];
};
export type MethodHours = { label: string; hours: number }[];

const CARDS = [
  ['attendance', '차시별 참여 출석부', '학교 양식 · 확인 교사 서명란'],
  ['neis', '나이스 입력 명단', '이수관리 메뉴 입력용'],
  ['committee1', '학관위 대상자 명단', '선정 심의 자료'],
  ['committee2', '학관위 이수 인정 명단', '결과 심의 자료'],
  ['consent', '참여 동의서', '학생·보호자 서명'],
  ['summary', '결과 보고서·통계', '과목별 이수율, 방법별 시수'],
] as const;
type Key = (typeof CARDS)[number][0];
const ROWS_PER_PAGE = 28;

const resultText = (r: RowView) =>
  r.result === 'passed' ? '이수' : r.result === 'failed' ? '미이수' : r.progress?.completable ? '확정 전(이수 가능)' : '확정 전';
const gradeText = (r: RowView) => (r.result === 'passed' ? (r.kind === 'remedial' ? 'E' : '원래 성취도') : '');
const gubun = (r: RowView) => (r.kind === 'remedial' || r.kind === 'prevention' ? '보장지도' : '추가학습');

export function ReportsView(p: { rows: RowView[]; sheets: Sheet[]; methodHours: MethodHours; termTitle: string; prevCapPct: number; emoCapPct: number; f2fMin: number }) {
  const { roster } = useRoster();
  const [report, setReport] = useState<Key>('attendance');
  const [sheetKey, setSheetKey] = useState(p.sheets[0]?.key ?? '');
  const sheet = p.sheets.find((s) => s.key === sheetKey) ?? p.sheets[0];
  const name = (no: string) => roster[no] ?? '';
  const hasRoster = Object.keys(roster).length > 0;
  const passedRows = p.rows.filter((r) => r.result === 'passed' || r.progress?.completable);
  const committeeDate = p.rows.find((r) => r.committeeDate)?.committeeDate ?? '';

  const bySubject = [...new Set(p.rows.map((r) => r.subjectName))].map((subject) => {
    const list = p.rows.filter((r) => r.subjectName === subject);
    const passed = list.filter((r) => r.result === 'passed').length;
    const failed = list.filter((r) => r.result === 'failed').length;
    return { subject, total: list.length, passed, failed, rate: list.length ? Math.round((passed / list.length) * 100) : 0 };
  });

  const exportExcel = () => {
    const file = `${p.termTitle} ${CARDS.find((c) => c[0] === report)![1]}.xlsx`;
    if (report === 'attendance' && sheet) {
      return downloadWorkbook(file, [{
        name: '출석부',
        rows: [
          ['번호', '학번', '이름', ...sheet.sessions.map((s, i) => `${i + 1}차시 ${s.date.slice(5)} ${s.methodLabel}`), '합계'],
          ...sheet.students.map((no, i) => {
            const marks = sheet.sessions.map((s) => (s.attended.includes(no) ? 1 : null));
            return [i + 1, no, name(no), ...marks, marks.filter(Boolean).length];
          }),
        ],
      }]);
    }
    if (report === 'summary') {
      return downloadWorkbook(file, [
        { name: '과목별 이수율', rows: [['과목', '대상', '이수', '미이수', '이수율(%)'], ...bySubject.map((s) => [s.subject, s.total, s.passed, s.failed, s.rate])] },
        { name: '방법별 시수', rows: [['방법', '시수'], ...p.methodHours.map((m) => [m.label, m.hours])] },
      ]);
    }
    const list = report === 'committee2' ? passedRows : p.rows;
    return downloadWorkbook(file, [{
      name: '명단',
      rows: [
        ['학번', '이름', '과목', '구분', '사유', '인정 시수', '이수 기준', '대면', '도달 판정', '결과', '성취도', '비고란', '동의서'],
        ...list.map((r) => [
          r.studentNo, name(r.studentNo), r.subjectName, gubun(r), r.reason,
          r.progress?.credited ?? null, r.progress?.needToPass ?? null,
          r.progress ? (r.progress.faceToFaceOk || r.progress.substituted ? 'O' : 'X') : '',
          r.reach === 'reached' ? '도달' : r.reach === 'not_reached' ? '미도달' : '', resultText(r), gradeText(r),
          r.result === 'failed' ? '미이수' : '', r.consent ? '회수' : '미회수',
        ]),
      ],
    }]);
  };

  const attendancePages = () => {
    if (!sheet) return <PrintLayout title="출석부"><p className="note">확정된 보충지도·추가 학습 대상자가 없어요.</p></PrintLayout>;
    const pages: string[][] = [];
    for (let i = 0; i < Math.max(sheet.students.length, 1); i += ROWS_PER_PAGE) pages.push(sheet.students.slice(i, i + ROWS_PER_PAGE));
    const title = `${p.termTitle} ${sheet.grade ?? ''}학년 ${sheet.subjectName} ${sheet.kindLabel} 참여 출석부`.replace('  ', ' ');
    return pages.map((studs, pageIdx) => (
      <PrintLayout key={pageIdx} title={pages.length > 1 ? `${title} (${pageIdx + 1}/${pages.length})` : title}>
        <div className="meta">
          <span>확인 교사: ________________ (서명 또는 인)</span>
          <span>필요 시수 {fmt(sheet.required)} · 이수 기준 {fmt(sheet.needToPass)}시수(2/3) · 대면 {fmt(p.f2fMin)}시수 이상</span>
        </div>
        <div className="b-scroll">
          <table>
            <thead>
              <tr>
                <th>번호</th><th>학번</th><th>이름</th>
                {sheet.sessions.map((s, i) => <th key={i}>{i + 1}차시<br />{s.date.slice(5)}<br />{s.methodLabel}</th>)}
                <th>합계</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: ROWS_PER_PAGE }, (_, i) => {
                const no = studs[i];
                const n = pageIdx * ROWS_PER_PAGE + i + 1;
                const marks = sheet.sessions.map((s) => (no && s.attended.includes(no) ? '1' : ''));
                return (
                  <tr key={i}>
                    <td>{n}</td><td>{no ?? ''}</td><td>{no ? name(no) : ''}</td>
                    {marks.map((m, j) => <td key={j}>{m}</td>)}
                    <td>{no ? marks.filter(Boolean).length : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="note">
          참여 1, 불참 빈칸. 예방지도는 필요 시수의 {p.prevCapPct}%, 학교 공통 정서 지원은 {p.emoCapPct}%까지 보충 시수로 인정합니다.
          {hasRoster ? '' : ' (명렬표를 불러오면 이름 칸이 채워져요)'}
        </p>
      </PrintLayout>
    ));
  };

  const listTable = (list: RowView[], cols: 'neis' | 'c1' | 'c2') => (
    <div className="b-scroll">
      <table>
        <thead>
          <tr>
            <th>학번</th><th>이름</th><th>과목</th><th>구분</th>
            {cols === 'neis' ? <><th>결과</th><th>성취도</th><th>비고란</th></> : null}
            {cols === 'c1' ? <><th>선정 사유</th><th>동의서</th></> : null}
            {cols === 'c2' ? <><th>인정 / 기준</th><th>대면</th><th>도달 판정</th><th>결과</th></> : null}
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.targetId}>
              <td>{r.studentNo}</td><td>{name(r.studentNo)}</td><td>{r.subjectName}</td><td>{gubun(r)}</td>
              {cols === 'neis' ? <><td>{resultText(r)}</td><td>{gradeText(r)}</td><td>{r.result === 'failed' ? '미이수' : ''}</td></> : null}
              {cols === 'c1' ? <><td>{r.reason}</td><td>{r.consent ? '회수' : '미회수'}</td></> : null}
              {cols === 'c2' ? (
                <>
                  <td>{r.progress ? `${fmt(r.progress.credited)} / ${fmt(r.progress.needToPass)}` : '—'}</td>
                  <td>{r.progress && (r.progress.faceToFaceOk || r.progress.substituted) ? 'O' : 'X'}</td>
                  <td>{r.kind !== 'remedial' ? '해당 없음' : r.progress?.substituted ? '대체' : r.reach === 'reached' ? '도달' : r.reach === 'not_reached' ? '미도달' : '미입력'}</td>
                  <td>{r.result === 'passed' ? '이수 확정' : '이수 가능'}</td>
                </>
              ) : null}
            </tr>
          ))}
          {!list.length ? <tr><td colSpan={7}>해당 학생이 없어요.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );

  const preview = () => {
    switch (report) {
      case 'attendance':
        return attendancePages();
      case 'neis':
        return (
          <PrintLayout title="나이스 입력 명단 · 최소 성취수준 보장지도(추가학습) 이수관리">
            {listTable(p.rows, 'neis')}
            <p className="note">이수 확정 전 학생은 &quot;확정 전&quot;으로 표시돼요. 이수 판정 화면에서 담당자가 확정하면 바뀌어요.</p>
          </PrintLayout>
        );
      case 'committee1':
        return (
          <PrintLayout title={`${p.termTitle} 최소 성취수준 보장지도 대상자 명단(학업성적관리위원회 심의)`}>
            {listTable(p.rows, 'c1')}
            <p className="note">보충지도: 원점수 기준 미달 학생 · 추가 학습: 출석률 2/3 미달 학생</p>
          </PrintLayout>
        );
      case 'committee2':
        return (
          <PrintLayout title={`${p.termTitle} 최소 성취수준 보장지도 이수 인정 명단(학업성적관리위원회 심의)`}>
            <div className="meta"><span>심의일: {committeeDate || '________'}</span><span>인정 기준: 총 운영 시수의 2/3 이상 · 대면 {fmt(p.f2fMin)}시수 이상</span></div>
            {listTable(passedRows, 'c2')}
          </PrintLayout>
        );
      case 'consent':
        return p.rows.length ? (
          p.rows.map((r) => (
            <PrintLayout key={r.targetId} title="최소 성취수준 보장지도 참여 동의서">
              <table>
                <tbody>
                  <tr><th>학번</th><td>{r.studentNo}</td><th>이름</th><td>{name(r.studentNo)}</td></tr>
                  <tr><th>과목</th><td>{r.subjectName}</td><th>운영 기간</th><td>{p.termTitle} 중</td></tr>
                </tbody>
              </table>
              <table style={{ marginTop: 12 }}>
                <thead><tr><th>예방지도</th><th>보충지도 · 추가 학습</th><th>창체 추가 학습</th></tr></thead>
                <tbody>
                  <tr>
                    <td>{r.kind === 'prevention' ? 'O' : ''}</td>
                    <td>{r.kind === 'remedial' || r.kind === 'attendance' ? 'O' : ''}</td>
                    <td>{r.kind === 'creative_attendance' ? 'O' : ''}</td>
                  </tr>
                </tbody>
              </table>
              <p className="note">
                위 학생은 학교의 최소 성취수준 보장지도에 참여합니다. 이수하려면 총 운영 시수의 2/3 이상 참여하고 대면지도 {fmt(p.f2fMin)}시수 이상을 받아야 해요.
                {r.progress ? ` 이 과목의 운영 시수는 ${fmt(r.progress.required)}시수, 이수 기준은 ${fmt(r.progress.needToPass)}시수예요.` : ''}
              </p>
              <div className="b-sign"><span>학생: __________ (서명)</span><span>보호자: __________ (서명)</span></div>
            </PrintLayout>
          ))
        ) : <PrintLayout title="참여 동의서"><p className="note">확정된 대상자가 없어요.</p></PrintLayout>;
      case 'summary':
        return (
          <PrintLayout title={`${p.termTitle} 최소 성취수준 보장지도 결과 보고`}>
            <div className="b-scroll">
              <table>
                <thead><tr><th>과목</th><th>대상</th><th>이수</th><th>미이수</th><th>이수율</th></tr></thead>
                <tbody>
                  {bySubject.map((s) => <tr key={s.subject}><td>{s.subject}</td><td>{s.total}</td><td>{s.passed}</td><td>{s.failed}</td><td>{s.rate}%</td></tr>)}
                </tbody>
              </table>
            </div>
            <table style={{ marginTop: 12 }}>
              <thead><tr><th>지도 방법</th><th>운영 시수(합계)</th></tr></thead>
              <tbody>{p.methodHours.map((m) => <tr key={m.label}><td>{m.label}</td><td>{fmt(m.hours)}</td></tr>)}</tbody>
            </table>
            <p className="note">이수 수는 담당자가 이수 판정에서 확정한 학생 기준이에요. 학년도 말에는 엑셀로 내보내 백업해 두세요.</p>
          </PrintLayout>
        );
    }
  };

  return (
    <>
      <div className="card no-print">
        <div className="b-report-cards">
          {CARDS.map(([k, t, d]) => (
            <button key={k} type="button" className={`b-rcard${report === k ? ' on' : ''}`} aria-pressed={report === k} onClick={() => setReport(k)}>
              <b>{t}</b><span>{d}</span>
            </button>
          ))}
        </div>
        {report === 'attendance' && p.sheets.length > 1 ? (
          <label className="row hint" htmlFor="r-sheet" style={{ gap: 6 }}>
            출석부 고르기
            <select id="r-sheet" value={sheet?.key} onChange={(e) => setSheetKey(e.target.value)}>
              {p.sheets.map((s) => <option key={s.key} value={s.key}>{s.subjectName} · {s.kindLabel}</option>)}
            </select>
          </label>
        ) : null}
        <div className="row">
          <button type="button" className="btn primary" onClick={() => window.print()}>PDF로 저장(인쇄)</button>
          <button type="button" className="btn" onClick={() => void exportExcel()}>엑셀로 내보내기</button>
          <span className="hint">이름은 이 컴퓨터의 명렬표에서 채워져 인쇄돼요. 서버에는 학번만 있어요.</span>
        </div>
      </div>
      {preview()}
    </>
  );
}
