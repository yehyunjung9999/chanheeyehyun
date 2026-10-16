'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { loadRoster, ROSTER_EVENT, type Roster } from '@/lib/roster';

// 파트 0 소유. 이 컴퓨터에 저장된 명렬표를 화면 전체에 나눠 준다.
const RosterContext = createContext<{ schoolYear: number; roster: Roster }>({ schoolYear: 0, roster: {} });

export function RosterProvider({ schoolYear, children }: { schoolYear: number; children: React.ReactNode }) {
  const [roster, setRoster] = useState<Roster>({});
  useEffect(() => {
    const load = () => setRoster(loadRoster(schoolYear));
    load();
    window.addEventListener(ROSTER_EVENT, load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener(ROSTER_EVENT, load);
      window.removeEventListener('storage', load);
    };
  }, [schoolYear]);
  return <RosterContext.Provider value={{ schoolYear, roster }}>{children}</RosterContext.Provider>;
}

export function useRoster() {
  return useContext(RosterContext);
}
