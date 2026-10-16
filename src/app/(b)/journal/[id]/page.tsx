import { notFound } from 'next/navigation';
import { JournalScreen } from '@/components/b/JournalScreen';

export const metadata = { title: '운영 일지 고치기' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  return <JournalScreen editId={id} />;
}
