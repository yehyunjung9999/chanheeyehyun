'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_GROUPS, type NavItem } from '@/config/nav-types';
import { signOut } from '@/app/(shared)/actions';
import { RosterButton } from './RosterButton';
import { RosterProvider } from './RosterProvider';
import { ToastProvider } from './ToastProvider';

// 파트 0 소유. 왼쪽(좁은 화면은 위쪽) 메뉴 + 위쪽 도구 + 푸터. 모양은 docs/mockup과 같다.
export function AppShell(props: {
  nav: NavItem[];
  teacherName: string;
  roleLabel: string;
  termLabel: string;
  schoolYear: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <ToastProvider>
      <RosterProvider schoolYear={props.schoolYear}>
        <div className="app">
          <aside className="side" aria-label="메뉴">
            <Link className="logo" href="/dashboard">
              <b>보장지도 매니저</b>
              <span>{props.termLabel}</span>
            </Link>
            {NAV_GROUPS.map((group) => {
              const items = props.nav.filter((i) => i.group === group);
              if (!items.length) return null;
              return (
                <nav className="navgroup" key={group} aria-label={group}>
                  <h4>{group}</h4>
                  {items.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link key={item.href} href={item.href} className={`navitem${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
                        {item.star ? '★ ' : ''}
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              );
            })}
            <div className="side-foot">
              <span>dorms-check 기준 적용</span>
              <span>개발용 가짜 데이터로만 시험해요</span>
            </div>
          </aside>
          <div className="main">
            <div className="topbar no-print">
              <span className="who">
                {props.teacherName} · {props.roleLabel}
              </span>
              <RosterButton />
              <form action={signOut}>
                <button className="btn small" type="submit">
                  로그아웃
                </button>
              </form>
            </div>
            <main className="view">{props.children}</main>
            <footer className="foot">
              <Link href="/privacy">개인정보처리방침</Link>
              <Link href="/terms">이용약관</Link>
              <span>문의: 학교 최소 성취수준 보장지도 담당 교사</span>
              <span>충남교육청 2026 학업성적관리 시행지침 기준</span>
            </footer>
          </div>
        </div>
      </RosterProvider>
    </ToastProvider>
  );
}
