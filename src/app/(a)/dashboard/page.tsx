import { KpiTile, PageHeader } from '@/components/ui';
import { requireTeacher } from '@/lib/auth/requireTeacher';
import { getCurrentTerm, termLabel } from '@/lib/settings';

export const metadata = { title: '전교 현황' };

// 파트 0이 만든 임시 화면: 가짜 데이터가 잘 들어왔는지 개수만 보여 준다. 파트 A(A9)에서 완성한다.
export default async function DashboardPage() {
  const { supabase } = await requireTeacher();
  const { term } = await getCurrentTerm(supabase);
  const count = async (table: string, filter?: [string, string]) => {
    let q = supabase.from(table).select('*', { count: 'exact', head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    const { count: n } = await q;
    return n ?? 0;
  };
  const [students, subjects, confirmed, sessions] = await Promise.all([
    count('students'),
    count('subjects'),
    count('guidance_targets', ['status', 'confirmed']),
    count('sessions'),
  ]);
  return (
    <>
      <PageHeader group="한눈에" title="전교 현황" />
      <div className="kpis">
        <KpiTile tone="info" label="학생(학번만 저장)" value={students} unit="명" hint={termLabel(term)} />
        <KpiTile tone="info" label="과목" value={subjects} unit="개" />
        <KpiTile tone="ok" label="보장지도 확정 대상" value={confirmed} unit="건" />
        <KpiTile tone="warn" label="운영 일지" value={sessions} unit="건" />
      </div>
      <p className="notice">
        공통 기반(파트 0)이 준비됐어요. 위 숫자는 개발용 <b>가짜 데이터</b>예요. 이 화면은 파트 A(A9)에서 목업처럼 완성해요.
      </p>
    </>
  );
}
