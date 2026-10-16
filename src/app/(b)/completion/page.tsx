import { EmptyState, PageHeader } from '@/components/ui';
import { CompletionTable } from '@/components/b/CompletionTable';
import { toView } from '@/components/b/rows';
import { requireTeacher } from '@/lib/auth/requireTeacher';
import { loadB } from '@/lib/b/data';
import '@/components/b/b.css';

export const metadata = { title: '이수 판정' };

const todayKst = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

export default async function Page() {
  const { supabase, teacher } = await requireTeacher();
  const b = await loadB(supabase, teacher);
  const isAdmin = teacher.role === 'admin';
  return (
    <>
      <PageHeader group="지도하고 이수시킨다" title="이수 판정" />
      {b ? (
        <CompletionTable
          rows={b.rows.filter((r) => isAdmin || (r.subject && b.mySubjectIds.includes(r.subject.id))).map(toView)}
          isAdmin={isAdmin}
          defaultDate={b.rows.find((r) => r.completion?.committee_date)?.completion?.committee_date ?? todayKst()}
        />
      ) : (
        <EmptyState title="현재 학기가 설정되지 않았어요" />
      )}
    </>
  );
}
