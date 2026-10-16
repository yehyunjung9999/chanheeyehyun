import { EmptyState, PageHeader } from '@/components/ui';
import { ProgressTable } from '@/components/b/ProgressTable';
import { toView } from '@/components/b/rows';
import { requireTeacher } from '@/lib/auth/requireTeacher';
import { loadB } from '@/lib/b/data';
import '@/components/b/b.css';

export const metadata = { title: '진행 현황' };

export default async function Page() {
  const { supabase, teacher } = await requireTeacher();
  const b = await loadB(supabase, teacher);
  return (
    <>
      <PageHeader group="지도하고 이수시킨다" title="진행 현황" />
      {b ? (
        <ProgressTable
          rows={b.rows.filter((r) => teacher.role === 'admin' || (r.subject && b.mySubjectIds.includes(r.subject.id))).map(toView)}
          prevCapPct={Math.round(Number(b.settings.prevention_cap_ratio) * 100)}
          emoCapPct={Math.round(Number(b.settings.emotional_cap_ratio) * 100)}
          scopeNote={b.myScopeNote}
        />
      ) : (
        <EmptyState title="현재 학기가 설정되지 않았어요" />
      )}
    </>
  );
}
