import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import './globals.css';
import { AppShell } from '@/components/AppShell';
import { navA } from '@/config/nav-a';
import { navB } from '@/config/nav-b';
import { getTeacher } from '@/lib/auth/requireTeacher';
import { getCurrentTerm, termLabel } from '@/lib/settings';

// 파트 0 소유
export const metadata: Metadata = {
  title: { default: '보장지도 매니저', template: '%s · 보장지도 매니저' },
  description: '직업계고 최소 성취수준 보장지도(예방·보충지도) 업무를 한곳에서 처리하는 교사용 웹앱',
  robots: { index: false, follow: false },
  openGraph: { title: '보장지도 매니저', description: '직업계고 최소 성취수준 보장지도 매니저(교사 전용)' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await headers(); // 요청마다 그려서 CSP nonce가 적용되게 한다.
  const { supabase, teacher } = await getTeacher();

  if (teacher?.approved) {
    const { term } = await getCurrentTerm(supabase);
    const nav = [...navA, ...navB]
      .filter((item) => !item.adminOnly || teacher.role === 'admin')
      .sort((a, b) => a.order - b.order);
    return (
      <html lang="ko">
        <body>
          <AppShell
            nav={nav}
            teacherName={teacher.display_name ?? teacher.email ?? '선생님'}
            roleLabel={teacher.role === 'admin' ? '담당자' : '교과 교사'}
            termLabel={termLabel(term)}
            schoolYear={term?.school_year ?? new Date().getFullYear()}
          >
            {children}
          </AppShell>
        </body>
      </html>
    );
  }

  return (
    <html lang="ko">
      <body>
        <div className="plain">
          <main className="plain-main">{children}</main>
          <footer className="foot">
            <Link href="/privacy">개인정보처리방침</Link>
            <Link href="/terms">이용약관</Link>
            <span>보장지도 매니저 · 교사 전용</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
