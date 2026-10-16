// 파트 0 소유. 메뉴 항목 모양(PRD 8.4). 각 파트는 nav-a.ts / nav-b.ts에만 메뉴를 넣는다.
export type NavGroup = '한눈에' | '대상자를 찾는다' | '지도하고 이수시킨다' | '관리';
export const NAV_GROUPS: NavGroup[] = ['한눈에', '대상자를 찾는다', '지도하고 이수시킨다', '관리'];
export type NavItem = { href: string; label: string; group: NavGroup; order: number; adminOnly?: boolean; star?: boolean };
