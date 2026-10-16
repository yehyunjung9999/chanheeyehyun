// 파트 B 메뉴 (주인: 파트 B)
import type { NavItem } from './nav-types';

export const navB: NavItem[] = [
  { href: '/journal', label: '운영 일지 쓰기', group: '지도하고 이수시킨다', order: 20, star: true },
  { href: '/progress', label: '진행 현황', group: '지도하고 이수시킨다', order: 21 },
  { href: '/completion', label: '이수 판정', group: '지도하고 이수시킨다', order: 22 },
  { href: '/reports', label: '출력물', group: '지도하고 이수시킨다', order: 23 },
];
