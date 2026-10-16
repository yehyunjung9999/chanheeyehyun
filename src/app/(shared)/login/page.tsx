import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = { title: '로그인' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="narrow stack">
      <div>
        <div className="crumb">교사 전용</div>
        <h1>보장지도 매니저</h1>
        <p className="hint">직업계고 최소 성취수준 보장지도 업무를 한곳에서 처리해요. 학교 선생님만 쓸 수 있고, 처음 로그인하면 담당 선생님의 승인이 필요해요.</p>
      </div>
      <LoginForm failed={Boolean(error)} />
    </div>
  );
}
