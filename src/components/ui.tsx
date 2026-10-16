// 파트 0 소유. 공통 화면 부품(서버·클라이언트 어디서나 사용). 모양은 globals.css의 클래스를 따른다.
import type { RiskLevel } from '@/lib/types';
import { RISK_LABEL } from '@/lib/types';

export function PageHeader({ group, title, children }: { group: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <div className="crumb">{group}</div>
        <h1>{title}</h1>
      </div>
      {children ? <div className="row">{children}</div> : null}
    </div>
  );
}

export function KpiTile(props: { tone: 'danger' | 'ok' | 'warn' | 'info'; label: string; value: React.ReactNode; unit?: string; hint?: React.ReactNode }) {
  return (
    <div className={`kpi ${props.tone}`}>
      <span className="label">{props.label}</span>
      <span className="value">
        {props.value}
        {props.unit ? <small> {props.unit}</small> : null}
      </span>
      {props.hint ? <span className="hint">{props.hint}</span> : null}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="card empty">
      <b>{title}</b>
      {children}
    </div>
  );
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const icon = level === 'danger' ? '🔴' : level === 'caution' ? '🟡' : '🟢';
  return (
    <span className={`badge ${level}`}>
      <span aria-hidden>{icon}</span>
      {RISK_LABEL[level]}
    </span>
  );
}

// 시수 막대: 직접(주황) · 예방(파랑) · 정서(초록) + 이수 기준선(빨간 점선)
export function HoursBar(props: { required: number; needToPass: number; direct: number; preventionCredited: number; emotionalCredited: number }) {
  const credited = props.direct + props.preventionCredited + props.emotionalCredited;
  const max = Math.max(props.required, credited) * 1.05 || 1;
  const pc = (v: number) => `${((v / max) * 100).toFixed(2)}%`;
  return (
    <div className="hbar" role="img" aria-label={`인정 ${credited}시수, 이수 기준 ${props.needToPass}시수`}>
      <span className="d" style={{ width: pc(props.direct) }} />
      <span className="p" style={{ width: pc(props.preventionCredited) }} />
      <span className="e" style={{ width: pc(props.emotionalCredited) }} />
      <i className="need" style={{ left: pc(props.needToPass) }} />
    </div>
  );
}

// A4 인쇄용 틀. 브라우저의 "인쇄 → PDF로 저장"으로 저장한다.
export function PrintLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="a4">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export const fmtNum = (n: number | null | undefined) => (n == null ? '—' : String(Math.round(Number(n) * 10) / 10));
