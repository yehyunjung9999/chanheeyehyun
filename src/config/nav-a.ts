// 파트 A 메뉴 (주인: 파트 A)
import type { NavItem } from './nav-types';

export const navA: NavItem[] = [
  { href: '/dashboard', label: '전교 현황', group: '한눈에', order: 1 },
  { href: '/subjects', label: '과목·평가 계획', group: '대상자를 찾는다', order: 10 },
  { href: '/students', label: '학생·수강 편성', group: '대상자를 찾는다', order: 11 },
  { href: '/scores', label: '성적·출결 올리기', group: '대상자를 찾는다', order: 12 },
  { href: '/risk', label: '위험군 판별·진단', group: '대상자를 찾는다', order: 13 },
  { href: '/targets', label: '대상자 선정', group: '대상자를 찾는다', order: 14 },
  { href: '/worksheets', label: 'AI 보충 활동지', group: '대상자를 찾는다', order: 15 },
  { href: '/admin/settings', label: '학기·기준값 설정', group: '관리', order: 90, adminOnly: true },
  { href: '/admin/teachers', label: '교사 승인', group: '관리', order: 91, adminOnly: true },
];
