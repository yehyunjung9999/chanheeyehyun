import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTeacher } from '@/lib/auth/requireTeacher';
import { signOut } from '../actions';

export const metadata: Metadata = { title: '승인 대기' };

export default async function PendingPage() {
  const { user, teacher } = await getTeacher();
  if (!user) redirect('/login');
  if (teacher?.approved) redirect('/dashboard');
  return (
    <div className="narrow card">
      <h1>승인 대기 중이에요</h1>
      <p>
        <b>{user.email}</b> 계정으로 로그인했어요. 담당 선생님이 승인하면 바로 쓸 수 있어요.
      </p>
      <p className="hint">담당 선생님께 &quot;보장지도 매니저 승인해 주세요&quot;라고 알려 주세요. 승인 후 이 화면을 새로고침하면 돼요.</p>
      <form action={signOut}>
        <button className="btn" type="submit">
          로그아웃
        </button>
      </form>
    </div>
  );
}
